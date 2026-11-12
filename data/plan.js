// Cole's week plan. The daily check keeps "due" and "coming" up to date from his assignments calendar.
// The study sessions are worked out by the site from the due items (see weekPlan in app.js).
// kind: test | quiz | verse | task (tasks get no study sessions).
// setId: a built study set (makes the item green and tappable); leave it out while waiting on material.
window.STUDY = window.STUDY || { content: {} };
STUDY.plan = {
  cole: {
    updated: "2026-11-11",
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
      { date: "2026-11-09", subject: "science", subj: "Science", kind: "task", title: "Lab Safety #2", needs: "needs notes", send: "Lab safety notes" },
      { date: "2026-11-10", subject: "english", subj: "English", kind: "task", title: "Nouns 3.1 HW" },
      { date: "2026-11-10", subject: "civics", subj: "Civics", kind: "task", title: "Textbook scavenger hunt" },
      { date: "2026-11-10", subject: "latin", subj: "Latin", kind: "task", title: "Ch 3: Emotion Words, Part 1" },
      { date: "2026-11-11", subject: "latin", subj: "Latin", kind: "task", title: "Ch 3: Emotion Words, Part 2" },
      { date: "2026-11-11", subject: "math", subj: "Math", kind: "task", title: "Review worksheet: multiplying decimals and whole numbers (and correct homework)" },
      { date: "2026-11-11", subject: "theology", subj: "Theology", kind: "task", title: "SICJ scavenger hunt, Ch 4, 6, 7" },
      { date: "2026-11-11", subject: "art", subj: "Art", kind: "task", title: "Frankenfish final artwork" },
      { date: "2026-11-11", subject: "theology", subj: "Theology", kind: "test", title: "Theology test", ready: "St. Ignatius, 22 questions ready", setId: "ignatius-ch-4-6-7", studyLabel: "Theology", practice: "practice test" },
      { date: "2026-11-11", subject: "english", subj: "English", kind: "quiz", title: "Lesson 4 spelling quiz", unit: "Unit 4", ready: "Light words, 7 words ready", setId: "light-words-spelling", studyLabel: "Light words", studyKey: "light-words", practice: "spelling quiz" },
      { date: "2026-11-11", subject: "english", subj: "English", kind: "quiz", title: "Vocab Unit 4 quiz", ready: "Light words (ch. 4), 7 words ready", setId: "light-words", studyLabel: "Light words", studyKey: "light-words", practice: "flashcards and quiz" },
      { date: "2026-11-13", subject: "english", subj: "English", kind: "quiz", title: "Wink Ch. 9-18 quiz", ready: "Chapter questions and vocab ready", setId: "wink-ch-10-18-questions", studyLabel: "Wink Ch. 9-18", practice: "chapter questions" },
      { date: "2026-11-12", subject: "science", subj: "Science", kind: "quiz", title: "Bacteria Cell quiz", ready: "9 cards and a quiz ready", setId: "bacteria-cell", studyLabel: "Bacteria cell", practice: "flashcards and quiz" },
      { date: "2026-11-23", subject: "theology", subj: "Theology", kind: "verse", title: "Memory Verse #4", ready: "Matthew 5:14-16", setId: "verse-4-matt-5-14-16", studyLabel: "Memory Verse #4", practice: "Matthew 5:14-16" }
    ],
    coming: [
      { date: "2026-11-21", text: "Robotics: Capital Beltway Challenge" },
      { date: "2026-11-23", text: "Memory Verse #4 due" },
      { date: "2026-11-25", text: "No classes (Thanksgiving break, Nov 25-27 and Nov 30)" }
    ]
  }
};
