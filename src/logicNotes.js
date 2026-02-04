function parseCamlLogic(notes) {
  if (!notes) return empty();
  const lines = notes.split(/\r?\n/).map(l => l.trim());
  const start = lines.findIndex(l => l.toUpperCase() === "CAML_LOGIC");
  const body = start >= 0 ? lines.slice(start + 1) : lines;

  const out = empty();
  for (const line of body) {
    if (!line || !line.includes(":")) continue;
    const [k, ...rest] = line.split(":");
    const key = k.toLowerCase().trim();
    const value = rest.join(":").trim();
    if (out[key]) out[key].push(value);
    else out.other.push(line);
  }
  return out;
}

function empty() {
  return {
    occurs_if: [],
    scene_goal: [],
    choices: [],
    checks: [],
    outcomes: [],
    failure: [],
    modifiers: [],
    other: []
  };
}

module.exports = { parseCamlLogic };
