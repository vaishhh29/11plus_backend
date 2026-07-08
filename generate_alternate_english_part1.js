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
    title: "THE SECRET OF WHISPERING WOODS",
    text: [
      "Deep within the Whispering Woods, a young explorer named Leo followed a narrow, overgrown footpath. The silver birch trees rustled in the gentle autumn breeze, sounding like quiet whispers. It was late afternoon, and the sun cast long, golden shadows across the forest floor.",
      "Leo carried a vintage leather satchel containing a wooden notebook and a bronze compass he had inherited from his explorer aunt, Clara. He checked the compass; the needle pointed steadily North, towards a dark hill. Suddenly, a blue jay dashed out of a hollow oak tree, dropping a small pinecone at his feet.",
      "Approaching the hollow oak, Leo noticed something wedged in the trunk's crevices. It was a weather-worn metal chest. He carefully brushed away the cobwebs to reveal a keyhole shaped like a star. His heart raced as he realized his bronze compass had a star-shaped knob on the bottom."
    ],
    questions: [
      {
        q: "What is the name of the young explorer?",
        ans: "Leo",
        opts: ["Liam", "Lucas", "Logan"],
        exp: "The first paragraph mentions a young explorer named Leo.",
        diff: "EASY"
      },
      {
        q: "What kind of trees rustled in the breeze?",
        ans: "Silver birch",
        opts: ["Hollow oak", "Weeping willow", "Scotch pine"],
        exp: "Paragraph 1 states: 'The silver birch trees rustled in the gentle autumn breeze'.",
        diff: "EASY"
      },
      {
        q: "What season is it in the story?",
        ans: "Autumn",
        opts: ["Spring", "Summer", "Winter"],
        exp: "Paragraph 1 mentions the 'gentle autumn breeze'.",
        diff: "EASY"
      },
      {
        q: "What was Leo's satchel made of?",
        ans: "Leather",
        opts: ["Canvas", "Cotton", "Nylon"],
        exp: "Paragraph 2 says he carried a 'vintage leather satchel'.",
        diff: "MEDIUM"
      },
      {
        q: "Whom did Leo inherit the bronze compass from?",
        ans: "His Aunt Clara",
        opts: ["His Grandfather", "His Uncle Albert", "His Father Clara"],
        exp: "Paragraph 2 states he inherited it from 'his explorer aunt, Clara'.",
        diff: "MEDIUM"
      },
      {
        q: "Where was the needle of the compass pointing?",
        ans: "North",
        opts: ["South", "East", "West"],
        exp: "Paragraph 2 says 'the needle pointed steadily North'.",
        diff: "MEDIUM"
      },
      {
        q: "Which bird dashed out of the hollow oak tree?",
        ans: "A blue jay",
        opts: ["A robin", "An eagle", "A sparrow"],
        exp: "Paragraph 2 mentions: 'a blue jay dashed out of a hollow oak tree'.",
        diff: "MEDIUM"
      },
      {
        q: "What did the bird drop at Leo's feet?",
        ans: "A pinecone",
        opts: ["A key", "A smooth shell", "An acorn"],
        exp: "Paragraph 2 mentions the blue jay 'dropping a small pinecone at his feet'.",
        diff: "HARD"
      },
      {
        q: "What was the shape of the keyhole on the metal chest?",
        ans: "A star",
        opts: ["A crescent moon", "A circle", "A triangle"],
        exp: "Paragraph 3 states: 'to reveal a keyhole shaped like a star'.",
        diff: "HARD"
      },
      {
        q: "Where on the compass was the star-shaped knob located?",
        ans: "On the bottom",
        opts: ["On the side", "On the cover", "Around the needle"],
        exp: "Paragraph 3 notes: 'his bronze compass had a star-shaped knob on the bottom'.",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE HISTORY OF THE STEAM ENGINE",
    text: [
      "The industrial revolution was powered by the development of the steam engine. In 1712, a British inventor named Thomas Newcomen built the first practical steam engine to pump water out of deep coal mines. While useful, Newcomen's engine was highly inefficient because it consumed huge amounts of coal to heat and cool the piston cylinder repeatedly.",
      "In 1765, a Scottish engineer named James Watt made a vital breakthrough. He realized that energy was wasted during the cooling process. To solve this, Watt added a 'separate condenser', which kept the main cylinder hot at all times. This simple modification reduced fuel consumption by more than seventy percent, making steam power commercially viable for factories.",
      "Soon, steam engines were adapted to power trains and ships. By the mid-nineteenth century, steam-powered locomotives were transporting cargo and passengers across continents. The age of travel had changed forever, transforming rural societies into busy industrial cities."
    ],
    questions: [
      {
        q: "In what year did Thomas Newcomen build the first practical steam engine?",
        ans: "1712",
        opts: ["1765", "1850", "1700"],
        exp: "Paragraph 1 states: 'In 1712, a British inventor named Thomas Newcomen built...' ",
        diff: "EASY"
      },
      {
        q: "What was the primary purpose of Newcomen's steam engine?",
        ans: "To pump water out of coal mines",
        opts: ["To power trains", "To manufacture clothing", "To spin thread in factories"],
        exp: "Paragraph 1 notes: 'to pump water out of deep coal mines'.",
        diff: "EASY"
      },
      {
        q: "Why was Newcomen's engine considered inefficient?",
        ans: "It consumed too much coal",
        opts: ["It was too slow", "It broke down frequently", "It required manual starting"],
        exp: "Paragraph 1 explains it 'was highly inefficient because it consumed huge amounts of coal'." ,
        diff: "EASY"
      },
      {
        q: "Where was James Watt from?",
        ans: "Scotland",
        opts: ["England", "Wales", "Ireland"],
        exp: "Paragraph 2 describes James Watt as a 'Scottish engineer'.",
        diff: "MEDIUM"
      },
      {
        q: "In what year did James Watt make his vital breakthrough?",
        ans: "1765",
        opts: ["1712", "1800", "1776"],
        exp: "Paragraph 2 states: 'In 1765, a Scottish engineer named James Watt made...' ",
        diff: "MEDIUM"
      },
      {
        q: "What crucial component did James Watt add to the steam engine?",
        ans: "A separate condenser",
        opts: ["A steel piston cylinder", "A coal furnace", "A wooden pump"],
        exp: "Paragraph 2 says Watt added a 'separate condenser'.",
        diff: "MEDIUM"
      },
      {
        q: "By how much did Watt's modification reduce fuel consumption?",
        ans: "Over 70%",
        opts: ["50%", "30%", "90%"],
        exp: "Paragraph 2 explains it 'reduced fuel consumption by more than seventy percent'.",
        diff: "MEDIUM"
      },
      {
        q: "What did the steam engines eventually power to transport cargo across continents?",
        ans: "Locomotives",
        opts: ["Automobiles", "Horse carriages", "Hot air balloons"],
        exp: "Paragraph 3 notes: 'steam-powered locomotives were transporting cargo...'",
        diff: "HARD"
      },
      {
        q: "When did steam-powered locomotives become common for continental transport?",
        ans: "Mid-nineteenth century",
        opts: ["Early eighteenth century", "Late twentieth century", "Mid-seventeenth century"],
        exp: "Paragraph 3 states: 'By the mid-nineteenth century, steam-powered locomotives...'",
        diff: "HARD"
      },
      {
        q: "What type of society did rural communities transform into due to the steam engine?",
        ans: "Industrial cities",
        opts: ["Agricultural towns", "Coastal ports", "Mining camps"],
        exp: "Paragraph 3 ends with: 'transforming rural societies into busy industrial cities'.",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE LOST CITY OF ATLANTIS",
    text: [
      "The sun had scarcely peered over the horizon when Captain Drake ordered the Nautilus to submerge. Descending into the sapphire blue waters of the Aegean Sea, the crew set out to verify a series of sonar readings. Legend spoke of a grand metropolis consumed by earthquakes, buried beneath kilometres of silt and marine volcanic rock.",
      "At a depth of twelve hundred metres, the submarine's massive headlights swept across a row of cracked white marble columns. Drake gasped as he observed the monumental structure. Fish of strange bioluminescent species swam through the crevices of what must have been a great library or temple. Unlike ordinary shipwrecks, these ruins were perfectly preserved by the cold, oxygen-poor deep-sea currents.",
      "Drake's first officer, Brenda, steered the mechanical retrieval arm toward a partially buried stone tablet. Written in an ancient Greek script, the carved letters read, 'Boulē of Atlantis'. Drake realized that this artifact was the first physical proof of the city’s actual existence, a discovery that would change human history forever."
    ],
    questions: [
      {
        q: "What is the name of Captain Drake's submarine?",
        ans: "Nautilus",
        opts: ["Poseidon", "Aegean", "Enterprise"],
        exp: "Paragraph 1 mentions that Captain Drake ordered the Nautilus to submerge.",
        diff: "EASY"
      },
      {
        q: "Which sea did the crew submerge into?",
        ans: "Aegean Sea",
        opts: ["Mediterranean Sea", "Red Sea", "Black Sea"],
        exp: "Paragraph 1 states: 'Descending into the sapphire blue waters of the Aegean Sea'.",
        diff: "EASY"
      },
      {
        q: "According to legend, what caused the city's destruction?",
        ans: "Earthquakes",
        opts: ["Volcanic eruption", "A great flood", "A meteor impact"],
        exp: "Paragraph 1 mentions: 'metropolis consumed by earthquakes'.",
        diff: "EASY"
      },
      {
        q: "At what depth did the crew discover the marble columns?",
        ans: "1200 metres",
        opts: ["500 metres", "2000 metres", "1000 metres"],
        exp: "Paragraph 2 states: 'At a depth of twelve hundred metres...'",
        diff: "MEDIUM"
      },
      {
        q: "What color were the discovered columns?",
        ans: "White",
        opts: ["Blue", "Gold", "Black"],
        exp: "Paragraph 2 notes: 'swept across a row of cracked white marble columns'.",
        diff: "MEDIUM"
      },
      {
        q: "What preserved the ruins so well at the bottom of the sea?",
        ans: "Cold, oxygen-poor deep-sea currents",
        opts: ["Thick layers of dark sand", "Coral reef growth", "Deep sea volcanic heat"],
        exp: "Paragraph 2 states: 'preserved by the cold, oxygen-poor deep-sea currents'.",
        diff: "MEDIUM"
      },
      {
        q: "What was the name of Captain Drake's first officer?",
        ans: "Brenda",
        opts: ["Betty", "Clara", "Sarah"],
        exp: "Paragraph 3 notes: 'Drake's first officer, Brenda...'",
        diff: "MEDIUM"
      },
      {
        q: "What script was carved onto the stone tablet?",
        ans: "Ancient Greek",
        opts: ["Latin", "Egyptian hieroglyphs", "Sumerian cuneiform"],
        exp: "Paragraph 3 states: 'Written in an ancient Greek script'.",
        diff: "HARD"
      },
      {
        q: "What precise words were carved on the tablet?",
        ans: "Boulē of Atlantis",
        opts: ["Temple of Poseidon", "City of Golden Gates", "Harbour of Atlantis"],
        exp: "Paragraph 3 states they read: 'Boulē of Atlantis'.",
        diff: "HARD"
      },
      {
        q: "What tool did the first officer use to retrieve the tablet?",
        ans: "Mechanical retrieval arm",
        opts: ["Diver suction hose", "Steel wire net", "Magnetic crane anchor"],
        exp: "Paragraph 3 says she 'steered the mechanical retrieval arm'.",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE GREAT BARRIER REEF",
    text: [
      "Stretching over twenty-three hundred kilometres off the northeastern coast of Australia, the Great Barrier Reef is the largest living structure on Earth. It is so immense that it can be seen clearly from outer space. The reef is not a single entity, but rather a complex system composed of nearly three thousand individual coral reefs and nine hundred tropical islands.",
      "The reef is built by billions of tiny organisms called coral polyps, which secrete skeletons of calcium carbonate. These skeletons form the rigid framework of the reef. The warm, shallow waters of the Coral Sea provide the perfect climate for these polyps, allowing them to host unique algae that give the corals their vibrant green, pink, and yellow hues.",
      "The reef supports an astonishing level of biodiversity, housing over fifteen hundred species of fish, six species of marine turtles, and thirty species of whales and dolphins. However, it faces severe threats. Rising sea temperatures caused by global climate change have triggered widespread coral bleaching events, putting the ecosystem at risk."
    ],
    questions: [
      {
        q: "Off which coast of Australia is the Great Barrier Reef located?",
        ans: "Northeastern",
        opts: ["Southwestern", "Southeastern", "Northwestern"],
        exp: "Paragraph 1 states: 'off the northeastern coast of Australia'.",
        diff: "EASY"
      },
      {
        q: "How long is the Great Barrier Reef?",
        ans: "2,300 kilometres",
        opts: ["1,500 kilometres", "3,000 kilometres", "900 kilometres"],
        exp: "Paragraph 1 states: 'Stretching over twenty-three hundred kilometres'.",
        diff: "EASY"
      },
      {
        q: "From where can the Great Barrier Reef be clearly seen?",
        ans: "Outer space",
        opts: ["Distant airplanes", "Coastal lighthouses", "Hot air balloons"],
        exp: "Paragraph 1 states: 'it can be seen clearly from outer space'.",
        diff: "EASY"
      },
      {
        q: "Approximately how many individual coral reefs make up the system?",
        ans: "3,000",
        opts: ["900", "1,500", "2,300"],
        exp: "Paragraph 1 mentions: 'nearly three thousand individual coral reefs'.",
        diff: "MEDIUM"
      },
      {
        q: "How many tropical islands are part of the reef system?",
        ans: "900",
        opts: ["300", "3,000", "1,500"],
        exp: "Paragraph 1 mentions 'nine hundred tropical islands'.",
        diff: "MEDIUM"
      },
      {
        q: "What tiny organisms build the skeleton structure of the reef?",
        ans: "Coral polyps",
        opts: ["Marine algae", "Sea anemones", "Plankton polyps"],
        exp: "Paragraph 2 states: 'built by billions of tiny organisms called coral polyps'.",
        diff: "MEDIUM"
      },
      {
        q: "What chemical compound do coral polyps secrete to form the reef framework?",
        ans: "Calcium carbonate",
        opts: ["Sodium chloride", "Silicon dioxide", "Calcium phosphate"],
        exp: "Paragraph 2 states they 'secrete skeletons of calcium carbonate'.",
        diff: "MEDIUM"
      },
      {
        q: "How many species of fish live in the Great Barrier Reef?",
        ans: "Over 1,500",
        opts: ["Over 3,000", "Over 900", "Over 2,300"],
        exp: "Paragraph 3 notes: 'housing over fifteen hundred species of fish'.",
        diff: "HARD"
      },
      {
        q: "How many species of marine turtles are supported by the reef?",
        ans: "6",
        opts: ["30", "60", "15"],
        exp: "Paragraph 3 states: 'six species of marine turtles'.",
        diff: "HARD"
      },
      {
        q: "What phenomenon is triggered by rising sea temperatures in the reef?",
        ans: "Coral bleaching",
        opts: ["Algal bloom", "Ocean acidification", "Overpopulation of fish"],
        exp: "Paragraph 3 notes: 'rising sea temperatures... have triggered widespread coral bleaching events'.",
        diff: "HARD"
      }
    ]
  },
  {
    title: "THE MYSTERY OF THE CLOCKWORK SPARROW",
    text: [
      "In the attic of Blackwood Manor, Emily worked under the dim glow of a paraffin lamp. Her workspace was crowded with copper gears, tiny brass springs, and watchmaker tools. Her father, a royal clockmaker, had disappeared three months ago, leaving behind only one clue: a mechanical clockwork sparrow.",
      "The sparrow was crafted from polished silver, with eyes made of small, glittering sapphires. When wound, its delicate metal wings fluttered and it produced a sweet, metallic whistle. However, Emily knew the bird was more than a toy. Her father's diary had warned: 'Find the hidden lever when the clock strikes twelve.'",
      "As the grandfather clock downstairs chimed midnight, she lifted the sparrow. Examining the underside of its silver tail feathers, she discovered a microscopic copper notch. Pushing it back gently, the sparrow's chest opened with a click, revealing a tiny rolled piece of parchment containing a lock combination."
    ],
    questions: [
      {
        q: "Where does Emily work in the story?",
        ans: "In the attic",
        opts: ["In the basement", "In the garden shed", "In the royal study"],
        exp: "Paragraph 1 states: 'In the attic of Blackwood Manor, Emily worked'.",
        diff: "EASY"
      },
      {
        q: "What kind of lamp provides light for Emily?",
        ans: "Paraffin lamp",
        opts: ["Gas lantern", "Electric bulb", "Wax candle"],
        exp: "Paragraph 1 mentions: 'the dim glow of a paraffin lamp'.",
        diff: "EASY"
      },
      {
        q: "What was the occupation of Emily's father?",
        ans: "Royal clockmaker",
        opts: ["Royal explorer", "Blacksmith", "Jewelry designer"],
        exp: "Paragraph 1 notes: 'Her father, a royal clockmaker'.",
        diff: "EASY"
      },
      {
        q: "How long ago did Emily's father disappear?",
        ans: "Three months ago",
        opts: ["One year ago", "Three weeks ago", "Six months ago"],
        exp: "Paragraph 1 says he 'had disappeared three months ago'.",
        diff: "MEDIUM"
      },
      {
        q: "What material was the clockwork sparrow crafted from?",
        ans: "Polished silver",
        opts: ["Solid gold", "Bronze", "Copper"],
        exp: "Paragraph 2 states: 'The sparrow was crafted from polished silver'.",
        diff: "MEDIUM"
      },
      {
        q: "What gems served as the eyes of the clockwork sparrow?",
        ans: "Sapphires",
        opts: ["Rubies", "Emeralds", "Diamonds"],
        exp: "Paragraph 2 mentions: 'eyes made of small, glittering sapphires'.",
        diff: "MEDIUM"
      },
      {
        q: "At what time was Emily supposed to seek the hidden lever?",
        ans: "Twelve o'clock",
        opts: ["Nine o'clock", "One o'clock", "Six o'clock"],
        exp: "Paragraph 2 notes: 'Find the hidden lever when the clock strikes twelve.'",
        diff: "MEDIUM"
      },
      {
        q: "What chime signalled Emily to lift the sparrow?",
        ans: "Midnight",
        opts: ["Noon", "Sunset", "Sunrise"],
        exp: "Paragraph 3 states: 'As the grandfather clock downstairs chimed midnight'.",
        diff: "HARD"
      },
      {
        q: "Where on the bird was the copper notch hidden?",
        ans: "Underside of the tail feathers",
        opts: ["Under the wing", "Inside the beak", "Behind the neck"],
        exp: "Paragraph 3 states: 'Examining the underside of its silver tail feathers, she discovered a microscopic copper notch'.",
        diff: "HARD"
      },
      {
        q: "What did the hidden compartment in the sparrow's chest hold?",
        ans: "A lock combination",
        opts: ["A tiny brass key", "A golden ring", "A maps direction"],
        exp: "Paragraph 3 ends with: 'revealing a tiny rolled piece of parchment containing a lock combination'.",
        diff: "HARD"
      }
    ]
  }
];

async function main() {
  console.log("Seeding English passages Part 1...");
  const subject = await prisma.subject.findFirst({
    where: { name: { equals: "English", mode: 'insensitive' } }
  });

  if (!subject) {
    console.error("Subject English not found!");
    return;
  }

  let syllabus = await prisma.syllabus.findFirst({
    where: {
      subjectId: subject.id,
      topic: { equals: "Reading Comprehension", mode: 'insensitive' }
    }
  });

  if (!syllabus) {
    syllabus = await prisma.syllabus.create({
      data: {
        subjectId: subject.id,
        topic: "Reading Comprehension",
        subTopic: "Literal Retrieval",
        description: "Reading comprehension questions checking factual retrieval details."
      }
    });
  }

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

  console.log(`Successfully seeded Part 1: ${insertedCount} questions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
