const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { once } = require("node:events");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("metadata dropdowns preserve add/edit and serialization behavior", {
  timeout: 60000,
}, async (t) => {
  const browserPath = process.env.BROWSER_PATH || [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
  ].find((candidate) => fs.existsSync(candidate));
  assert.ok(browserPath, "Set BROWSER_PATH to a Chromium-based browser executable");
  assert.equal(typeof WebSocket, "function", "Run with Node.js 22 or newer");

  const dataset = JSON.parse(fs.readFileSync(path.join(root, "words.json"), "utf8"));
  dataset.push(
    { word: "Legacy fixture", meaning: "legacy", partOfSpeech: "noun", category: "feeling" },
    { word: "Extended fixture", meaning: "extended", partOfSpeech: "Phrase", category: "Custom theme" }
  );
  const server = http.createServer((request, response) => {
    const files = {
      "/": ["index.html", "text/html"],
      "/styles.css": ["styles.css", "text/css"],
      "/app.js": ["app.js", "text/javascript"],
    };
    if (request.url === "/words.json") {
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify(dataset));
      return;
    }
    const file = files[request.url];
    if (!file) {
      response.writeHead(404).end();
      return;
    }
    let body = fs.readFileSync(path.join(root, file[0]), "utf8");
    if (request.url === "/app.js") {
      body = body.replace("  loadWords();", `
  window.metadataTest = { openWordForm, getWords: () => words };
  loadWords();`);
    }
    response.setHeader("Content-Type", file[1]);
    response.end(body);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "wordlist-browser-"));
  const browser = spawn(browserPath, [
    "--headless", "--disable-gpu", "--no-first-run",
    "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"] });
  t.after(async () => {
    const exited = once(browser, "exit");
    browser.kill();
    await exited;
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  });
  const endpoint = await new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => reject(new Error("Browser debugging startup timed out")), 15000);
    browser.once("error", (error) => { clearTimeout(timer); reject(error); });
    browser.stderr.on("data", (chunk) => {
      output += chunk;
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  const targets = await (await fetch(`http://${new URL(endpoint).host}/json/list`)).json();
  const socket = new WebSocket(targets.find((target) => target.type === "page").webSocketDebuggerUrl);
  await once(socket, "open");
  t.after(() => socket.close());
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (!pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  });
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await command("Runtime.evaluate", {
      expression, returnByValue: true, awaitPromise: true,
    });
    assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await command("Page.navigate", { url: `http://127.0.0.1:${server.address().port}/` });
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    ready = await evaluate("Boolean(window.metadataTest && metadataTest.getWords().length)");
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.ok(ready, "Application loads the dataset");
  await evaluate(`
    window.field = (id) => document.getElementById(id);
    window.openEntry = (name) => metadataTest.openWordForm(
      name ? metadataTest.getWords().find(w => w.word === name) : null);
    window.saveEntry = () => field("wordForm").requestSubmit();
  `);

  await t.test("native dropdowns include defaults and exact legacy values without mutating data", async () => {
    const before = await evaluate("JSON.stringify(metadataTest.getWords())");
    const controls = await evaluate(`(() => {
      openEntry("Legacy fixture");
      return ["fPartOfSpeech", "fCategory"].map(id => ({
        tag: field(id).tagName, value: field(id).value,
        values: Array.from(field(id).options, o => o.value),
        blankEnabled: !field(id).options[0].disabled,
        required: field(id).required
      }));
    })()`);
    assert.equal(controls[0].tag, "SELECT");
    assert.equal(controls[1].tag, "SELECT");
    assert.equal(controls[0].value, "noun");
    assert.equal(controls[1].value, "feeling");
    assert.ok(controls[0].values.includes("Determiner"));
    assert.ok(controls[0].values.includes("Phrase"));
    assert.ok(controls[1].values.includes("Custom theme"));
    for (const control of controls) {
      assert.equal(control.values[0], "");
      assert.equal(control.blankEnabled, true);
      assert.equal(control.required, false);
      assert.equal(new Set(control.values).size, control.values.length);
    }
    assert.equal(await evaluate("JSON.stringify(metadataTest.getWords())"), before);
    await evaluate("saveEntry()");
    const legacy = await evaluate('metadataTest.getWords().find(w => w.word === "Legacy fixture")');
    assert.equal(legacy.partOfSpeech, "noun");
    assert.equal(legacy.category, "feeling");
  });

  await t.test("additional dataset choices survive editing", async () => {
    await evaluate('openEntry("Extended fixture"); saveEntry()');
    const entry = await evaluate('metadataTest.getWords().find(w => w.word === "Extended fixture")');
    assert.equal(entry.partOfSpeech, "Phrase");
    assert.equal(entry.category, "Custom theme");
  });

  await t.test("Add resets metadata and supports both blank and selected values", async () => {
    await evaluate('openEntry("Extended fixture"); openEntry()');
    assert.deepEqual(await evaluate('[field("fPartOfSpeech").value, field("fCategory").value]'), ["", ""]);
    await evaluate('field("fWord").value="Blank fixture"; field("fMeaning").value="blank"; saveEntry()');
    let entry = await evaluate('metadataTest.getWords().find(w => w.word === "Blank fixture")');
    assert.equal(entry.partOfSpeech, "");
    assert.equal(entry.category, "");
    await evaluate(`openEntry(); field("fWord").value="Selected fixture";
      field("fMeaning").value="selected"; field("fPartOfSpeech").value="Pronoun";
      field("fCategory").value="Social"; saveEntry()`);
    entry = await evaluate('metadataTest.getWords().find(w => w.word === "Selected fixture")');
    assert.equal(entry.partOfSpeech, "Pronoun");
    assert.equal(entry.category, "Social");
  });

  await t.test("keyboard selection and existing select styles work in the browser", async () => {
    await evaluate('openEntry("Selected fixture")');
    for (const id of ["fPartOfSpeech", "fCategory"]) {
      await evaluate(`field("${id}").focus()`);
      for (const [key, code] of [["Home", 36], ["ArrowDown", 40]]) {
        await command("Input.dispatchKeyEvent", { type: "keyDown", key, code: key, windowsVirtualKeyCode: code });
        await command("Input.dispatchKeyEvent", { type: "keyUp", key, code: key, windowsVirtualKeyCode: code });
      }
      assert.notEqual(await evaluate(`field("${id}").value`), "");
      assert.equal(await evaluate('document.activeElement.id'), id);
    }
    assert.equal(await evaluate(`["fPartOfSpeech", "fCategory"].every(id => {
      const style = getComputedStyle(field(id));
      const difficulty = getComputedStyle(field("fDifficulty"));
      return field(id).getBoundingClientRect().width > 0 &&
        style.padding === difficulty.padding && style.borderRadius === difficulty.borderRadius;
    })`), true);
    await evaluate('field("fPartOfSpeech").value=""; field("fCategory").value=""; saveEntry()');
    const entry = await evaluate('metadataTest.getWords().find(w => w.word === "Selected fixture")');
    assert.equal(entry.partOfSpeech, "");
    assert.equal(entry.category, "");
  });

  await t.test("export and mocked GitHub publish retain selected metadata", async () => {
    await evaluate(`openEntry("Selected fixture"); field("fPartOfSpeech").value="Pronoun";
      field("fCategory").value="Social"; saveEntry();
      window.exportedBlob = null;
      URL.createObjectURL = blob => { window.exportedBlob = blob; return "blob:test"; };
      URL.revokeObjectURL = () => {};
      HTMLAnchorElement.prototype.click = function() {};
      field("exportBtn").click();`);
    const exported = await evaluate("exportedBlob.text().then(JSON.parse)");
    const exportedWord = exported.find(w => w.word === "Selected fixture");
    assert.equal(exportedWord.partOfSpeech, "Pronoun");
    assert.equal(exportedWord.category, "Social");
    await evaluate(`window.fetch = async (url, options) => {
      if (!url.startsWith("https://api.github.com/")) throw new Error("Unexpected request");
      if (options.method === "PUT") {
        window.publishedWords = JSON.parse(new TextDecoder().decode(
          Uint8Array.from(atob(JSON.parse(options.body).content), c => c.charCodeAt(0))));
        return new Response("{}", {status:200});
      }
      return new Response('{"sha":"fixture-sha"}', {status:200});
    };
    field("publishBtn").click();
    field("tokenInput").value="test-placeholder-not-a-credential";
    field("tokenSubmitBtn").click();`);
    let published;
    for (let attempt = 0; attempt < 100; attempt++) {
      published = await evaluate("window.publishedWords");
      if (published) break;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    assert.deepEqual(published, exported);
  });
});
