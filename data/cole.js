// Cole's study content. Each subject holds a list of study sets, newest first.
// A vocab set is just words: { word, pos, def, sentence }.
// The sentence should contain the word exactly as listed - it powers the fill-in-the-blank questions.
// "unit" groups sets under a heading on the subject page (e.g. a book being read).
STUDY.content.cole = {
  english: [
    {
      id: "wink-vocab",
      unit: "Wink",
      title: "Wink - Vocabulary",
      type: "vocab",
      words: [
        { word: "understatement", pos: "noun", def: "a statement that makes something seem smaller, less important, or less serious than it really is", sentence: "Calling the blizzard 'a little snow' was an understatement." },
        { word: "stifles", pos: "verb", def: "holds back or smothers; stops something from happening or growing", sentence: "Constant criticism stifles a person's confidence." },
        { word: "obscure", pos: "adjective", def: "hard to see or understand; not well known", sentence: "The writer's obscure poem left the class puzzled." },
        { word: "gaping", pos: "adjective", def: "wide open", sentence: "A gaping hole in the fence let the dog escape." },
        { word: "corrupt", pos: "adjective", def: "dishonest or immoral; willing to do wrong for personal gain", sentence: "The corrupt official took bribes." },
        { word: "liberated", pos: "adjective", def: "set free from control, captivity, or a burden", sentence: "The liberated bird flew straight into the trees." },
        { word: "strum", pos: "verb", def: "to play a guitar or similar instrument by brushing the fingers across the strings", sentence: "He learned to strum three chords on his guitar." },
        { word: "enema", pos: "noun", def: "a medical treatment where liquid is put into the lower bowel to clear it out", sentence: "The doctor explained that an enema is used to clear the bowel." },
        { word: "anonymous", pos: "adjective", def: "from or by a person whose name is not known or not given", sentence: "Someone left an anonymous note on the desk." },
        { word: "scowl", pos: "noun / verb", def: "an angry or unhappy frown; to frown in an angry way", sentence: "A scowl crossed his face when he saw the grade." },
        { word: "throttle", pos: "verb", def: "to choke or strangle; to slow or stop the flow of something", sentence: "Engineers can throttle the engine to slow the boat." },
        { word: "dyslexic", pos: "adjective", def: "having dyslexia, a learning difference that makes reading and spelling harder", sentence: "Her dyslexic brother uses special tools to help him read." },
        { word: "compartment", pos: "noun", def: "a separate section or space inside something larger", sentence: "She zipped her keys into a small compartment of the backpack." },
        { word: "psychoanalyze", pos: "verb", def: "to study and try to explain someone's thoughts, feelings, and behavior", sentence: "Please don't psychoanalyze me just because I was quiet." },
        { word: "fascinate", pos: "verb", def: "to hold someone's interest very strongly", sentence: "Space facts always fascinate the whole class." },
        { word: "unhinged", pos: "adjective", def: "mentally unbalanced; wild or out of control", sentence: "The unhinged crowd rushed onto the field." },
        { word: "vile", pos: "adjective", def: "extremely unpleasant, disgusting, or morally bad", sentence: "The vile smell from the trash made everyone gag." },
        { word: "confrontation", pos: "noun", def: "a face-to-face clash or argument between people who disagree", sentence: "The confrontation in the hallway ended when a teacher stepped in." },
        { word: "wreaking", pos: "verb", def: "causing (damage or harm) on a large scale", sentence: "The storm was wreaking havoc on the coast." }
      ]
    }
  ],

  // A "test" set holds the study guide's questions exactly as written (same order and answer letters).
  // ans = index of the correct choice, cole = index of what he circled (null if not answered).
  // note = shown after answering when an answer follows the book and couldn't be confirmed elsewhere.
  theology: [
    {
      id: "ignatius-ch-4-6-7",
      unit: "St. Ignatius",
      title: "St. Ignatius and the Company of Jesus - Chapters 4, 6, 7 review",
      type: "test",
      questions: [
        { n: 1, ch: 4, q: "Ignatius was planning to go to ____ to take a ship to Italy before heading to Jerusalem.", opts: ["Pamplona", "Barcelona", "Germany", "Disney World"], ans: 1, cole: 1,
          why: "Barcelona was the port city where he planned to catch a ship to Italy on his way to the Holy Land." },
        { n: 2, ch: 4, q: "A terrible plague kept Ignatius from going to Barcelona, so he remained in ____ for many more months.", opts: ["Montserrat", "Italy", "Manresa", "Jaffa"], ans: 2, cole: 3,
          why: "Manresa is where he stayed, praying in a cave. He expected to stay a few days, but the plague in Barcelona stretched it into months. Jaffa is the port in the Holy Land, so he hadn't gotten there yet." },
        { n: 3, ch: 4, q: "While Ignatius was praying in solitude in a cave, he came up with a plan to help people grow closer to God called...", opts: ["The Bible", "A Journal", "The Spiritual Exercises", "The Lord's Prayer"], ans: 2, cole: 2,
          why: "The Spiritual Exercises are a plan of prayer to help people grow closer to God." },
        { n: 4, ch: 4, q: "The Spiritual Exercises would be practiced on a ____, or a time set apart to be alone with God.", opts: ["camping trip", "retreat", "pilgrimage", "flute"], ans: 1, cole: 1,
          why: "A retreat is a time set apart to be alone with God. A pilgrimage is a journey to a holy place." },
        { n: 5, ch: 4, q: "The Spiritual Exercises would be practiced on retreat for ____ weeks.", opts: ["2 weeks", "3 weeks", "4 weeks", "6 weeks"], ans: 2, cole: 2,
          why: "The Exercises are divided into four 'weeks' (about 30 days).",
          note: "On the paper this was a fill-in-the-blank (Cole wrote 4). The other choices are added here for practice." },
        { n: 6, ch: 4, q: "The spiritual retreat would include the following:", opts: ["Repentance (a turning away from sins)", "Contemplation of Christ's death", "Contemplation of Christ's life", "Contemplation of Christ's resurrection", "All of the above"], ans: 4, cole: 4,
          why: "The four weeks cover sin and repentance, Christ's life, His death, and His resurrection, so it's all of them." },
        { n: 7, ch: 4, q: "What message did Ignatius receive in a vision from God in Manresa?", opts: ["To go back to being a soldier for Spain", "To repent", "To go to school", "To form a company of men to draw all people to God"], ans: 3, cole: 3,
          why: "The message was to form a company of men to draw all people to God. That became the Company of Jesus (the Jesuits).",
          note: "This follows the book's wording. Worth a quick check against Chapter 4 in the book." },
        { n: 8, ch: 4, q: "Ignatius went to Italy to see the Pope who gave him permission to go to Jerusalem on pilgrimage.", opts: ["True", "False"], ans: 1, cole: 1,
          why: "False, at this point in the story. The new Pope (Adrian VI) wasn't in Rome yet, and then a plague spreading through Barcelona kept Ignatius at Manresa for months. He went to Italy and got the Pope's permission later.",
          written: "because he wasn't able because the Turks would silence him",
          better: "The book's reason: a plague in Barcelona kept him at Manresa. The Turks come up later, in Jerusalem." },
        { n: 9, ch: 4, q: "Another name for Jerusalem is:", opts: ["The Holy Land", "Barcelona", "Jesusville", "Jaffa"], ans: 0, cole: 0,
          why: "Jerusalem and the land around it, where Jesus lived, is called the Holy Land. Jaffa is a port city and Barcelona is in Spain." },

        { n: 10, ch: 6, q: "What did Ignatius hope to do in Jerusalem?", opts: ["Form his company of Jesus", "Get some souvenirs", "Meet Jesus", "Go to school"], ans: 0, cole: 0,
          why: "He hoped to stay in the Holy Land and form his company of men to share Christ there. That's why Question 12 is false.",
          note: "This follows the book's wording. Worth a quick check against Chapter 6." },
        { n: 11, ch: 6, q: "Who would be opposed to Ignatius preaching about Christ in Jerusalem?", opts: ["The Pope", "The Dominicans", "The Turks (Muslims)", "God"], ans: 2, cole: 2,
          why: "The Turks ruled the Holy Land then, and they would not welcome preaching about Christ." },
        { n: 12, ch: 6, q: "Ignatius remained in Jerusalem, formed his company of Jesus and spread Christianity there.", opts: ["True", "False"], ans: 1, cole: 1,
          why: "False. The Franciscan leader in Jerusalem ordered him to leave because it was too dangerous, so he sailed back to Spain.",
          written: "because they wouldn't let him",
          better: "Good. You can add who: the Franciscan leader told him to go." },
        { n: 13, ch: 6, q: "Why did Ignatius go back to Barcelona?", opts: ["To form his company of men", "He liked to sail on a ship", "To go to school", "He missed home"], ans: 2, cole: 0,
          why: "He was about 33 and didn't know Latin. He needed an education to help souls, so he went back to school in Barcelona." },

        { n: 14, ch: 7, q: "Where is Barcelona?", opts: ["Jerusalem", "Italy", "Africa", "Spain"], ans: 3, cole: 3,
          why: "Barcelona is a port city in Spain." },
        { n: 15, ch: 7, q: "When Ignatius went back to school he started at the university level.", opts: ["True", "False"], ans: 1, cole: 1,
          why: "False. He didn't know Latin yet, so he started with Latin grammar alongside young boys (Question 16).",
          written: "because he wanted to learn unlike he did as kid",
          better: "He started with Latin grammar with young boys, not at the university." },
        { n: 16, ch: 7, q: "How did the young boys treat Ignatius in school?", opts: ["They accepted him", "They helped him", "They teased him", "They picked him for their kickball team"], ans: 2, cole: 2,
          why: "They teased him. He was a grown man sitting in class with little boys." },
        { n: 17, ch: 7, q: "Ignatius was \"slower to learn\" than the other students because...", opts: ["He wasn't smart", "He spent time caring for others", "He couldn't afford books", "He didn't understand the language"], ans: 1, cole: 1,
          why: "He spent time caring for others instead of only studying.",
          note: "This follows the book's wording. Worth a quick check against Chapter 7." },
        { n: 18, ch: 7, q: "Who attacked Ignatius?", opts: ["Two Frenchmen", "Pokemon", "Two Jesuits", "Two Moors"], ans: 3, cole: 3,
          why: "Two Moors attacked him.",
          note: "This follows the book's wording. Worth a quick check against Chapter 7." },
        { n: 19, ch: 7, q: "Why was Ignatius attacked?", opts: ["He had a lot of money", "Some people did not like what he was preaching", "He was being rude", "He got in the middle of a fight"], ans: 1, cole: 1,
          why: "Some people did not like what he was preaching.",
          note: "This follows the book's wording. Worth a quick check against Chapter 7." },
        { n: 20, ch: 7, q: "Ignatius and his companions went to Alcala to:", opts: ["Go to the university", "Go on retreat", "Go on vacation", "Find work"], ans: 0, cole: 0,
          why: "Alcala had a university, and they went there to study." },
        { n: 21, ch: 7, q: "Ignatius and his companions were able to start at the university right away.", opts: ["True", "False"], ans: 1, cole: 1,
          why: "False. The guide also asks what they did instead. Check Chapter 7 for that.",
          written: "(left blank)",
          better: "Look this one up in Chapter 7. The follow-up asks what they did instead." },
        { n: 22, ch: 7, q: "What happened to Ignatius because the authorities did not like what he was preaching?", opts: ["He was starved", "He was arrested", "He had to go to Italy", "He got a D in Theology"], ans: 1, cole: 1,
          why: "He was arrested." }
      ],
      extra: { q: "Extra credit: Who are the Moors?", cole: "people who are paid to attack people",
               better: "Muslim people from North Africa who lived in and ruled parts of Spain for hundreds of years." },
      events: [
        "Stays in Manresa, praying in a cave and coming up with the Spiritual Exercises",
        "Goes to Barcelona and sails for Italy",
        "Meets the Pope in Rome and gets permission to go to Jerusalem",
        "Travels to Jerusalem on pilgrimage",
        "Is told to leave Jerusalem because it is too dangerous",
        "Returns to Barcelona and goes back to school with young boys",
        "Goes to the university at Alcala with his companions",
        "Is arrested because the authorities don't like his preaching"
      ],
      terms: [
        { word: "Manresa", pos: "town in Spain", def: "The town where Ignatius stayed for months, praying in a cave. The Spiritual Exercises began here." },
        { word: "Spiritual Exercises", pos: "noun", def: "Ignatius's plan to help people grow closer to God through prayer, practiced on a retreat of about four weeks." },
        { word: "Retreat", pos: "noun", def: "A time set apart to be alone with God." },
        { word: "Pilgrimage", pos: "noun", def: "A journey to a holy place. Ignatius's pilgrimage was to Jerusalem." },
        { word: "Repentance", pos: "noun", def: "Turning away from sins." },
        { word: "Contemplation", pos: "noun", def: "Praying quietly while thinking deeply about something, like Christ's life, death, or resurrection." },
        { word: "Barcelona", pos: "city in Spain", def: "A port city. Ignatius planned to sail from here to Italy, and later came back to go to school." },
        { word: "Pope Adrian VI", pos: "person", def: "The Pope in Rome who gave Ignatius permission to make his pilgrimage to Jerusalem." },
        { word: "Jerusalem", pos: "city", def: "The holy city where Jesus lived. Ignatius hoped to stay and form his company here." },
        { word: "The Holy Land", pos: "place", def: "Another name for Jerusalem and the land where Jesus lived." },
        { word: "Jaffa", pos: "port city", def: "The port where pilgrims landed on their way to Jerusalem." },
        { word: "The Turks", pos: "people", def: "The Muslim rulers of the Holy Land at that time. They would oppose preaching about Christ in Jerusalem." },
        { word: "The Moors", pos: "people", def: "Muslim people from North Africa who lived in and ruled parts of Spain for hundreds of years." },
        { word: "Alcala", pos: "university town", def: "A university town in Spain. Ignatius and his companions went there to study." },
        { word: "Company of Jesus", pos: "group", def: "The group of men Ignatius wanted to form to draw all people to God. Today they are called the Jesuits." }
      ]
    }
  ]
};

// Memory verses (text from the school calendar entries). The daily check adds new ones as they appear.
STUDY.content.cole.theology.push(
  { id: "verse-3-matt-6-33-34", type: "verse", unit: "Memory verses", title: "Memory Verse #3", ref: "Matthew 6:33-34", due: "2026-11-03",
    text: "But seek first his kingdom and his righteousness and all these things will be given to you as well. Therefore, do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own." },
  { id: "verse-4-matt-5-14-16", type: "verse", unit: "Memory verses", title: "Memory Verse #4", ref: "Matthew 5:14-16", due: "2026-11-23",
    text: "You are the light of the world. A city set on a hill cannot be hidden. Nor do people light a lamp and put it under a basket, but on a stand, and it gives light to all in the house. In the same way, let your light shine before others, so that they may see your good works and give glory to your Father who is in heaven." }
);

// Wink chapters 10-18 comprehension questions (from the class handout). Quiz Thu Nov 12.
STUDY.content.cole.english.push({
  id: "wink-ch-10-18-questions", type: "prompts", unit: "Wink", title: "Wink - Chapters 10-18 questions",
  intro: "Think about each question, jot an answer, and tick it when you could answer it out loud.",
  groups: [
    { title: "Chapters 10-12", qs: [
      { n: 1, q: "Memes are used as a form of bullying in this book. Did this make you think about how a meme can affect somebody?" },
      { n: 2, q: "How does Ross cope with his anger? What do you do when you are really angry?" },
      { n: 3, q: "What did Dr. Throckton tell Ross and his family that was different than his other doctor?" },
      { n: 4, q: "Throughout the novel it was mentioned that Ross lost his mother to cancer when he was young. How do you think that affects Ross as he undergoes his own cancer treatment? Think critically." }
    ] },
    { title: "Chapters 13 and 14", qs: [
      { n: 5, q: "What instrument does Ross learn to play?" },
      { n: 6, q: "Abby gives Ross some bad news. What is it? What effect do you think this will have on Ross?" },
      { n: 7, q: "Prediction: what role do you think Frank will play in Ross's life?" },
      { n: 8, q: "Do you think Linda and Ross's dad are helpful and supportive to Ross while he is going through a very difficult time? Why or why not?" }
    ] },
    { title: "Chapters 15 and 16", qs: [
      { n: 9, q: "Who walks in the door and surprises Ross?" },
      { n: 10, q: "Do you think Abby is a good friend or not? Provide two examples from the book through the first 16 chapters." },
      { n: 11, q: "Why do you think the author had Ross learn to play the guitar?" }
    ] },
    { title: "Chapters 17-18", qs: [
      { n: 12, q: "What triggers the worries of death for Ross?" },
      { n: 13, q: "Batpig vs. the anonymous troll: what does the comic refer to?" },
      { n: 14, q: "Who does Ross suspect made the memes?" },
      { n: 15, q: "Describe the bullying that Ross is experiencing." },
      { n: 16, q: "Describe what happened in Ms. Bayer's class. Why do you think Ross responded the way he did to Jimmy?" }
    ] }
  ]
});

// Science: bacteria cell notes (from his notebook pages dated 10/30 and 11/2). Bacteria Cell quiz Thu Nov 12.
STUDY.content.cole.science = [
  { id: "bacteria-cell", type: "vocab", unit: "Bacteria", title: "Bacteria cell structure and reproduction",
    words: [
      { word: "cell wall", pos: "structure", def: "Protects the shape of the cell." },
      { word: "cell membrane", pos: "structure", def: "Allows materials in and out of the cell." },
      { word: "genetic material", pos: "structure", def: "Holds the instructions for the cell." },
      { word: "ribosomes", pos: "structure", def: "Produce proteins." },
      { word: "cytoplasm", pos: "structure", def: "Holds everything in place inside the cell." },
      { word: "flagella", pos: "structure", def: "Used for movement." },
      { word: "pili", pos: "structure", def: "Used for attachment." },
      { word: "binary fission", pos: "reproduction", def: "Asexual reproduction: one bacterium splits into 2 (bi = 2, fission = split)." },
      { word: "conjugation", pos: "reproduction", def: "Sexual reproduction in bacteria: two cells connect and share genetic material." }
    ] }
];

// Wink practice test and story order. Written from online chapter summaries (not the book text), so check against his copy of the book.
STUDY.content.cole.english.push({
  id: "wink-ch-9-18-practice", unit: "Wink", title: "Wink - Chapters 9-18 practice test", type: "test", generated: true,
  questions: [
    { n: 1, ch: 9, q: "On his first day wearing the cowboy hat to school, how does Ross get there?", opts: ["He takes the school bus", "He avoids the bus", "Linda drives him all the way into the building", "He rides his bike"], ans: 1, cole: null,
      why: "Ross avoids the bus so fewer kids stare at him." },
    { n: 2, ch: 9, q: "Why does Ross keep his eye mostly shut and use fake tears?", opts: ["His surgeon removed his lacrimal gland", "He lost his eye in an accident", "He is allergic to the hat", "He is practicing winking"], ans: 0, cole: null,
      why: "The surgery removed the lacrimal gland, the gland that makes tears, so the eye is dry and opening it stings." },
    { n: 3, ch: 9, q: "Who gives Ross a CD of his band's music, and what is the band called?", opts: ["Jimmy; Batpig", "Frank; Ripe Sponge", "Callie; The Zappers", "Abby; Ripe Sponge"], ans: 1, cole: null,
      why: "Frank from the treatment center gives Ross a CD by his band, Ripe Sponge." },
    { n: 4, ch: 10, q: "What day is it on Ross's second day with the hat?", opts: ["His birthday", "Halloween", "The first day of winter break", "The day of the talent show"], ans: 1, cole: null,
      why: "It's Halloween. Ross notices kids whispering and staring." },
    { n: 5, ch: 10, q: "When classmates stare, what does Abby think is the reason?", opts: ["The hat", "A rumor about Jimmy", "A school announcement", "Ross's guitar"], ans: 0, cole: null,
      why: "Abby has no idea about the memes yet, so she assumes they are looking at the hat." },
    { n: 6, ch: 11, q: "What does Abby tell Ross before trick-or-treating?", opts: ["She is moving away", "Three hurtful memes about him are online", "She is quitting band", "Isaac wants to be friends again"], ans: 1, cole: null,
      why: "Abby tells him about three mean memes about him that are going around online. Her moving away comes later, in Chapter 13." },
    { n: 7, ch: 11, q: "What does Ross do about the memes?", opts: ["Reports them to the principal", "Posts a reply", "Refuses to report them and runs home crying", "Calls Frank"], ans: 2, cole: null,
      why: "Hurt and scared, Ross refuses to report them and runs home." },
    { n: 8, ch: 12, q: "In the flashback, what does Dr. Throckton tell Ross about his eye?", opts: ["It must be removed", "It can be treated without removing it", "It will heal on its own", "He will go blind in both eyes"], ans: 1, cole: null,
      why: "Dr. Throckton, a proton radiation specialist, says the tumor can be treated without taking out the eye, so Ross keeps the structure of his right eye and the sight in his left." },
    { n: 9, ch: 12, q: "What plan does Ross agree to?", opts: ["Radiation only", "Surgery, then radiation", "Medicine only", "Wait and see"], ans: 1, cole: null,
      why: "Ross accepts surgery followed by proton radiation treatments." },
    { n: 10, ch: 13, q: "What does Ross ask Frank to teach him?", opts: ["Drums", "Guitar", "Piano", "Drawing"], ans: 1, cole: null,
      why: "Ross asks Frank to teach him guitar, even though Frank has never taught anyone." },
    { n: 11, ch: 13, q: "What is Abby's big news?", opts: ["She won the talent show", "Her family is moving to Saint Paul, Minnesota", "She got a new viola", "She is switching schools to be with Isaac"], ans: 1, cole: null,
      why: "Her dad is taking a job with his brother in Saint Paul, Minnesota, and the family will move after the semester." },
    { n: 12, ch: 14, q: "What does Frank say that shocks Ross before he says he's kidding?", opts: ["Offers him a beer", "Tells him to quit guitar", "Asks him to join the band", "Says Ross is too young to play"], ans: 0, cole: null,
      why: "Frank offers Ross a beer, then laughs at his shocked face and says he is joking." },
    { n: 13, ch: 16, q: "What does Frank tell Ross to do that he takes to heart?", opts: ["Practice only on weekends", "Play until his fingers bleed", "Skip lessons when tired", "Learn to read music first"], ans: 1, cole: null,
      why: "Ross takes Frank's order to keep playing until his fingers bleed seriously and practices over and over." },
    { n: 14, ch: 16, q: "Abby keeps pushing Ross to enter what?", opts: ["The art contest", "The talent show", "The school newspaper", "The science fair"], ans: 1, cole: null,
      why: "Abby keeps urging him to enter the talent show until he plays a couple of chords for her." },
    { n: 15, ch: 17, q: "What sets off Ross's breakdown in Chapter 17?", opts: ["A comic book with the word \"dead\" on it", "A text from Isaac", "A phone call from Dr. Throckton", "A fight with Linda"], ans: 0, cole: null,
      why: "A Walking Dead comic makes him realize he could die. He cries on his bedroom floor." },
    { n: 16, ch: 17, q: "How does Linda comfort Ross?", opts: ["She calls his dad", "She rests her cheek on his head and tells him to distract himself from bad thoughts", "She takes him out for ice cream", "She tells him not to worry about anything"], ans: 1, cole: null,
      why: "She comforts him quietly, which reminds him of his mother, and says to steer his mind to other things when scary thoughts come." },
    { n: 17, ch: 18, q: "Who does Ross suspect made the memes?", opts: ["Isaac", "Sarah", "Jimmy", "Chris"], ans: 2, cole: null,
      why: "Ross looks at every student with a phone, but Jimmy seems the most likely." },
    { n: 18, ch: 18, q: "What happens in class when Jimmy makes fun of Ross for playing guitar?", opts: ["Ross walks out", "Ross throws his textbook at Jimmy and a fight breaks out", "The teacher sends Jimmy to the office", "Abby stands up for him"], ans: 1, cole: null,
      why: "Ross throws his textbook at Jimmy, and then he breaks down in front of everyone, including Sarah." }
  ],
  terms: [
    { word: "Ross Maloy", pos: "main character", def: "The seventh grader who tells the story. He has a rare eye cancer, draws comics, and learns guitar." },
    { word: "Abby", pos: "character", def: "Ross's best friend since first grade. She plays viola, urges Ross to enter the talent show, and her family is moving to Saint Paul, Minnesota." },
    { word: "Frank", pos: "character", def: "A radiation tech at Ross's treatment center. He gives Ross a Ripe Sponge CD and teaches him guitar." },
    { word: "Linda", pos: "character", def: "Ross's stepmother. She comforts him after his breakdown in Chapter 17." },
    { word: "Jimmy", pos: "character", def: "A classmate who mocks Ross. Ross suspects him of making the memes, and they fight in Chapter 18." },
    { word: "Dr. Throckton", pos: "character", def: "The proton radiation doctor who tells Ross his eye can be saved." },
    { word: "Batpig", pos: "character", def: "The superhero pig in Ross's comics. Batpig shows how Ross feels." },
    { word: "Ripe Sponge", pos: "band", def: "Frank's band. Ross listens to their CD for comfort." },
    { word: "Lacrimal gland", pos: "body part", def: "The gland that makes tears. Ross's surgeon removed it, so he needs fake tears." },
    { word: "Memes", pos: "noun", def: "Three mean images about Ross that spread online around Halloween." }
  ],
  events: [
    "Ross wears the cowboy hat to school for the first time and Frank gives him a Ripe Sponge CD",
    "On Halloween, kids whisper and stare at Ross, and Abby thinks it's the hat",
    "Abby tells Ross about three mean memes, and he runs home crying",
    "Flashback: Dr. Throckton says Ross can keep his eye with surgery and radiation",
    "The next morning, Ross asks Frank to teach him guitar",
    "Abby tells Ross her family is moving to Saint Paul, Minnesota",
    "Frank starts teaching Ross and jokes about offering him a beer",
    "Ross practices until his fingers are sore, and Abby pushes him to enter the talent show",
    "A Walking Dead comic makes Ross realize he could die, and Linda comforts him",
    "Back at school, Ross throws his textbook at Jimmy and a fight breaks out"
  ]
});

// English: light words (Growing Your Vocabulary, Chapter 4: Light and its Travels).
STUDY.content.cole.english.push({
  id: "light-words", type: "vocab", unit: "Unit 4", title: "Light words (Chapter 4)",
  words: [
    { word: "luminous", pos: "adjective", def: "Filled with light. (Root lumin = light.)", sentence: "The moon looks luminous, but it only reflects the sun's light." },
    { word: "luminary", pos: "noun", def: "A very inspiring or influential person. Also, an object that gives off light. (Root lumin = light.)", sentence: "The famous scientist was a luminary in her field." },
    { word: "illuminate", pos: "verb", def: "To light up. (Root lumin = light.)", sentence: "A floodlight can illuminate the driveway at night." },
    { word: "lucid", pos: "adjective", def: "Clear, or able to be understood. (Root luc = light.)", sentence: "The doctor wrote a lucid article about washing hands." },
    { word: "elucidate", pos: "verb", def: "To make clear. (Root luc = light.)", sentence: "Please elucidate how plants make food." },
    { word: "photon", pos: "noun", def: "A particle that carries electromagnetic energy, such as light. (Root phot = light.)", sentence: "X-rays and gamma rays are made of photons." },
    { word: "photosynthesis", pos: "noun", def: "The process plants use to make food from light. (phot = light + synthesis = to put together.)", sentence: "Plants need sunlight for photosynthesis." }
  ]
});
// English: Lesson 4 spelling quiz (same words as the Light words vocab set).
STUDY.content.cole.english.push({
  id: "light-words-spelling", type: "spelling", unit: "Unit 4", title: "Lesson 4 spelling (Light words)",
  words: [
    { word: "luminous", pos: "adjective", def: "Filled with light. (Root lumin = light.)", sentence: "The moon looks luminous, but it only reflects the sun's light." },
    { word: "luminary", pos: "noun", def: "A very inspiring or influential person. Also, an object that gives off light. (Root lumin = light.)", sentence: "The famous scientist was a luminary in her field." },
    { word: "illuminate", pos: "verb", def: "To light up. (Root lumin = light.)", sentence: "A floodlight can illuminate the driveway at night." },
    { word: "lucid", pos: "adjective", def: "Clear, or able to be understood. (Root luc = light.)", sentence: "The doctor wrote a lucid article about washing hands." },
    { word: "elucidate", pos: "verb", def: "To make clear. (Root luc = light.)", sentence: "Please elucidate how plants make food." },
    { word: "photon", pos: "noun", def: "A particle that carries electromagnetic energy, such as light. (Root phot = light.)", sentence: "X-rays and gamma rays are made of photons." },
    { word: "photosynthesis", pos: "noun", def: "The process plants use to make food from light. (phot = light + synthesis = to put together.)", sentence: "Plants need sunlight for photosynthesis." }
  ]
});

