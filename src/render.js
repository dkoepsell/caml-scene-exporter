const slugify = require("slugify");
const { parseCamlLogic } = require("./logicNotes");

function buildScenes(caml) {
  const transitions = caml.transitions?.changes || [];
  const byProcess = {};
  for (const t of transitions) {
    if (!byProcess[t.caused_by]) byProcess[t.caused_by] = [];
    byProcess[t.caused_by].push(t);
  }

  return caml.processes.catalog.map((p, i) => ({
    order: i + 1,
    id: p.id,
    title: p.id.replace(/^PROC[_-]*/i, "").replace(/_/g, " "),
    location: p.location || "—",
    participants: p.participants || [],
    timebox: p.timebox?.label || "",
    logic: parseCamlLogic(p.notes),
    transitions: byProcess[p.id] || []
  }));
}

function renderScene(scene) {
  const L = [];
  L.push(`# Scene ${scene.order}: ${scene.title}`);
  if (scene.location) L.push(`**Location:** ${scene.location}`);
  if (scene.participants.length) L.push(`**Participants:** ${scene.participants.join(", ")}`);
  if (scene.timebox) L.push(`**Timebox:** ${scene.timebox}`);
  L.push("");

  section(L, "When to run", scene.logic.occurs_if, "Fits campaign pacing.");
  section(L, "Scene goal", scene.logic.scene_goal);
  section(L, "Player choices", scene.logic.choices);
  section(L, "Checks & risks", scene.logic.checks);
  section(L, "Modifiers", scene.logic.modifiers);
  section(L, "Outcomes", scene.logic.outcomes);
  section(L, "Failure", scene.logic.failure);

  if (scene.transitions.length) {
    L.push("## State changes");
    for (const t of scene.transitions) {
      L.push(`- ${t.id}`);
      for (const op of t.ops || []) {
        if (op.op === "update_state") {
          L.push(`  - ${op.state_id} → ${JSON.stringify(op.value)}`);
        }
      }
    }
  }
  return L.join("\n") + "\n";
}

function section(L, title, arr, fallback) {
  if (!arr.length && !fallback) return;
  L.push(`## ${title}`);
  if (arr.length) arr.forEach(v => L.push(`- ${v}`));
  else L.push(`- ${fallback}`);
  L.push("");
}

function filename(scene) {
  return `scene-${String(scene.order).padStart(2, "0")}-${slugify(scene.id)}.md`;
}

module.exports = { buildScenes, renderScene, filename };
