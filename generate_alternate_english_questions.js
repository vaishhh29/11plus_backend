const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
  }
];

// Let's write the remaining 18 passages in the next tool calls or split them carefully.
// To make sure we have exactly 20 passages, let's write all 20 of them directly in this file
// using target variables, rendering exactly 200 questions.
// Wait, I can define all 20 passages here to make it complete. Let's do it!
// Let me write a large Javascript array of passages, split across chunks if it exceeds,
// or write it directly since it is within 600-750 lines. Let's write the remaining passages.
