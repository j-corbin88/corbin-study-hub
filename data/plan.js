// Cole's week plan. The daily check keeps "due" and "coming" up to date from his assignments calendar.
// The study sessions are worked out by the site from the due items (see weekPlan in app.js).
// kind: test | quiz | verse | task (tasks get no study sessions).
// setId: a built study set (makes the item green and tappable); leave it out while waiting on material.
window.STUDY = window.STUDY || { content: {} };
STUDY.plan = {
  cole: {
    updated: "2026-11-23",
    // evening capacity in minutes by weekday number (0 = Sun). free: true marks evenings used for head starts.
    evenings: {
      1: { label: "Soccer night", cap: 40 },
      2: { label: "Free evening", cap: 70, free: true },
      3: { label: "Soccer night", cap: 40 },
      4: { label: "Free evening", cap: 70, free: true },
      5: { label: "No homework", cap: 0 }
    },
    fillers: [
      { subject: "english", label: "English mixed review", setId: "__review", practice: "keep words fresh" },
      { subject: "theology", label: "Theology review", setId: "ignatius-ch-4-6-7", practice: "missed questions" }
    ],
    due: [
      { date: "2026-11-23", subject: "math", subj: "Math", kind: "task", title: "Ratio problems with tape diagrams and tables (worksheet 3.2 extra practice #1, 2, 5, 6, 8, 10)" },
      { date: "2026-11-23", subject: "pe", subj: "PE", kind: "quiz", title: "Flag football written assessment", needs: "needs rules notes", send: "Flag football rules or notes", studyLabel: "Flag football", studyNeeds: "needs notes" },
      { date: "2026-11-23", subject: "theology", subj: "Theology", kind: "verse", title: "Memory Verse #4", ready: "Matthew 5:14-16", setId: "verse-4-matt-5-14-16", studyLabel: "Memory Verse #4", practice: "Matthew 5:14-16" },
      { date: "2026-11-23", subject: "english", subj: "English", kind: "quiz", title: "Wink Ch. 19-29 quiz", ready: "Wink ch. 19-31, questions and vocab ready", setId: "wink-ch-19-31-questions", studyLabel: "Wink Ch. 19-29", practice: "chapter questions" },
      { date: "2026-11-24", subject: "math", subj: "Math", kind: "quiz", title: "Math quiz: solving ratio problems (tape diagram or table)", needs: "needs study guide", send: "Ratio problem notes (tape diagrams and tables)", studyLabel: "Ratio problems", studyNeeds: "needs notes" }
    ],
    coming: [
      { date: "2026-11-23", text: "Memory Verse #4 due" },
      { date: "2026-11-25", text: "No classes (Thanksgiving break, Nov 25-27 and Nov 30)" },
      { date: "2026-12-05", text: "Robotics: Hereford Zone Stampede" },
      { date: "2026-12-12", text: "Robotics: Knight's Melee MS Open Tournament" }
    ]
  }
};
