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
    title: "THE HIDDEN CAVE OF MOUNT ECHO",
    text: [
      "In the shade of Mount Echo, a young climber named Peter walked up a rocky trail. The mountain winds swept through the high gaps, making a sound like distant music. It was early morning, and the rising sun highlighted the grey stone cliffs in pink and orange hues.",
      "Peter carried a heavy backpack containing a climbing harness, a coil of rope and a brass magnifying lens. He was searching for a hidden cave mentioned in his father's old notebook. Suddenly, a wild mountain goat leapt across the crags, knocking loose a tiny, green emerald crystal.",
      "Approaching the rock face where the goat had jumped, Peter found a cleft hidden behind dry bracken. Moving the leaves aside, he squeezed through to discover a massive cave. On the stone floor sat an ancient iron chest, locked with a star-shaped brass key sitting directly on top."
    ],
    questions: [
      {
        q: "What is the name of the young climber in the story?",
        ans: "Peter",
        opts: ["Paul", "Patrick", "Leo"],
        exp: "Paragraph 1 mentions that the young climber was named Peter.",
        diff: "EASY"
      },
      {
        q: "What time of day does the story begin?",
        ans: "Early morning",
        opts: ["Late afternoon", "Midnight", "Noon"],
        exp: "Paragraph 1 states: 'It was early morning, and the rising sun...'",
        diff: "EASY"
      },
      {
        q: "What color hues did the rising sun throw on the cliffs?",
        ans: "Pink and orange",
        opts: ["Blue and purple", "Gold and yellow", "Red and green"],
        exp: "Paragraph 1 states: 'highlighted the grey stone cliffs in pink and orange hues'.",
        diff: "EASY"
      },
      {
        q: "What item did Peter carry to magnify objects?",
        ans: "A brass magnifying lens",
        opts: ["A glass monocle", "A steel telescope", "A bronze compass"],
        exp: "Paragraph 2 notes he carried 'a brass magnifying lens'.",
        diff: "MEDIUM"
      },
      {
        q: "What animal did Peter see leaping across the crags?",
        ans: "A wild mountain goat",
        opts: ["A blue jay", "An emperor penguin", "A brown bear"],
        exp: "Paragraph 2 states: 'a wild mountain goat leapt across the crags'.",
        diff: "MEDIUM"
      },
      {
        q: "What crystal did the goat knock loose?",
        ans: "A green emerald crystal",
        opts: ["A blue sapphire", "A quartz rock", "A gold nugget"],
        exp: "Paragraph 2 notes the goat knocked loose 'a tiny, green emerald crystal'.",
        diff: "MEDIUM"
      },
      {
        q: "Whose notebook was Peter using to find the cave?",
        ans: "His father's",
        opts: ["His aunt Clara's", "Professor Sterling's", "His grandfather's"],
        exp: "Paragraph 2 says he was 'searching for a hidden cave mentioned in his father's old notebook'.",
        diff: "MEDIUM"
      },
      {
        q: "What was hiding the entrance of the cave cleft?",
        ans: "Dry bracken",
        opts: ["Thick roots of silver birch", "Fallen pine trees", "Cracked marble columns"],
        exp: "Paragraph 3 notes: 'a cleft hidden behind dry bracken'.",
        diff: "HARD"
      },
      {
        q: "What material was the locked chest made of?",
        ans: "Iron",
        opts: ["Wood", "Silver", "Stone"],
        exp: "Paragraph 3 says he discovered: 'a massive cave. On the stone floor sat an ancient iron chest'.",
        diff: "HARD"
      },
      {
        q: "Where was the star-shaped brass key located?",
        ans: "Sitting directly on top of the chest",
        opts: ["Hidden inside the satchel", "Wedged in the crevice", "Hanging in the cleft"],
        exp: "Paragraph 3 states the chest was 'locked with a star-shaped brass key sitting directly on top'.",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE SECRET LANGUAGE OF BEES",
    text: [
      "Honeybees are social insects that live in highly structured colonies. In 1947, an Austrian biologist named Karl von Frisch published his discovery that bees communicate using a movement known as the 'waggle dance'. This dance tells other bees the location of flowers containing nectar.",
      "When a scout bee finds a rich food source, it returns to the dark hive and performs the dance on the vertical honeycomb. The dance consists of running in a figure-eight pattern. The angle of the central run relative to the honeycomb indicates the angle of the food source relative to the sun.",
      "Furthermore, the speed and duration of the dance tell the other bees the distance to the flowers. A longer dance indicates a greater distance. By interpreting these movements, the colony can gather food efficiently without wasting energy searching blindly."
    ],
    questions: [
      {
        q: "In what year did Karl von Frisch publish his discovery?",
        ans: "1947",
        opts: ["1903", "1712", "1845"],
        exp: "Paragraph 1 mentions the year 1947.",
        diff: "EASY"
      },
      {
        q: "What type of biologist was Karl von Frisch?",
        ans: "Austrian",
        opts: ["German", "Scottish", "Spanish"],
        exp: "Paragraph 1 describes him as an 'Austrian biologist'.",
        diff: "EASY"
      },
      {
        q: "What is the name of the dance used by honeybees?",
        ans: "Waggle dance",
        opts: ["Figure-eight dance", "Honeycomb dance", "Nectar dance"],
        exp: "Paragraph 1 states: 'communicate using a movement known as the waggle dance'.",
        diff: "EASY"
      },
      {
        q: "Where inside the hive is the dance performed?",
        ans: "On the vertical honeycomb",
        opts: ["On the flat wooden floor", "Near the entrance runway", "Around the queen's cell"],
        exp: "Paragraph 2 states the bee 'performs the dance on the vertical honeycomb'.",
        diff: "MEDIUM"
      },
      {
        q: "What shape or pattern does the dance follow?",
        ans: "Figure-eight",
        opts: ["Circular", "Zigzag", "Straight line"],
        exp: "Paragraph 2 states: 'consists of running in a figure-eight pattern'.",
        diff: "MEDIUM"
      },
      {
        q: "What does the angle of the central run indicate?",
        ans: "The angle of the food source relative to the sun",
        opts: ["The height of the flowers", "The count of bees needed", "The temperature of the air"],
        exp: "Paragraph 2 explains it 'indicates the angle of the food source relative to the sun'.",
        diff: "MEDIUM"
      },
      {
        q: "Which bee performs the dance?",
        ans: "Scout bee",
        opts: ["Queen bee", "Drone bee", "Apprentice bee"],
        exp: "Paragraph 2 begins: 'When a scout bee finds a rich food source...'",
        diff: "MEDIUM"
      },
      {
        q: "What two parameters of the dance indicate the distance to the flowers?",
        ans: "Speed and duration",
        opts: ["Angle and height", "Pattern and size", "Loudness and temperature"],
        exp: "Paragraph 3 notes: 'the speed and duration of the dance tell the other bees the distance'.",
        diff: "HARD"
      },
      {
        q: "What does it mean if a dance is longer in duration?",
        ans: "Greater distance to flowers",
        opts: ["Higher quality nectar", "More dangerous wind speeds", "Flowers are closer"],
        exp: "Paragraph 3 states: 'A longer dance indicates a greater distance'.",
        diff: "HARD"
      },
      {
        q: "What food source are the honeybees trying to locate?",
        ans: "Flowers containing nectar",
        opts: ["Water reservoirs", "Pinecone oil", "Bark sap"],
        exp: "Paragraph 1 concludes: 'tells other bees the location of flowers containing nectar'.",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE PHANTOM OF THE OPERA HOUSE",
    text: [
      "In the city of Paris, the grand Opera House loomed in the winter fog. A young soprano, Christine, rehearsed her lines in a small dressing room lit by gas globes. She had received a series of anonymous letters written in violet ink, offering advice on how to improve her singing voice.",
      "The letters were signed with a small emblem representing a violin. They instructed her to practice a series of musical scales every evening at exactly seven o'clock. Christine believed the writer was the legendary 'Opera Phantom' who lived in the brick chambers beneath the stage.",
      "One evening, she noticed a hollow sound behind the dressing room mirror. Pushing the wooden molding, the mirror slid aside to reveal a dark, stone passage. She stepped inside, holding a brass candle holder, her heart beating fast as she heard a melody playing in the darkness."
    ],
    questions: [
      {
        q: "In which city is the grand Opera House located?",
        ans: "Paris",
        opts: ["London", "Naples", "Edinburgh"],
        exp: "Paragraph 1 states: 'In the city of Paris, the grand Opera House loomed...'",
        diff: "EASY"
      },
      {
        q: "What is the name of the young soprano in the story?",
        ans: "Christine",
        opts: ["Valerie", "Brenda", "Emily"],
        exp: "Paragraph 1 mentions: 'A young soprano, Christine'.",
        diff: "EASY"
      },
      {
        q: "What color ink was used in the anonymous letters?",
        ans: "Violet",
        opts: ["Black", "Gold", "Red"],
        exp: "Paragraph 1 notes: 'anonymous letters written in violet ink'.",
        diff: "EASY"
      },
      {
        q: "What emblem was signed at the bottom of the letters?",
        ans: "A violin",
        opts: ["An owl", "A star", "A key"],
        exp: "Paragraph 2 states: 'signed with a small emblem representing a violin'.",
        diff: "MEDIUM"
      },
      {
        q: "At what time was Christine instructed to practice her scales?",
        ans: "Seven o'clock",
        opts: ["Twelve o'clock", "Midnight", "Nine o'clock"],
        exp: "Paragraph 2 notes: 'every evening at exactly seven o'clock'.",
        diff: "MEDIUM"
      },
      {
        q: "According to the story, where did the Opera Phantom live?",
        ans: "In the brick chambers beneath the stage",
        opts: ["In the attic of Blackwood Manor", "In Saint Paul's Cathedral", "In the village hall tower"],
        exp: "Paragraph 2 states the Phantom 'lived in the brick chambers beneath the stage'.",
        diff: "MEDIUM"
      },
      {
        q: "What did Christine discover behind her dressing room mirror?",
        ans: "A dark, stone passage",
        opts: ["An ancient iron chest", "A box of juniper berries", "A vintage leather satchel"],
        exp: "Paragraph 3 notes: 'revealing a dark, stone passage'.",
        diff: "MEDIUM"
      },
      {
        q: "What mechanism did she push to slide the mirror aside?",
        ans: "The wooden molding",
        opts: ["A star-shaped button", "A secret lever", "A metal latch"],
        exp: "Paragraph 3 states: 'Pushing the wooden molding, the mirror slid aside'.",
        diff: "HARD"
      },
      {
        q: "What item did Christine hold as she entered the passage?",
        ans: "A brass candle holder",
        opts: ["A paraffin lamp", "A magnifying monocle", "A wooden notebook"],
        exp: "Paragraph 3 states: 'holding a brass candle holder'.",
        diff: "HARD"
      },
      {
        q: "What did Christine hear playing in the darkness?",
        ans: "A melody",
        opts: ["A clock chiming", "A metallic whistle", "Bees buzzing"],
        exp: "Paragraph 3 ends: 'as she heard a melody playing in the darkness'.",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE HISTORY OF THE OLYMPIC GAMES",
    text: [
      "The ancient Olympic Games originated in Greece in 776 BC, held in honor of Zeus, the king of the Greek gods. The games took place every four years in Olympia, a sacred valley. Unlike modern global competition, only free Greek male citizens were allowed to participate.",
      "The primary event in the early games was the stadion, a footrace of approximately one hundred and ninety-two metres. Over time, other events were added, including wrestling, boxing, and chariot racing. The victors did not receive medals; instead, they were crowned with a wreath of olive leaves from a sacred tree.",
      "The ancient games were held for over a thousand years until AD 393, when the Roman Emperor Theodosius I banned them, viewing them as pagan festivals. In 1896, a French educator named Pierre de Coubertin revived the games in Athens, starting the modern era of athletics."
    ],
    questions: [
      {
        q: "In what year did the ancient Olympic Games originate?",
        ans: "776 BC",
        opts: ["AD 393", "1896", "1712"],
        exp: "Paragraph 1 states: 'originated in Greece in 776 BC'.",
        diff: "EASY"
      },
      {
        q: "Which Greek god were the games held to honor?",
        ans: "Zeus",
        opts: ["Poseidon", "Apollo", "Hercule"],
        exp: "Paragraph 1 states: 'held in honor of Zeus, the king of the Greek gods'.",
        diff: "EASY"
      },
      {
        q: "How often were the ancient games held?",
        ans: "Every four years",
        opts: ["Every year", "Every two years", "Every five years"],
        exp: "Paragraph 1 states: 'The games took place every four years'.",
        diff: "EASY"
      },
      {
        q: "Who was allowed to participate in the ancient Olympic Games?",
        ans: "Free Greek male citizens",
        opts: ["Anyone from the region", "Athletes from all nations", "Roman soldiers only"],
        exp: "Paragraph 1 states: 'only free Greek male citizens were allowed to participate'.",
        diff: "MEDIUM"
      },
      {
        q: "What was the station footrace length in the early games?",
        ans: "192 metres",
        opts: ["100 metres", "260 metres", "37 metres"],
        exp: "Paragraph 2 describes it as 'approximately one hundred and ninety-two metres'.",
        diff: "MEDIUM"
      },
      {
        q: "What prize did the victors receive in the ancient games?",
        ans: "A wreath of olive leaves",
        opts: ["Gold medals", "Silver shields", "Sacks of coal"],
        exp: "Paragraph 2 notes: 'they were crowned with a wreath of olive leaves'.",
        diff: "MEDIUM"
      },
      {
        q: "Which Roman Emperor banned the ancient games?",
        ans: "Theodosius I",
        opts: ["Julius Caesar", "Augustus", "Marcus Aurelius"],
        exp: "Paragraph 3 notes: 'the Roman Emperor Theodosius I banned them'.",
        diff: "MEDIUM"
      },
      {
        q: "In what year were the modern Olympic Games revived?",
        ans: "1896",
        opts: ["1947", "1845", "1903"],
        exp: "Paragraph 3 states: 'In 1896, a French educator...' ",
        diff: "HARD"
      },
      {
        q: "What was the name of the French educator who revived the games?",
        ans: "Pierre de Coubertin",
        opts: ["Rocque de Alcubierre", "James Watt", "Christopher Jones"],
        exp: "Paragraph 3 states: 'named Pierre de Coubertin revived the games'.",
        diff: "HARD"
      },
      {
        q: "In which city were the first modern Olympic Games held?",
        ans: "Athens",
        opts: ["Paris", "London", "Olympia"],
        exp: "Paragraph 3 states: 'revived the games in Athens'.",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE SORCERER OF THE SUNKEN TOWER",
    text: [
      "Deep beneath the surface of Lake Windermere stood the Sunken Tower of Sorcerer Cynthia. The stone walls were covered in glowing bioluminescent weeds, shedding an eerie purple light on the underwater floor. Cynthia kept a locked vault of gold containing ancient spell books.",
      "She recorded her magical findings in a parchment diary written in mirror-text. To read the diary, she utilized a circular obsidian mirror which she kept in a leather pouch at her waist. The diary explained that the spell for breathing underwater required three dried kelp leaves and a drop of mermaid tear.",
      "One morning, her young helper, Daniel, swam down to the tower entryway. Carrying a glass globule containing oxygen, he slipped the obsidian mirror out of the pouch. By the glow of a nearby purple weed, he translated the mirror-text and gathered the kelp leaves from a silver chest."
    ],
    questions: [
      {
        q: "Under which lake did the Sunken Tower sit?",
        ans: "Lake Windermere",
        opts: ["Lake Echo", "Lake Eldoria", "Aegean Sea"],
        exp: "Paragraph 1 mentions the tower stood deep beneath Lake Windermere.",
        diff: "EASY"
      },
      {
        q: "What is the name of the sorcerer in the story?",
        ans: "Cynthia",
        opts: ["Alaric", "Christine", "Clara"],
        exp: "Paragraph 1 introduces 'Sorcerer Cynthia'.",
        diff: "EASY"
      },
      {
        q: "What kind of light did the weeds on the tower walls shed?",
        ans: "Purple",
        opts: ["Sapphire blue", "Green", "Gold"],
        exp: "Paragraph 1 notes: 'shedding an eerie purple light'.",
        diff: "EASY"
      },
      {
        q: "What type of writing script was used in Cynthia's diary?",
        ans: "Mirror-text",
        opts: ["Ancient Greek", "Airship cipher", "Golden runes"],
        exp: "Paragraph 2 states the diary was 'written in mirror-text'.",
        diff: "MEDIUM"
      },
      {
        q: "What tool did Cynthia use to read the mirror-text?",
        ans: "A circular obsidian mirror",
        opts: ["A piece of red glass", "A brass magnifying lens", "A magnifying monocle"],
        exp: "Paragraph 2 states she used 'a circular obsidian mirror'.",
        diff: "MEDIUM"
      },
      {
        q: "Where did Cynthia keep her circular mirror?",
        ans: "In a leather pouch at her waist",
        opts: ["In a velvet casket bedside", "In her utility cabinet", "In a ceramic jar"],
        exp: "Paragraph 2 notes: 'she kept in a leather pouch at her waist'.",
        diff: "MEDIUM"
      },
      {
        q: "Who is the helper in the story?",
        ans: "Daniel",
        opts: ["Leo", "Arthur", "Albert"],
        exp: "Paragraph 3 notes: 'her young helper, Daniel'.",
        diff: "MEDIUM"
      },
      {
        q: "How many dried kelp leaves were required for the water-breathing spell?",
        ans: "Three",
        opts: ["Two", "Five", "Ten"],
        exp: "Paragraph 2 states: 'required three dried kelp leaves'.",
        diff: "HARD"
      },
      {
        q: "What did Daniel carry to breathe oxygen underwater?",
        ans: "A glass globule",
        opts: ["A paraffin lamp", "A copper hose", "A scuba harness"],
        exp: "Paragraph 3 states: 'Carrying a glass globule containing oxygen'.",
        diff: "HARD"
      },
      {
        q: "From where did Daniel gather the dried kelp leaves?",
        ans: "A silver chest",
        opts: ["An iron chest", "A ceramic jar", "The tower floor weeds"],
        exp: "Paragraph 3 concludes: 'gathered the kelp leaves from a silver chest'.",
        diff: "HARD"
      }
    ]
  }
];

async function main() {
  console.log("Seeding English passages Part 4...");
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

  console.log(`Successfully seeded Part 4: ${insertedCount} questions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
