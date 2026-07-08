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
    title: "THE DISCOVERY OF POMPEII",
    text: [
      "In the year AD 79, Mount Vesuvius erupted with devastating power, burying the Roman city of Pompeii under meters of ash and pumice. The city was completely lost for list centuries until 1748, when a Spanish military engineer named Rocque Joaquin de Alcubierre began excavations in the region.",
      "Initially, Alcubierre was looking for ancient statues to decorate the royal palace of Naples. As workers dug through the hardened volcanic debris, they uncovered houses that were frozen in time. The thick layer of dry volcanic ash had preserved everyday household items, wall frescoes, and even loaves of bread in ovens.",
      "Among the list of discoveries was a sign at the entrance of a house: Cave Canem, which translates to 'Beware of the Dog'. These discoveries offered archaeologists a window into daily Roman life, showing details that written history had never recorded."
    ],
    questions: [
      {
        q: "In what year did Mount Vesuvius erupt?",
        ans: "AD 79",
        opts: ["AD 1748", "AD 100", "AD 790"],
        exp: "Paragraph 1 mentions that Mount Vesuvius erupted in the year AD 79.",
        diff: "EASY"
      },
      {
        q: "In what year did excavations of Pompeii begin?",
        ans: "1748",
        opts: ["1712", "1845", "1800"],
        exp: "Paragraph 1 states: 'completely lost for list centuries until 1748'.",
        diff: "EASY"
      },
      {
        q: "What was the nationality of Rocque Joaquin de Alcubierre?",
        ans: "Spanish",
        opts: ["Italian", "British", "French"],
        exp: "Paragraph 1 describes de Alcubierre as a 'Spanish military engineer'.",
        diff: "EASY"
      },
      {
        q: "What object was Alcubierre searching for initially?",
        ans: "Statues",
        opts: ["Coins", "Parchments", "Gold jewellery"],
        exp: "Paragraph 2 notes: 'Alcubierre was looking for ancient statues'.",
        diff: "MEDIUM"
      },
      {
        q: "Where was Alcubierre planning to display the discovered statues?",
        ans: "The royal palace of Naples",
        opts: ["The Vatican Museum", "Saint Paul's Cathedral", "Eldoria Town Hall"],
        exp: "Paragraph 2 notes: 'to decorate the royal palace of Naples'.",
        diff: "MEDIUM"
      },
      {
        q: "What preserved the ancient bread in the oven?",
        ans: "Volcanic ash",
        opts: ["Fresco plaster", "Earthquake steam", "Pumice stone"],
        exp: "Paragraph 2 explains: 'The thick layer of dry volcanic ash had preserved...'",
        diff: "MEDIUM"
      },
      {
        q: "Which exact house sign was translated in the passage?",
        ans: "Cave Canem",
        opts: ["Boulē of Atlantis", "Harbour Light", "Excalibur"],
        exp: "Paragraph 3 mentions the sign at the entrance: 'Cave Canem'.",
        diff: "MEDIUM"
      },
      {
        q: "What is the English translation of Cave Canem?",
        ans: "Beware of the Dog",
        opts: ["Welcome to my Home", "Do not block the Carriage", "Enter at your own Risk"],
        exp: "Paragraph 3 states it translates to: 'Beware of the Dog'.",
        diff: "HARD"
      },
      {
        q: "What was Alcubierre's professional role?",
        ans: "Military engineer",
        opts: ["Royal librarian", "Alchemist", "Submarine captain"],
        exp: "Paragraph 1 describes him as a 'military engineer'.",
        diff: "HARD"
      },
      {
        q: "What type of food inside the ovens was preserved by volcanic ash?",
        ans: "Loaves of bread",
        opts: ["Fish fillets", "Juniper berries", "Pinecones"],
        exp: "Paragraph 2 concludes with: 'and even loaves of bread in ovens'.",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE SKY PIRATE'S COMPASS",
    text: [
      "Captain Valerie stood on the deck of the silver airship, Windrunner. Winds howled across the misty peaks of the Cloudcliff Mountains, shaking the ship's wooden gasbag frame. She checked her coordinates using an extraordinary brass instrument: a sky pirate's compass.",
      "The compass did not have a magnetic needle; instead, a tiny floating crystal globule pointed toward pockets of high-pressure air that allowed the ship to float. Its dial was engraved with coordinates written in a secret airship cipher. Valerie carried a magnifying monocle in her leather holster to read the tiny runes.",
      "Suddenly, her lookout, Barnaby, shouted from the crow's nest, pointing to a dark storm cloud. According to the compass crystal, the storm was surrounded by a strong drafting current. Valerie gripped the steering helm and turned the ship toward the draft, sliding into the storm to escape three pursuing naval patrol vessels."
    ],
    questions: [
      {
        q: "What is the name of Captain Valerie's airship?",
        ans: "Windrunner",
        opts: ["Nautilus", "Flyer", "Nightingale"],
        exp: "Paragraph 1 mentions the airship, Windrunner.",
        diff: "EASY"
      },
      {
        q: "Which mountain range was the airship crossing?",
        ans: "Cloudcliff Mountains",
        opts: ["Aegean Alps", "Appalachian Dunes", "Eldoria Peaks"],
        exp: "Paragraph 1 notes: 'misty peaks of the Cloudcliff Mountains'.",
        diff: "EASY"
      },
      {
        q: "What material framed the gasbag of the airship?",
        ans: "Wood",
        opts: ["Steel", "Copper", "Leather"],
        exp: "Paragraph 1 mentions: 'shaking the ship's wooden gasbag frame'.",
        diff: "EASY"
      },
      {
        q: "What pointed the direction in the sky pirate's compass?",
        ans: "A floating crystal globule",
        opts: ["A magnetic steel needle", "An engraved gold knob", "A rotating star gear"],
        exp: "Paragraph 2 states: 'a tiny floating crystal globule pointed toward...' ",
        diff: "MEDIUM"
      },
      {
        q: "What did the compass actually point toward?",
        ans: "Pockets of high-pressure air",
        opts: ["Magnetic North poles", "Buried metal chests", "Glow-plant seeds"],
        exp: "Paragraph 2 notes it pointed 'toward pockets of high-pressure air'.",
        diff: "MEDIUM"
      },
      {
        q: "How did Valerie read the tiny runes on the dial?",
        ans: "With a magnifying monocle",
        opts: ["With red glass", "With a bronze mirror", "With a candle lamp"],
        exp: "Paragraph 2 notes she carried a 'magnifying monocle in her leather holster'.",
        diff: "MEDIUM"
      },
      {
        q: "What is the name of the lookout on the airship?",
        ans: "Barnaby",
        opts: ["Nicholas", "Arthur", "Leo"],
        exp: "Paragraph 3 notes: 'her lookout, Barnaby...'",
        diff: "MEDIUM"
      },
      {
        q: "Where was the lookout positioned on the ship?",
        ans: "Crow's nest",
        opts: ["Steering helm", "Lower wing cabin", "Bedside casket"],
        exp: "Paragraph 3 states he shouted 'from the crow's nest'.",
        diff: "HARD"
      },
      {
        q: "How many naval patrol vessels were pursuing the airship?",
        ans: "Three",
        opts: ["Two", "Five", "One"],
        exp: "Paragraph 3 notes: 'to escape three pursuing naval patrol vessels'.",
        diff: "HARD"
      },
      {
        q: "Where was Valerie's magnifying monocle stored?",
        ans: "In her leather holster",
        opts: ["In her satchel pouch", "In the pilot cabin", "In a velvet casket"],
        exp: "Paragraph 2 mentions she carried it 'in her leather holster'.",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE SCIENCE OF Northern Lights",
    text: [
      "The Aurora Borealis, commonly known as the Northern Lights, is a natural light display that illuminates the night skies of polar regions. This dazzling phenomenon is caused by collisions between electrically charged particles from the sun and gaseous particles of the Earth's atmosphere.",
      "The process begins on the sun’s surface, where magnetic storms release clouds of gas containing solar wind particles. When these particles reach Earth, they are guided by the planet's magnetic field toward the magnetic North and South poles. As they collide with nitrogen and oxygen atoms, they release energy in the form of glowing light.",
      "The color of the auroras depends on the type of gas involved and the altitude of the collisions. Green auroras, which are the most common, are produced by oxygen atoms at altitudes of up to one hundred and fifty kilometres. Red auroras are rarer and occur at higher altitudes, caused by oxygen collisions above three hundred kilometres."
    ],
    questions: [
      {
        q: "What is the scientific name for the Northern Lights?",
        ans: "Aurora Borealis",
        opts: ["Aurora Australis", "Borealis Solar", "Magnetic Aurora"],
        exp: "Paragraph 1 states: 'The Aurora Borealis, commonly known as...'",
        diff: "EASY"
      },
      {
        q: "What causes the Northern Lights display?",
        ans: "Collisions of solar particles and Earth's gases",
        opts: ["Volcanic eruptions in the Arctic", "Refraction of ice crystals", "Bioluminescent marine blooms"],
        exp: "Paragraph 1 notes it is caused by 'collisions between electrically charged particles from the sun and gaseous particles...'",
        diff: "EASY"
      },
      {
        q: "Where are the solar wind particles guided to upon reaching Earth?",
        ans: "North and South magnetic poles",
        opts: ["The equator", "The Earth's inner core", "Distant mountain peaks"],
        exp: "Paragraph 2 states they are guided 'toward the magnetic North and South poles'.",
        diff: "EASY"
      },
      {
        q: "Which two atoms do solar particles collide with in Earth's atmosphere?",
        ans: "Nitrogen and oxygen",
        opts: ["Helium and hydrogen", "Carbon and oxygen", "Nitrogen and carbon"],
        exp: "Paragraph 2 mentions: 'As they collide with nitrogen and oxygen atoms'.",
        diff: "MEDIUM"
      },
      {
        q: "What is the most common color of the Aurora Borealis?",
        ans: "Green",
        opts: ["Red", "Sapphire blue", "Gold yellow"],
        exp: "Paragraph 3 notes: 'Green auroras, which are the most common...'",
        diff: "MEDIUM"
      },
      {
        q: "What gas produces the common green aurora?",
        ans: "Oxygen",
        opts: ["Nitrogen", "Hydrogen", "Carbon dioxide"],
        exp: "Paragraph 3 notes green auroras are 'produced by oxygen atoms'.",
        diff: "MEDIUM"
      },
      {
        q: "At what altitude are green auroras typically generated?",
        ans: "Up to 150 kilometres",
        opts: ["Up to 300 kilometres", "Up to 80 kilometres", "Over 500 kilometres"],
        exp: "Paragraph 3 states: 'at altitudes of up to one hundred and fifty kilometres'.",
        diff: "MEDIUM"
      },
      {
        q: "At what altitude range do rare red auroras occur?",
        ans: "Above 300 kilometres",
        opts: ["Below 100 kilometres", "Around 150 kilometres", "Between 50 and 80 kilometres"],
        exp: "Paragraph 3 states: 'oxygen collisions above three hundred kilometres'.",
        diff: "HARD"
      },
      {
        q: "What brings the solar particles from the sun to the Earth?",
        ans: "Solar wind",
        opts: ["Atmospheric draft", "Magnetic columns", "Gravity currents"],
        exp: "Paragraph 2 states: 'magnetic storms release clouds of gas containing solar wind particles'.",
        diff: "HARD"
      },
      {
        q: "Where does the glowing auroral energy originate from?",
        ans: "Atmospheric collisions releasing energy",
        opts: ["Oxygen atoms reflecting solar light", "Dust reflecting moonlight", "The sun's reflection on polar glaciers"],
        exp: "Paragraph 2 closes with: 'they release energy in the form of glowing light'.",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE MIDNIGHT RUN OF THE EXPRESS TRAIN",
    text: [
      "Under a blanket of dark winter clouds, the Silver Arrow locomotive sped along the steel tracks of the Highland Line. The engineer, Kenneth, pulled the copper steam whistle, warning the station master at Oakridge that they were passing through without stopping. The train was carrying a secure iron chest containing the royal crown jewels.",
      "Kenneth checked his watch; it was exactly 11:45 PM. The train had to reach Edinburgh before sunrise to deliver the cargo. Suddenly, the train's coal fireman, Albert, pointed to a red signal lamp swinging in the distance. A heavy pine tree had fallen across the tracks, blocking the path.",
      "Kenneth applied the emergency air brakes, sending sparks flying into the cold air. The steel wheels screeched against the tracks, and the heavy locomotive came to a halt just thirty feet from the fallen tree. Albert grabbed an axe from the utility cabinet, and together they raced out to clear the obstacle."
    ],
    questions: [
      {
        q: "What is the name of the locomotive in the story?",
        ans: "Silver Arrow",
        opts: ["Nautilus", "Windrunner", "Flyer"],
        exp: "Paragraph 1 mentions the Silver Arrow locomotive.",
        diff: "EASY"
      },
      {
        q: "Which rail line did the locomotive travel along?",
        ans: "Highland Line",
        opts: ["Oakridge Line", "Edinburgh Express", "Saint Paul's Track"],
        exp: "Paragraph 1 states it sped along 'the Highland Line'.",
        diff: "EASY"
      },
      {
        q: "What secure items was the train carrying?",
        ans: "Royal crown jewels",
        opts: ["Ancient Greek tablets", "Silver watch parts", "Velvet notebooks"],
        exp: "Paragraph 1 states: 'chest containing the royal crown jewels'.",
        diff: "EASY"
      },
      {
        q: "What is the name of the train engineer?",
        ans: "Kenneth",
        opts: ["Albert", "Nicholas", "Alaric"],
        exp: "Paragraph 1 mentions: 'The engineer, Kenneth'.",
        diff: "MEDIUM"
      },
      {
        q: "What time was it when Kenneth checked his watch?",
        ans: "11:45 PM",
        opts: ["12:00 AM", "11:12 PM", "6:00 AM"],
        exp: "Paragraph 2 notes: 'it was exactly 11:45 PM'.",
        diff: "MEDIUM"
      },
      {
        q: "What was the destination city for the train's cargo?",
        ans: "Edinburgh",
        opts: ["London", "Kitty Hawk", "Naples"],
        exp: "Paragraph 2 states: 'The train had to reach Edinburgh before sunrise'.",
        diff: "MEDIUM"
      },
      {
        q: "What is the name of the coal fireman?",
        ans: "Albert",
        opts: ["Kenneth", "Barnaby", "Drake"],
        exp: "Paragraph 2 mentions: 'the train's coal fireman, Albert'.",
        diff: "MEDIUM"
      },
      {
        q: "What was blocking the train tracks?",
        ans: "A heavy pine tree",
        opts: ["A row of marble columns", "A mechanical retrieval arm", "A massive boulder"],
        exp: "Paragraph 2 states: 'A heavy pine tree had fallen across the tracks'.",
        diff: "HARD"
      },
      {
        q: "How close to the tree did the train stop?",
        ans: "Thirty feet",
        opts: ["Twelve metres", "Eighty kilometres", "Three feet"],
        exp: "Paragraph 3 notes: 'came to a halt just thirty feet from the fallen tree'.",
        diff: "HARD"
      },
      {
        q: "Where did Albert retrieve the axe from?",
        ans: "The utility cabinet",
        opts: ["The leather satchel", "The coal furnace", "The luggage hold"],
        exp: "Paragraph 3 notes: 'Albert grabbed an axe from the utility cabinet'.",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE VOYAGE OF THE MAYFLOWER",
    text: [
      "In September 1620, a merchant ship named the Mayflower sailed from Plymouth, England, carrying one hundred and two passengers seeking a new life. The vessel was small and crowded, with passengers living in dark, cramped quarters beneath the main deck during their sixty-six-day voyage across the Atlantic Ocean.",
      "The voyage was plagued by fierce autumn storms, which damaged the ship's main timber beam. The captain, Christopher Jones, considered returning to England, but the crew managed to secure the beam using a massive iron jack screw. This vital repair allowed the Mayflower to continue its journey, despite the leaking walls.",
      "On November 11, 1620, the crew sighted land. They anchored in what is now Provincetown Harbor, Massachusetts. The passengers drafted and signed the Mayflower Compact, which established a self-governing colony, laying the foundation for democratic government in the new world."
    ],
    questions: [
      {
        q: "In what month and year did the Mayflower set sail?",
        ans: "September 1620",
        opts: ["November 1620", "September 1748", "October 1620"],
        exp: "Paragraph 1 states: 'In September 1620...'",
        diff: "EASY"
      },
      {
        q: "From which English port city did the Mayflower depart?",
        ans: "Plymouth",
        opts: ["London", "Southampton", "Bristol"],
        exp: "Paragraph 1 states: 'sailed from Plymouth, England'.",
        diff: "EASY"
      },
      {
        q: "How many passengers were carried on the Mayflower?",
        ans: "102",
        opts: ["150", "66", "200"],
        exp: "Paragraph 1 mentions: 'carrying one hundred and two passengers'.",
        diff: "EASY"
      },
      {
        q: "How long did the voyage across the Atlantic Ocean last?",
        ans: "66 days",
        opts: ["64 days", "12 days", "30 days"],
        exp: "Paragraph 1 mentions 'their sixty-six-day voyage'.",
        diff: "MEDIUM"
      },
      {
        q: "What is the name of the captain of the Mayflower?",
        ans: "Christopher Jones",
        opts: ["Captain Drake", "Captain Valerie", "Master Alaric"],
        exp: "Paragraph 2 states: 'The captain, Christopher Jones...'",
        diff: "MEDIUM"
      },
      {
        q: "What part of the ship was damaged by the autumn storms?",
        ans: "Main timber beam",
        opts: ["Steering rudder", "Canvas sails", "Steam engine cylinder"],
        exp: "Paragraph 2 mentions storms 'damaged the ship's main timber beam'.",
        diff: "MEDIUM"
      },
      {
        q: "What tool did the crew use to secure the damaged beam?",
        ans: "An iron jack screw",
        opts: ["A copper rope notch", "A wooden anvil rail", "A steel retrieval arm"],
        exp: "Paragraph 2 notes they secured it 'using a massive iron jack screw'.",
        diff: "MEDIUM"
      },
      {
        q: "On what date did the crew first sight land?",
        ans: "November 11, 1620",
        opts: ["September 17, 1620", "December 25, 1620", "November 1, 1620"],
        exp: "Paragraph 3 states: 'On November 11, 1620, the crew sighted land'.",
        diff: "HARD"
      },
      {
        q: "Where did the Mayflower anchor when they spotted land?",
        ans: "Provincetown Harbor",
        opts: ["Oakridge Harbor", "Boston Harbor", "Plymouth Shore"],
        exp: "Paragraph 3 notes: 'anchored in what is now Provincetown Harbor, Massachusetts'.",
        diff: "HARD"
      },
      {
        q: "What agreement did the passengers write and sign to establish order?",
        ans: "Mayflower Compact",
        opts: ["Boulē Assembly Record", "Saint Paul's Charter", "Royal Clockwork Act"],
        exp: "Paragraph 3 notes: 'The passengers drafted and signed the Mayflower Compact'.",
        diff: "HARD"
      }
    ]
  }
];

async function main() {
  console.log("Seeding English passages Part 3...");
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

  console.log(`Successfully seeded Part 3: ${insertedCount} questions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
