const archiver = require("archiver");

function buildZip(files) {
  return new Promise((resolve, reject) => {
    const zip = archiver("zip", { zlib: { level: 9 } });
    const chunks = [];
    zip.on("data", c => chunks.push(c));
    zip.on("end", () => resolve(Buffer.concat(chunks)));
    zip.on("error", reject);
    for (const f of files) zip.append(f.content, { name: f.name });
    zip.finalize();
  });
}

module.exports = { buildZip };
