// Who can pick themselves in the upper-right menu, and which subjects exist.
// To add a kid or subject, add an entry here and (for content) a data/<id>.js file.
window.STUDY = window.STUDY || { content: {} };

STUDY.profiles = [
  { id: "cole",  name: "Cole",  color: "#3b5bdb" },
  { id: "kid2",  name: "Kid 2", color: "#e8590c" },  // rename me
  { id: "kid3",  name: "Kid 3", color: "#0ca678" }   // rename me
];

STUDY.subjects = [
  { id: "english", name: "English", icon: "📖" }
  // Later: { id: "math", name: "Math", icon: "➗" }, science, history, etc.
];
