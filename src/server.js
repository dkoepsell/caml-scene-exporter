const express = require("express");
const multer = require("multer");
const { validateCaml } = require("./camlSchema");
const { buildScenes, renderScene, filename } = require("./render");
const { buildZip } = require("./zip");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_, res) => res.json({ ok: true }));

app.post("/export/scene-cards", async (req, res) => {
  try {
    const caml = validateCaml(req.body);
    const scenes = buildScenes(caml);
    const files = scenes.map(s => ({ name: filename(s), content: renderScene(s) }));
    files.unshift({
      name: "index.md",
      content: scenes.map(s => `- ${filename(s)}`).join("\n")
    });
    const zip = await buildZip(files);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=scene-cards.zip");
    res.send(zip);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/export/scene-cards/upload", upload.single("file"), async (req, res) => {
  try {
    const caml = JSON.parse(req.file.buffer.toString("utf8"));
    req.body = caml;
    return app._router.handle(req, res, () => {});
  } catch {
    res.status(400).json({ error: "Invalid upload" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CAML Scene Exporter running on ${PORT}`));
