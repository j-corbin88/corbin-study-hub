// Cole's week plan. The daily check keeps "due" and "coming" up to date from his assignments calendar.
// The study sessions are worked out by the site from the due items (see weekPlan in app.js).
// kind: test | quiz | verse | task (tasks get no study sessions).
// setId: a built study set (makes the item green and tappable); leave it out while waiting on material.
window.STUDY = window.STUDY || { content: {} };
STUDY.plan = {
  cole: {
    updated: "2026-11-18",
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
      { date: "2026-11-16", subject: "civics", subj: "Civics", kind: "task", title: "What is Civics? reading comprehension" },
      { date: "2026-11-16", subject: "english", subj: "English", kind: "task", title: "\"Thank You, Ma'am\" comprehension check-in" },
      { date: "2026-11-16", subject: "math", subj: "Math", kind: "task", title: "Study for decimal test (review and check answers)" },
      { date: "2026-11-16", subject: "math", subj: "Math", kind: "test", title: "Decimals test", needs: "needs study guide", send: "Decimals review worksheet or textbook section", studyLabel: "Decimals", studyNeeds: "needs study guide" },
      { date: "2026-11-17", subject: "science", subj: "Science", kind: "task", title: "Why the flu makes you feel so miserable" },
      { date: "2026-11-17", subject: "theology", subj: "Theology", kind: "task", title: "Ignatius timeline / Grad at Grad" },
      { date: "2026-11-18", subject: "civics", subj: "Civics", kind: "task", title: "American symbol research assignment" },
      { date: "2026-11-18", subject: "english", subj: "English", kind: "task", title: "Lesson 5 vocabulary worksheet" },
      { date: "2026-11-18", subject: "math", subj: "Math", kind: "task", title: "Value of a ratio (worksheet 3.1, #1-8)" },
      { date: "2026-11-18", subject: "art", subj: "Art", kind: "task", title: "One-point perspective practice" },
      { date: "2026-11-19", subject: "latin", subj: "Latin", kind: "task", title: "Ch. 3 gods and goddesses, picture description" },
      { date: "2026-11-19", subject: "english", subj: "English", kind: "quiz", title: "Nouns usage quiz", needs: "needs notes", send: "Nouns usage notes (subject, subject complement, direct and indirect object)", studyLabel: "Nouns usage", studyNeeds: "needs notes" },
      { date: "2026-11-20", subject: "math", subj: "Math", kind: "quiz", title: "Ratios quiz", needs: "needs study guide", send: "Ratios notes or worksheet", studyLabel: "Ratios", studyNeeds: "needs notes" },
      { date: "2026-11-20", subject: "english", subj: "English", kind: "quiz", title: "Lesson 5 spelling quiz", unit: "Unit 5", ready: "On the Move, 10 words ready", setId: "move-words-spelling", studyLabel: "On the Move", studyKey: "move-words", practice: "spelling quiz" },
      { date: "2026-11-20", subject: "english", subj: "English", kind: "quiz", title: "Vocab Unit 5 quiz", unit: "Unit 5", ready: "On the Move (ch. 5), 10 words ready", setId: "move-words", studyLabel: "On the Move", studyKey: "move-words", practice: "flashcards and quiz" },
      { date: "2026-11-23", subject: "theology", subj: "Theology", kind: "verse", title: "Memory Verse #4", ready: "Matthew 5:14-16", setId: "verse-4-matt-5-14-16", studyLabel: "Memory Verse #4", practice: "Matthew 5:14-16" },
      { date: "2026-11-23", subject: "english", subj: "English", kind: "quiz", title: "Wink Ch. 19-29 quiz", needs: "needs chapter questions", send: "Wink chapters 19-29 questions or notes", studyLabel: "Wink Ch. 19-29", studyNeeds: "needs notes" }
    ],
    coming: [
      { date: "2026-11-21", text: "Robotics: Capital Beltway Challenge" },
      { date: "2026-11-23", text: "Memory Verse #4 due" },
      { date: "2026-11-25", text: "No classes (Thanksgiving break, Nov 25-27 and Nov 30)" },
      { date: "2026-12-05", text: "Robotics: Hereford Zone Stampede" }
    ]
  }
};
