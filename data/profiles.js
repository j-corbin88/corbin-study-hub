// Who can pick themselves in the upper-right menu, and which subjects exist.
// To add a kid or subject, add an entry here and (for content) a data/<id>.js file.
window.STUDY = window.STUDY || { content: {} };

STUDY.profiles = [
  { id: "cole",  name: "Cole",  color: "#3b5bdb" },
  { id: "grace",  name: "Grace",  color: "#e8590c" },
  { id: "margaux", name: "Margaux", color: "#0ca678" }
];

STUDY.subjects = [
  { id: "english", name: "English", icon: "📖" },
  { id: "theology", name: "Theology", icon: "✝️" }
  // Later: { id: "math", name: "Math", icon: "➗" }, science, history, etc.
];
