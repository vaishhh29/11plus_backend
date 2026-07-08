const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const passages = [
  {
    title: "THE LEGEND OF EXCALIBUR",
    text: [
      "In the early years of Britain, after the death of Uther Pendragon, the country fell into dark conflicts. Barons fought barons for the crown, and the land grew cold and neglected. To end the strife, the Archbishop of Canterbury summoned the knights to London. In the churchyard of Saint Paul's Cathedral, they discovered a large square stone.",
      "In the centre of the stone stood a steel anvil, and driven deep into the anvil was a gleaming sword. Written around the hilt in gold letters were the words: 'Whoso pulleth out this sword of this stone and anvil, is rightwise King born of all England.' Many tried, but even the strongest knights could not budge the metal blade.",
      "Years passed until Arthur, a young squire serving his brother Sir Kay, arrived in London for a tournament. Sir Kay realized he had left his sword at their lodging and sent Arthur to retrieve it. Finding the lodging locked, Arthur hurried to the churchyard. Without reading the inscription, Arthur pulled the sword easily from the stone to help his brother."
    ],
    questions: [
      {
        q: "Who was the ruler of Britain whose death caused the dark conflicts?",
        ans: "Uther Pendragon",
        opts: ["King Arthur", "Archbishop of Canterbury", "Sir Kay"],
        exp: "Paragraph 1 mentions 'after the death of Uther Pendragon'.",
        diff: "EASY"
      },
      {
        q: "Who summoned the knights to London to end the strife?",
        ans: "The Archbishop of Canterbury",
        opts: ["Arthur", "Uther Pendragon", "Sir Kay"],
        exp: "Paragraph 1 states: 'the Archbishop of Canterbury summoned the knights to London'.",
        diff: "EASY"
      },
      {
        q: "In which churchyard was the large square stone found?",
        ans: "Saint Paul's Cathedral",
        opts: ["Westminster Abbey", "Canterbury Cathedral", "Saint Peter's Church"],
        exp: "Paragraph 1 mentions the churchyard of Saint Paul's Cathedral.",
        diff: "EASY"
      },
      {
        q: "What stood in the centre of the square stone?",
        ans: "A steel anvil",
        opts: ["A marble altar", "A wooden cross", "A silver chest"],
        exp: "Paragraph 2 notes: 'In the centre of the stone stood a steel anvil'.",
        diff: "MEDIUM"
      },
      {
        q: "In what color letters was the inscription around the hilt written?",
        ans: "Gold",
        opts: ["Silver", "Black", "Bronze"],
        exp: "Paragraph 2 notes the words were 'written around the hilt in gold letters'.",
        diff: "MEDIUM"
      },
      {
        q: "What did Arthur seek to retrieve for his brother Kay?",
        ans: "A sword",
        opts: ["A shield", "A horse", "A golden helmet"],
        exp: "Paragraph 3 notes: 'Kay realized he had left his sword... and sent Arthur to retrieve it'.",
        diff: "MEDIUM"
      },
      {
        q: "What was Arthur's rank or status when he drew the sword?",
        ans: "Squire",
        opts: ["Knight", "Archbishop", "King"],
        exp: "Paragraph 3 describes Arthur as 'a young squire serving his brother'.",
        diff: "MEDIUM"
      },
      {
        q: "Why was Arthur unable to get his brother's original sword?",
        ans: "The lodging was locked",
        opts: ["A knight had stolen it", "He forgot where it was", "It was broken in the tournament"],
        exp: "Paragraph 3 notes: 'Finding the lodging locked, Arthur hurried...' ",
        diff: "HARD"
      },
      {
        q: "What was Arthur's primary reason for pulling the sword?",
        ans: "To help his brother",
        opts: ["To become King of England", "To test his strength", "To prove his royal blood"],
        exp: "Paragraph 3 ends: 'Arthur pulled the sword easily from the stone to help his brother'.",
        diff: "HARD"
      },
      {
        q: "What had Arthur failed to do before pulling the sword?",
        ans: "Read the inscription",
        opts: ["Ask the Archbishop", "Pray in the chapel", "Wait for Sir Kay"],
        exp: "Paragraph 3 explains: 'Without reading the inscription, Arthur pulled...' ",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE DAWN OF MANNED FLIGHT",
    text: [
      "On December 17, 1903, near the windy dunes of Kitty Hawk, North Carolina, Orville and Wilbur Wright achieved a historical milestone. In the early morning chill, Orville climbed into their homemade wooden biplane, named the Flyer. He lay flat on the lower wing, control cords tied to his hips, ready to pilot the aircraft.",
      "The Flyer was powered by a custom-built twelve-horsepower petrol engine. Wilbur released the holding rope, and the biplane surged forward on its wooden launching rail. Propelled by twin wooden propellers, the plane lifted into the air, traveling a distance of thirty-seven metres during a twelve-second flight. This was the first controlled, powered flight in history.",
      "By the end of that cold afternoon, the brothers had completed three more flights, with Wilbur pilotting the longest one, which lasted fifty-nine seconds and covered two hundred and sixty metres. Though witnessed by only five local residents, the news marked the birth of modern aviation."
    ],
    questions: [
      {
        q: "On what date did the Wright brothers achieve their manned flight?",
        ans: "December 17, 1903",
        opts: ["January 1, 1900", "December 25, 1905", "October 12, 1903"],
        exp: "Paragraph 1 states: 'On December 17, 1903...'",
        diff: "EASY"
      },
      {
        q: "Near which town did the flight take place?",
        ans: "Kitty Hawk",
        opts: ["Charlotte", "Raleigh", "Cape Hatteras"],
        exp: "Paragraph 1 states: 'near the windy dunes of Kitty Hawk, North Carolina'.",
        diff: "EASY"
      },
      {
        q: "What was the name of the Wright brothers' plane?",
        ans: "Flyer",
        opts: ["Nautilus", "Falcon", "Eagle"],
        exp: "Paragraph 1 states: 'their homemade wooden biplane, named the Flyer'.",
        diff: "EASY"
      },
      {
        q: "What position did Orville take while piloting the plane?",
        ans: "Lay flat on the lower wing",
        opts: ["Sat in a steel cabin", "Stood on the rear deck", "Knelt between the propellers"],
        exp: "Paragraph 1 notes: 'He lay flat on the lower wing'.",
        diff: "MEDIUM"
      },
      {
        q: "What was the horsepower of the petrol engine?",
        ans: "12 horsepower",
        opts: ["50 horsepower", "20 horsepower", "5 horsepower"],
        exp: "Paragraph 2 states: 'powered by a custom-built twelve-horsepower petrol engine'.",
        diff: "MEDIUM"
      },
      {
        q: "How many propellers did the Flyer have?",
        ans: "Two (twin)",
        opts: ["One", "Three", "Four"],
        exp: "Paragraph 2 refers to 'twin wooden propellers'.",
        diff: "MEDIUM"
      },
      {
        q: "What distance was covered during the very first flight?",
        ans: "37 metres",
        opts: ["260 metres", "59 metres", "12 metres"],
        exp: "Paragraph 2 states: 'traveling a distance of thirty-seven metres'.",
        diff: "MEDIUM"
      },
      {
        q: "How long did the first flight last?",
        ans: "12 seconds",
        opts: ["59 seconds", "37 seconds", "30 seconds"],
        exp: "Paragraph 2 notes: 'during a twelve-second flight'.",
        diff: "HARD"
      },
      {
        q: "Who piloted the longest flight of the day?",
        ans: "Wilbur",
        opts: ["Orville", "Drake", "Clara"],
        exp: "Paragraph 3 states: 'with Wilbur pilotting the longest one'.",
        diff: "HARD"
      },
      {
        q: "How many local residents witnessed the historical flight?",
        ans: "5",
        opts: ["10", "100", "0"],
        exp: "Paragraph 3 states: 'Though witnessed by only five local residents'.",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE SHADOW IN THE WHISPERING LIBRARY",
    text: [
      "The Whispering Library was a gothic stone tower containing thousands of ancient, leather-clad books. The librarian, Nicholas, worked late into the night, cataloguing dusty manuscripts by candle light. It was rumored that the library was haunted by a scholar who had vanished in 1845 while translating a strange parchment.",
      "One midnight, as Nicholas was searching the top shelves of the history section, he noticed a gap behind a row of encyclopedias. He reached into the dark opening and pulled out a heavy black notebook. The cover was bound in velvet and secured with a small silver latch shaped like an owl.",
      "Nicholas opened the latch. Written on the first page in faded ink was the name 'Professor Charles Sterling'. Suddenly, the candles flickered and went out, leaving him in darkness. Through the window, he heard the clock on the village hall strike twelve, and a soft, cold draft swept through the bookshelf aisles."
    ],
    questions: [
      {
        q: "What is the name of the librarian in the story?",
        ans: "Nicholas",
        opts: ["Thomas", "Charles", "Leo"],
        exp: "Paragraph 1 mentions the librarian, Nicholas.",
        diff: "EASY"
      },
      {
        q: "Around what year did the rumor state a scholar had vanished?",
        ans: "1845",
        opts: ["1712", "1903", "1800"],
        exp: "Paragraph 1 states: 'who had vanished in 1845'.",
        diff: "EASY"
      },
      {
        q: "What was Nicholas cataloguing by candle light?",
        ans: "Dusty manuscripts",
        opts: ["Encyclopedia volumes", "Silver coins", "Bronze maps"],
        exp: "Paragraph 1 notes: 'cataloguing dusty manuscripts'.",
        diff: "EASY"
      },
      {
        q: "Where was Nicholas searching when he found the gap?",
        ans: "Top shelves of the history section",
        opts: ["The basement vaults", "The archives", "The science aisles"],
        exp: "Paragraph 2 states: 'searching the top shelves of the history section'.",
        diff: "MEDIUM"
      },
      {
        q: "What material bound the cover of the black notebook?",
        ans: "Velvet",
        opts: ["Leather", "Paper", "Silk"],
        exp: "Paragraph 2 states: 'The cover was bound in velvet'.",
        diff: "MEDIUM"
      },
      {
        q: "What animal did the silver latch shape resemble?",
        ans: "An owl",
        opts: ["A hawk", "A mouse", "A sparrow"],
        exp: "Paragraph 2 mentions: 'a small silver latch shaped like an owl'.",
        diff: "MEDIUM"
      },
      {
        q: "Whose name was written on the first page of the notebook?",
        ans: "Professor Charles Sterling",
        opts: ["Aunt Clara", "Librarian Nicholas", "Thomas Newcomen"],
        exp: "Paragraph 3 notes: 'the name Professor Charles Sterling'.",
        diff: "MEDIUM"
      },
      {
        q: "What happened to the candles as Nicholas opened the notebook?",
        ans: "They flickered and went out",
        opts: ["They burned brighter", "They melted completely", "They fell to the floor"],
        exp: "Paragraph 3 states: 'Suddenly, the candles flickered and went out'.",
        diff: "HARD"
      },
      {
        q: "Where was the clock located that struck twelve?",
        ans: "The village hall",
        opts: ["The cathedral tower", "The manor house attic", "The library entryway"],
        exp: "Paragraph 3 states: 'he heard the clock on the village hall strike twelve'.",
        diff: "HARD"
      },
      {
        q: "What swept through the bookshelf aisles at the end of the story?",
        ans: "A soft, cold draft",
        opts: ["A loud wind storm", "A heavy smoke cloud", "A shadow silhouette"],
        exp: "Paragraph 3 closes with: 'and a soft, cold draft swept through the bookshelf aisles'.",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE LIFE OF THE EMPEROR PENGUIN",
    text: [
      "Emperor penguins are the tallest and heaviest of all living penguin species, residing exclusively in the freezing climate of Antarctica. During the winter, when temperatures drop below minus forty degrees Celsius, these birds embark on a long journey of eighty kilometres across ice to reach their nesting sites.",
      "The female penguin lays a single egg, which she immediately transfers to the male's feet. She then returns to the sea to feed. For sixty-four continuous days, the male penguin balances the egg on its feet, protecting it beneath a warm fold of skin known as a brood pouch. During this period, the male does not eat, relying entirely on stored fat.",
      "To survive the freezing winds that reach speeds of two hundred kilometres per hour, the males gather in a large, tightly packed huddle. They take turns moving to the warm centre. Once the egg hatches, the female returns with fish to feed the chick, allowing the male to finally return to the ocean."
    ],
    questions: [
      {
        q: "Where do Emperor penguins live?",
        ans: "Antarctica",
        opts: ["The Arctic", "Greenland", "Patagonia"],
        exp: "Paragraph 1 states that they reside exclusively in Antarctica.",
        diff: "EASY"
      },
      {
        q: "How far do the penguins travel over ice to reach nesting sites?",
        ans: "80 kilometres",
        opts: ["40 kilometres", "100 kilometres", "20 kilometres"],
        exp: "Paragraph 1 mentions a journey of eighty kilometres.",
        diff: "EASY"
      },
      {
        q: "How many eggs does a female Emperor penguin lay at a time?",
        ans: "A single egg",
        opts: ["Two eggs", "Three eggs", "A dozen eggs"],
        exp: "Paragraph 2 states: 'The female penguin lays a single egg'.",
        diff: "EASY"
      },
      {
        q: "Who is responsible for incubating the egg?",
        ans: "The male penguin",
        opts: ["The female penguin", "Both parents take turns daily", "The nesting colony cooperatively"],
        exp: "Paragraph 2 explains the female transfers the egg to the male's feet.",
        diff: "MEDIUM"
      },
      {
        q: "For how many continuous days does the male incubate the egg?",
        ans: "64 days",
        opts: ["30 days", "90 days", "12 days"],
        exp: "Paragraph 2 states: 'For sixty-four continuous days...'",
        diff: "MEDIUM"
      },
      {
        q: "What is the folder of skin called that protects the egg?",
        ans: "Brood pouch",
        opts: ["Feather envelope", "Incubation sack", "Warm pocket"],
        exp: "Paragraph 2 states: 'protecting it beneath a warm fold of skin known as a brood pouch'.",
        diff: "MEDIUM"
      },
      {
        q: "What does the male penguin eat while incubating the egg?",
        ans: "Nothing (does not eat)",
        opts: ["Small krill", "Snow and ice", "Regurgitated fish"],
        exp: "Paragraph 2 states: 'During this period, the male does not eat'.",
        diff: "MEDIUM"
      },
      {
        q: "What wind speeds can the Antarctic storms reach?",
        ans: "200 kilometres per hour",
        opts: ["100 kilometres per hour", "40 kilometres per hour", "150 kilometres per hour"],
        exp: "Paragraph 3 notes: 'winds that reach speeds of two hundred kilometres per hour'.",
        diff: "HARD"
      },
      {
        q: "How do male penguins survive the freezing winds?",
        ans: "Gather in a tight huddle",
        opts: ["Build nests from stones", "Burrow into the snow pack", "Cover themselves with feathers"],
        exp: "Paragraph 3 states: 'the males gather in a large, tightly packed huddle'.",
        diff: "HARD"
      },
      {
        q: "What food does the female penguin bring back for the chick?",
        ans: "Fish",
        opts: ["Krill", "Squid", "Sea plants"],
        exp: "Paragraph 3 states: 'the female returns with fish to feed the chick'.",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE ALCHEMIST'S WALLED GARDEN",
    text: [
      "High above the village of Eldoria sat the stone tower of Master Alaric. Beside his turret lay a walled garden, locked with a heavy iron latch. In this secluded sanctuary, Alaric cultivated rare glow-plants. Unlike ordinary flora, these blossoms emitted a faint, sapphire light under the night sky.",
      "Alaric kept a meticulous notebook written in a code. To understand it, one needed to use a piece of red glass which he kept hidden in a velvet-lined casket by his bedside. The diary detailed the secret mixture for his plant fertilizer, which required two dried juniper berries and a drop of pure spring water.",
      "One midnight, his apprentice, Arthur, crept into the garden. Arthur held the red glass sheet against the diary. By the light of a bubbling green cauldron, he read the recipe. Taking the juniper berries from a ceramic jar, he prepared the solution, realizing that he had finally found the secret to everlasting light."
    ],
    questions: [
      {
        q: "What is the name of the master alchemist in the story?",
        ans: "Master Alaric",
        opts: ["Nicholas", "Arthur", "Leo"],
        exp: "Paragraph 1 mentions 'Master Alaric'.",
        diff: "EASY"
      },
      {
        q: "What is the name of the village over which the tower sat?",
        ans: "Eldoria",
        opts: ["Blackwood", "Canterbury", "Eldwood"],
        exp: "Paragraph 1 mentions the village of Eldoria.",
        diff: "EASY"
      },
      {
        q: "What color light did the rare blossoms emit?",
        ans: "Sapphire",
        opts: ["Emerald green", "Vibrant pink", "Ruby red"],
        exp: "Paragraph 1 states: 'emitted a faint, sapphire light'.",
        diff: "EASY"
      },
      {
        q: "What object was needed to decode the notebook?",
        ans: "A piece of red glass",
        opts: ["A silver key", "A bronze compass", "An owl latch"],
        exp: "Paragraph 2 states: 'one needed to use a piece of red glass'.",
        diff: "MEDIUM"
      },
      {
        q: "Where did Master Alaric store the translation glass?",
        ans: "In a velvet-lined casket",
        opts: ["In a ceramic jar", "In his leather satchel", "In the hollow oak"],
        exp: "Paragraph 2 notes: 'hidden in a velvet-lined casket by his bedside'.",
        diff: "MEDIUM"
      },
      {
        q: "How many dried juniper berries were required for the recipe?",
        ans: "Two",
        opts: ["One", "Three", "Five"],
        exp: "Paragraph 2 mentions: 'required two dried juniper berries'.",
        diff: "MEDIUM"
      },
      {
        q: "Who is the apprentice in the story?",
        ans: "Arthur",
        opts: ["Leo", "Nicholas", "Alaric"],
        exp: "Paragraph 3 introduces the apprentice, Arthur.",
        diff: "MEDIUM"
      },
      {
        q: "What time of day did Arthur creep into the garden?",
        ans: "Midnight",
        opts: ["Late afternoon", "Early morning", "Noon"],
        exp: "Paragraph 3 states: 'One midnight, his apprentice, Arthur...'",
        diff: "HARD"
      },
      {
        q: "What color was the liquid bubbling in the alchemist's cauldron?",
        ans: "Green",
        opts: ["Sapphire blue", "Gold", "Purple"],
        exp: "Paragraph 3 states: 'by the light of a bubbling green cauldron'.",
        diff: "HARD"
      },
      {
        q: "From what type of container did Arthur extract the juniper berries?",
        ans: "A ceramic jar",
        opts: ["A velvet purse", "A leather pocketsbag", "A wooden notebook"],
        exp: "Paragraph 3 notes: 'Taking the juniper berries from a ceramic jar'.",
        diff: "HARD"
      }
    ]
  }
];

async function main() {
  console.log("Seeding English passages Part 2...");
  const subject = await prisma.subject.findFirst({
    where: { name: { equals: "English", mode: 'insensitive' } }
  });

  if (!subject) {
    console.error("Subject English not found!");
    return;
  }

  const syllabus = await prisma.syllabus.findFirst({
    where: {
      subjectId: subject.id,
      topic: { equals: "Reading Comprehension", mode: 'insensitive' }
    }
  });

  let insertedCount = 0;
  for (const p of passages) {
    // Construct passage markdown
    const passageText = `Read the passage below and answer the questions that follow.

### ${p.title}

${p.text.map(paragraph => `*${paragraph}*`).join("\n\n")}
`;

    for (const q of p.questions) {
      const qText = `${passageText}\n**Question:** ${q.q}`;
      const uniqueOptions = shuffle([q.ans, ...q.opts]);

      await prisma.question.create({
        data: {
          subjectId: subject.id,
          syllabusId: syllabus.id,
          questionType: "TEXT",
          questionText: qText,
          options: uniqueOptions,
          correctAnswer: q.ans,
          explanation: q.exp,
          difficulty: q.diff,
          marks: 1,
          isActive: true
        }
      });
      insertedCount++;
    }
  }

  console.log(`Successfully seeded Part 2: ${insertedCount} questions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
