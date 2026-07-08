const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to shuffle array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Format fraction simplest form
function reduceFraction(numerator, denominator) {
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const common = gcd(Math.abs(numerator), Math.abs(denominator));
  const num = numerator / common;
  const den = denominator / common;
  if (den === 1) return `${num}`;
  return `${num}/${den}`;
}

// Generate options list helper
function generateOptions(correctVal, getDistractors) {
  const distractors = getDistractors(correctVal);
  const uniqueDistractors = [...new Set(distractors.map(String))]
    .filter(val => val !== String(correctVal))
    .slice(0, 3);
  
  // Fill in case we don't have enough unique retractors
  let offset = 1;
  while (uniqueDistractors.length < 3) {
    const backup = String(Number(correctVal) ? Number(correctVal) + offset : correctVal + offset);
    if (!uniqueDistractors.includes(backup) && backup !== String(correctVal)) {
      uniqueDistractors.push(backup);
    }
    offset++;
  }
  
  const allOpts = shuffle([String(correctVal), ...uniqueDistractors]);
  return allOpts;
}

// Main list of topics and counts
const targets = [
  { topic: "Tally Marks", count: 150 },
  { topic: "Capacity", count: 159 },
  { topic: "Converting FDP", count: 171 },
  { topic: "Fractions", count: 99 },
  { topic: "Word Problems to Formulae", count: 193 },
  { topic: "Column Addition/Subtraction", count: 109 },
  { topic: "Linear Equations", count: 103, userTopic: "Linear Equation" },
  { topic: "Word Problems", count: 160 },
  { topic: "Percentages", count: 185 },
  { topic: "Square & Cube Numbers", count: 150 },
  { topic: "Inverse Operations", count: 197 },
  { topic: "Number Patterns", count: 179 },
  { topic: "Temperature", count: 150 },
  { topic: "Calendar", count: 153 },
  { topic: "HCF & LCM", count: 177 },
  { topic: "Fractions of Quantities", count: 183 },
  { topic: "Remainders", count: 192 },
  { topic: "Profit and Loss", count: 144 },
  { topic: "Prime/Composite Numbers", count: 175, userTopic: "Prime/Composite Number" },
  { topic: "Factor Pairs", count: 148 },
  { topic: "Percentage Increase/Decrease", count: 183 },
  { topic: "Multiplying/Dividing by 10, 100, 1000", count: 186 },
  { topic: "Long Multiplication/Division", count: 150 },
  { topic: "Age Problems", count: 150 },
  { topic: "Prime Factor Trees", count: 181 },
  { topic: "Decimal Operations", count: 179 },
  { topic: "Number Sequences", count: 158 }
];

// Helper to get tally string
function getTally(n) {
  const groups = Math.floor(n / 5);
  const rem = n % 5;
  return (Array(groups).fill("<s>||||</s>").join(" ") + " " + "|".repeat(rem)).trim();
}

// Generate questions array for a topic
function generateQuestionsForTopic(topicName, totalCount) {
  const questionsObj = [];
  const easyCount = Math.floor(totalCount / 3) + (totalCount % 3 > 0 ? 1 : 0);
  const medCount = Math.floor(totalCount / 3) + (totalCount % 3 > 1 ? 1 : 0);
  const hardCount = Math.floor(totalCount / 3);

  for (let i = 0; i < totalCount; i++) {
    let diff = "EASY";
    if (i >= easyCount + medCount) diff = "HARD";
    else if (i >= easyCount) diff = "MEDIUM";

    let questionText = "";
    let options = [];
    let correctAnswer = "";
    let explanation = "";

    // Topic specific logic
    switch (topicName) {
      case "Tally Marks": {
        const val = i + 1;
        if (diff === "EASY") {
          questionText = `What number is represented by these tally marks? ${getTally(val)}`;
          correctAnswer = String(val);
          options = generateOptions(val, (v) => [v - 1, v + 1, v + 2]);
          explanation = `Counting each group of 5 (<s>||||</s>) and individual marks (|) gives ${val}.`;
        } else if (diff === "MEDIUM") {
          const val2 = i + 5;
          questionText = `Calculate the sum represented by: ${getTally(val)} + ${getTally(val2)}`;
          correctAnswer = String(val + val2);
          options = generateOptions(val + val2, (v) => [v - 5, v + 5, v + 2]);
          explanation = `${val} + ${val2} equals ${val + val2}.`;
        } else {
          const val2 = i + 3;
          const sub = Math.min(val, val2) - 1 || 1;
          questionText = `Solve: (${getTally(val)} + ${getTally(val2)}) - ${getTally(sub)}`;
          correctAnswer = String(val + val2 - sub);
          options = generateOptions(val + val2 - sub, (v) => [v - 2, v + 2, v + 4]);
          explanation = `${val} + ${val2} - ${sub} equals ${val + val2 - sub}.`;
        }
        break;
      }
      case "Capacity": {
        const val = (i + 1) * 2;
        if (diff === "EASY") {
          questionText = `Convert ${val} liters (L) into milliliters (mL).`;
          correctAnswer = `${val * 1000} mL`;
          options = generateOptions(correctAnswer, (v) => [`${val * 100} mL`, `${val * 10} mL`, `${val * 10000} mL`]);
          explanation = `Since 1 L = 1000 mL, ${val} L = ${val * 1000} mL.`;
        } else if (diff === "MEDIUM") {
          const sub = (i % 5 + 1) * 150;
          questionText = `A jug contains ${val} L of juice. If you pour out ${sub} mL, how much juice remains in mL?`;
          correctAnswer = `${val * 1000 - sub} mL`;
          options = generateOptions(correctAnswer, (v) => {
            const num = parseInt(v);
            return [`${num - 100} mL`, `${num + 100} mL`, `${num + 200} mL`];
          });
          explanation = `${val} L is ${val * 1000} mL. Subtracting ${sub} mL leaves ${val * 1000 - sub} mL.`;
        } else {
          const cupSize = 250;
          const numCups = Math.floor((val * 1000) / cupSize);
          questionText = `A large flask has a capacity of ${val} L. How many full cups of ${cupSize} mL can be filled from this flask?`;
          correctAnswer = String(numCups);
          options = generateOptions(numCups, (v) => [v - 2, v + 2, v + 4]);
          explanation = `${val} L = ${val * 1000} mL. ${val * 1000} ÷ ${cupSize} = ${numCups} cups.`;
        }
        break;
      }
      case "Converting FDP": {
        const idx = i % 10;
        const fractions = [
          { a: 1, b: 2, d: "0.5", p: "50" },
          { a: 1, b: 4, d: "0.25", p: "25" },
          { a: 3, b: 4, d: "0.75", p: "75" },
          { a: 1, b: 5, d: "0.2", p: "20" },
          { a: 2, b: 5, d: "0.4", p: "40" },
          { a: 3, b: 5, d: "0.6", p: "60" },
          { a: 4, b: 5, d: "0.8", p: "80" },
          { a: 1, b: 10, d: "0.1", p: "10" },
          { a: 3, b: 10, d: "0.3", p: "30" },
          { a: 7, b: 10, d: "0.7", p: "70" }
        ];
        const item = fractions[idx];
        if (diff === "EASY") {
          questionText = `Convert the fraction ${item.a}/${item.b} into a percentage.`;
          correctAnswer = `${item.p}%`;
          options = generateOptions(correctAnswer, (v) => [`${item.p * 2}%`, `${item.p / 2}%`, `${Number(item.p) + 10}%`]);
          explanation = `${item.a}/${item.b} = ${item.a / item.b} = ${item.p}%.`;
        } else if (diff === "MEDIUM") {
          const valMod = i + 1;
          questionText = `Convert the fraction ${valMod}/8 into a decimal.`;
          const ansVal = (valMod / 8).toFixed(3);
          correctAnswer = String(Number(ansVal));
          options = generateOptions(correctAnswer, (v) => [String(Number(v) + 0.1), String(Number(v) - 0.1), String(Number(v) + 0.05)]);
          explanation = `Dividing ${valMod} by 8 gives ${ansVal}.`;
        } else {
          const valMed = (i % 6) + 1;
          const dVal = (valMed / 20).toFixed(2);
          const pVal = valMed * 5;
          questionText = `Calculate: ${pVal}% + ${dVal} + 1/4. Express the sum as a simplified fraction.`;
          // sum = valMed/20 + valMed/20 + 5/20 = (2*valMed + 5) / 20
          const num = 2 * valMed + 5;
          correctAnswer = reduceFraction(num, 20);
          options = generateOptions(correctAnswer, (v) => [reduceFraction(num + 1, 20), reduceFraction(num - 1, 20), reduceFraction(num + 2, 20)]);
          explanation = `${pVal}% = ${pVal / 100}. ${dVal} = ${dVal}. 1/4 = 0.25. Sum is ${num / 20} which reduces to ${correctAnswer}.`;
        }
        break;
      }
      case "Fractions": {
        const a = (i % 5) + 1;
        const b = ((i % 5) + 1) * 2;
        if (diff === "EASY") {
          questionText = `Simplify the fraction ${a * 2}/${b * 2} to its simplest form.`;
          correctAnswer = reduceFraction(a, b);
          options = generateOptions(correctAnswer, (v) => ["1/5", "2/7", "3/8"]);
          explanation = `Dividing numerator and denominator by their HCF gives ${correctAnswer}.`;
        } else if (diff === "MEDIUM") {
          const c = (i % 3) + 1;
          questionText = `Calculate: 1/${a + 2} + ${c}/${a + 3}. Express the answer in simplest form.`;
          const num = (a + 3) + c * (a + 2);
          const den = (a + 2) * (a + 3);
          correctAnswer = reduceFraction(num, den);
          options = generateOptions(correctAnswer, (v) => [reduceFraction(num + 1, den), reduceFraction(num - 1, den), "1/2"]);
          explanation = `Finding a common denominator and adding gives ${correctAnswer}.`;
        } else {
          const c = (i % 3) + 2;
          questionText = `Calculate: ${a}/${a + 2} ÷ ${c}/5. Express your answer in simplest form.`;
          const num = a * 5;
          const den = (a + 2) * c;
          correctAnswer = reduceFraction(num, den);
          options = generateOptions(correctAnswer, (v) => [reduceFraction(num + 2, den), reduceFraction(num - 2, den), "3/4"]);
          explanation = `Multiplying by the reciprocal gives ${a}/${a+2} × 5/${c} = ${correctAnswer}.`;
        }
        break;
      }
      case "Word Problems to Formulae": {
        const val = i + 1;
        if (diff === "EASY") {
          questionText = `A number x is multiplied by ${val} and then increased by 7. Which formula represents this statement?`;
          correctAnswer = `${val}x + 7`;
          options = generateOptions(correctAnswer, (v) => [`x + ${val + 7}`, `${val}(x + 7)`, `${val}x - 7`]);
          explanation = `Multiplying x by ${val} gives ${val}x. Increasing by 7 gives ${val}x + 7.`;
        } else if (diff === "MEDIUM") {
          questionText = `A shopkeeper sells notebooks for £${val} each and pens for £2 each. What is the total cost (C) of n notebooks and p pens?`;
          correctAnswer = `C = ${val}n + 2p`;
          options = generateOptions(correctAnswer, (v) => [`C = 2n + ${val}p`, `C = ${val}np`, `C = ${val + 2}(n + p)`]);
          explanation = `notebooks cost ${val}n, pens cost 2p. The sum is ${val}n + 2p.`;
        } else {
          questionText = `Two times a number x is subtracted from the square of y, and the result is divided by ${val}. Write the formula.`;
          correctAnswer = `(y² - 2x) / ${val}`;
          options = generateOptions(correctAnswer, (v) => [`(2x - y²) / ${val}`, `(y - 2x)² / ${val}`, `(y² - x) / ${val}`]);
          explanation = `Subtracting 2x from y² gives y² - 2x. Dividing by ${val} gives (y² - 2x) / ${val}.`;
        }
        break;
      }
      case "Column Addition/Subtraction": {
        const a = 120 + i * 5;
        const b = 80 + i * 3;
        if (diff === "EASY") {
          questionText = `Calculate: ${a} + ${b}`;
          correctAnswer = String(a + b);
          options = generateOptions(a + b, (v) => [v - 10, v + 10, v - 100]);
          explanation = `Using column addition, ${a} + ${b} = ${a + b}.`;
        } else if (diff === "MEDIUM") {
          const decA = (a / 10).toFixed(1);
          const decB = (b / 10).toFixed(1);
          questionText = `Calculate: ${decA} - ${decB}`;
          correctAnswer = String(Number((decA - decB).toFixed(1)));
          options = generateOptions(correctAnswer, (v) => [String(Number(v) + 1.2), String(Number(v) - 0.5), String(Number(v) + 0.5)]);
          explanation = `Aligning the decimal points, ${decA} - ${decB} = ${correctAnswer}.`;
        } else {
          // Missing digits
          const valStr = String(a + b);
          const pos = i % valStr.length;
          const missingVal = valStr[pos];
          const questionStr = valStr.substring(0, pos) + "X" + valStr.substring(pos + 1);
          questionText = `In the addition ${a} + ${b} = ${questionStr}, what is the missing digit X?`;
          correctAnswer = String(missingVal);
          options = generateOptions(missingVal, (v) => [String((Number(v) + 1) % 10), String((Number(v) + 2) % 10), String((Number(v) + 3) % 10)]);
          explanation = `Since ${a} + ${b} = ${a + b}, the digit replacement for X is ${missingVal}.`;
        }
        break;
      }
      case "Linear Equations": {
        const ans = (i % 10) + 2;
        const coeff = (i % 4) + 2;
        const constVal = (i % 7) + 5;
        if (diff === "EASY") {
          questionText = `Solve for x: x + ${constVal} = ${ans + constVal}`;
          correctAnswer = String(ans);
          options = generateOptions(ans, (v) => [v - 1, v + 1, v + 2]);
          explanation = `Subtracting ${constVal} from both sides gives x = ${ans}.`;
        } else if (diff === "MEDIUM") {
          const right = coeff * ans + constVal;
          questionText = `Solve for x: ${coeff}x + ${constVal} = ${right}`;
          correctAnswer = String(ans);
          options = generateOptions(ans, (v) => [v - 2, v + 2, v + 1]);
          explanation = `Subtracting ${constVal} gives ${coeff}x = ${coeff * ans}. Dividing by ${coeff} gives x = ${ans}.`;
        } else {
          const coeff2 = coeff + 1;
          const right = coeff2 * ans - constVal;
          questionText = `Solve for x: ${coeff}x + ${right - coeff * ans + constVal} = ${coeff2}x - ${constVal}`;
          correctAnswer = String(ans);
          options = generateOptions(ans, (v) => [v - 3, v + 3, v + 1]);
          explanation = `Rearranging terms to solve for x gives x = ${ans}.`;
        }
        break;
      }
      case "Word Problems": {
        const val = i + 5;
        if (diff === "EASY") {
          questionText = `Sarah has 4 packs of pencils. Each pack has ${val} pencils. She gives 3 pencils to her brother. How many does she have left?`;
          correctAnswer = String(4 * val - 3);
          options = generateOptions(4 * val - 3, (v) => [v - 4, v + 4, v - 2]);
          explanation = `Total pencils is 4 × ${val} = ${4 * val}. Subtracting 3 leaves ${4 * val - 3}.`;
        } else if (diff === "MEDIUM") {
          const speed = 40 + (i % 5) * 5;
          questionText = `A cyclist travels at a speed of ${speed} km/h for 2.5 hours. How far does the cyclist travel in km?`;
          correctAnswer = String(speed * 2.5);
          options = generateOptions(speed * 2.5, (v) => [v - 10, v + 10, v + 5]);
          explanation = `Distance = Speed × Time. ${speed} × 2.5 = ${speed * 2.5} km.`;
        } else {
          const painters = 3;
          const days = 4;
          const targetPainters = painters + 1;
          // Days taken = (painters * days) / targetPainters
          const ansDays = (painters * days) / targetPainters;
          questionText = `If ${painters} painters take ${days} days to paint a fence, how many days will it take ${targetPainters} painters to paint the same fence?`;
          correctAnswer = `${ansDays.toFixed(1)} days`;
          options = generateOptions(correctAnswer, (v) => [`3.0 days`, `4.5 days`, `5.0 days`]);
          explanation = `Workers and days are inversely proportional. Total man-days = ${painters} × ${days} = 12. ${targetPainters} painters take 12 ÷ ${targetPainters} = ${ansDays.toFixed(1)} days.`;
        }
        break;
      }
      case "Percentages": {
        const val = (i + 1) * 20;
        if (diff === "EASY") {
          questionText = `Find 10% of £${val}`;
          correctAnswer = `£${val * 0.1}`;
          options = generateOptions(correctAnswer, (v) => [`£${val * 0.05}`, `£${val * 0.2}`, `£${val * 0.15}`]);
          explanation = `10% of £${val} is 10/100 × ${val} = £${val * 0.1}.`;
        } else if (diff === "MEDIUM") {
          questionText = `Find 35% of £${val}`;
          correctAnswer = `£${val * 0.35}`;
          options = generateOptions(correctAnswer, (v) => [`£${val * 0.3}`, `£${val * 0.4}`, `£${val * 0.25}`]);
          explanation = `35% of £${val} is 35/100 × ${val} = £${val * 0.35}.`;
        } else {
          const pVal = 15;
          const ansVal = val * 4;
          questionText = `If ${pVal}% of a number is ${val * 0.6}, what is 100% of the number?`;
          correctAnswer = String(ansVal);
          options = generateOptions(ansVal, (v) => [v - 50, v + 50, v - 100]);
          explanation = `Since ${pVal}% is ${val * 0.6}, 1% is ${val * 0.6 / pVal}. Thus 100% is ${(val * 0.6 / pVal) * 100} = ${ansVal}.`;
        }
        break;
      }
      case "Square & Cube Numbers": {
        const val = (i % 12) + 1;
        if (diff === "EASY") {
          questionText = `What is the square of ${val}?`;
          correctAnswer = String(val * val);
          options = generateOptions(val * val, (v) => [v - 4, v + 4, v + 8]);
          explanation = `${val} × ${val} = ${val * val}.`;
        } else if (diff === "MEDIUM") {
          const cubeVal = (i % 6) + 1;
          questionText = `What is the cube of ${cubeVal}?`;
          correctAnswer = String(cubeVal * cubeVal * cubeVal);
          options = generateOptions(cubeVal * cubeVal * cubeVal, (v) => [v - 15, v + 15, v + 30]);
          explanation = `${cubeVal} × ${cubeVal} × ${cubeVal} = ${cubeVal * cubeVal * cubeVal}.`;
        } else {
          const sqVal = (i % 5) + 13;
          questionText = `Solve: ${sqVal}² - 100`;
          correctAnswer = String(sqVal * sqVal - 100);
          options = generateOptions(sqVal * sqVal - 100, (v) => [v - 20, v + 20, v + 40]);
          explanation = `${sqVal}² = ${sqVal * sqVal}. Subtracting 100 gives ${sqVal * sqVal - 100}.`;
        }
        break;
      }
      case "Inverse Operations": {
        const val = i + 2;
        if (diff === "EASY") {
          questionText = `I think of a number, add ${val}, and get ${val + 10}. What is the number?`;
          correctAnswer = "10";
          options = generateOptions(10, (v) => [v - 2, v + 2, v + 4]);
          explanation = `Subtracting ${val} from ${val + 10} gives 10.`;
        } else if (diff === "MEDIUM") {
          questionText = `I think of a number, multiply it by 3, and then subtract ${val}. The result is ${30 - val}. What is my starting number?`;
          correctAnswer = "10";
          options = generateOptions(10, (v) => [v - 1, v + 1, v + 2]);
          explanation = `Add ${val} to get 30, then divide by 3 to get 10.`;
        } else {
          questionText = `I think of a number, double it, add ${val}, and then divide by 2. The result is ${10 + val / 2}. Starting number?`;
          correctAnswer = "10";
          options = generateOptions(10, (v) => [v - 3, v + 3, v + 1]);
          explanation = `Multiply by 2, subtract ${val}, then divide by 2. The original number is 10.`;
        }
        break;
      }
      case "Number Patterns": {
        const start = i + 1;
        const diffVal = (i % 4) + 2;
        if (diff === "EASY") {
          questionText = `Find the next number in the pattern: ${start}, ${start + diffVal}, ${start + 2 * diffVal}, ${start + 3 * diffVal}, ...`;
          correctAnswer = String(start + 4 * diffVal);
          options = generateOptions(correctAnswer, (v) => [Number(v) - diffVal, Number(v) + diffVal * 2, Number(v) + 1]);
          explanation = `The rule is add ${diffVal}. The next number is ${start + 4 * diffVal}.`;
        } else if (diff === "MEDIUM") {
          questionText = `Find the missing term: ${start}, ${start * 2}, ${start * 4}, ?, ${start * 16}`;
          correctAnswer = String(start * 8);
          options = generateOptions(correctAnswer, (v) => [String(start * 6), String(start * 10), String(start * 12)]);
          explanation = `The rule is multiply by 2. The missing term is ${start * 8}.`;
        } else {
          // Quadratic
          // terms: 1+c, 4+c, 9+c, 16+c
          questionText = `Find the next term: ${1 + start}, ${4 + start}, ${9 + start}, ${16 + start}, ...`;
          correctAnswer = String(25 + start);
          options = generateOptions(correctAnswer, (v) => [Number(v) - 5, Number(v) + 8, Number(v) + 12]);
          explanation = `The sequence is n² + ${start}. The fifth term is 5² + ${start} = ${25 + start}.`;
        }
        break;
      }
      case "Temperature": {
        const t1 = (i % 15) + 5;
        const t2 = t1 + (i % 8) + 2;
        if (diff === "EASY") {
          questionText = `The temperature rises from ${t1}°C to ${t2}°C. What is the increase in degrees Celsius?`;
          correctAnswer = String(t2 - t1);
          options = generateOptions(t2 - t1, (v) => [v - 2, v + 2, v + 1]);
          explanation = `Subtracting gives ${t2} - ${t1} = ${t2 - t1}°C.`;
        } else if (diff === "MEDIUM") {
          questionText = `The temperature was ${t1}°C and fell by ${t1 + t2}°C. What is the new temperature?`;
          correctAnswer = `-${t2}°C`;
          options = generateOptions(correctAnswer, (v) => [`-${t2 - 1}°C`, `-${t2 + 2}°C`, `-${t2 + 4}°C`]);
          explanation = `${t1} - ${t1 + t2} = -${t2}°C.`;
        } else {
          const t3 = t1 - 4;
          const t4 = -t2;
          const avg = ((t1 + t2 + t3 + t4) / 4).toFixed(1);
          questionText = `Find the average temperature of: ${t1}°C, ${t2}°C, ${t3}°C, and ${t4}°C.`;
          correctAnswer = `${Number(avg)}°C`;
          options = generateOptions(correctAnswer, (v) => [`${Number(avg) + 1.5}°C`, `${Number(avg) - 1}°C`, `${Number(avg) + 0.5}°C`]);
          explanation = `Sum of temperatures is ${t1 + t2 + t3 + t4}. Dividing by 4 gives ${avg}°C.`;
        }
        break;
      }
      case "Calendar": {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayIdx = i % 7;
        const add = (i % 10) + 3;
        if (diff === "EASY") {
          questionText = `If today is ${days[dayIdx]}, what day of the week will it be in ${add} days?`;
          correctAnswer = days[(dayIdx + add) % 7];
          options = generateOptions(correctAnswer, (v) => [days[(dayIdx + add + 1) % 7], days[(dayIdx + add - 1) % 7], days[(dayIdx + add + 2) % 7]]);
          explanation = `${add} days after ${days[dayIdx]} is ${correctAnswer}.`;
        } else if (diff === "MEDIUM") {
          questionText = `If the 5th of a month is a ${days[dayIdx]}, what date will the fourth ${days[dayIdx]} of the month be?`;
          correctAnswer = "26th";
          options = generateOptions("26th", (v) => ["19th", "27th", "25th"]);
          explanation = `First is 5th, second is 12th, third is 19th, fourth is 26th.`;
        } else {
          questionText = `In a leap year, if February 27th is a ${days[dayIdx]}, what day of the week will March 4th be?`;
          // Leap year February has 29 days.
          // Feb 28: dayIdx + 1
          // Feb 29: dayIdx + 2
          // March 1: dayIdx + 3
          // March 4: dayIdx + 6
          correctAnswer = days[(dayIdx + 6) % 7];
          options = generateOptions(correctAnswer, (v) => [days[(dayIdx + 5) % 7], days[(dayIdx + 7) % 7], days[(dayIdx + 4) % 7]]);
          explanation = `Leap year has 29 days in Feb. Add 6 days to Feb 27th to land on March 4th.`;
        }
        break;
      }
      case "HCF & LCM": {
        const val1 = (i % 6) + 4;
        const val2 = val1 + 2;
        const gcd = (a, b) => b ? gcd(b, a % b) : a;
        const hcf = gcd(val1, val2);
        const lcm = (val1 * val2) / hcf;
        if (diff === "EASY") {
          questionText = `Find the Least Common Multiple (LCM) of ${val1} and ${val2}.`;
          correctAnswer = String(lcm);
          options = generateOptions(lcm, (v) => [v - 2, v + 4, v * 2]);
          explanation = `Multiples share ${lcm} as their lowest common match.`;
        } else if (diff === "MEDIUM") {
          questionText = `Find the Highest Common Factor (HCF) of ${val1 * 3} and ${val2 * 3}.`;
          correctAnswer = String(gcd(val1 * 3, val2 * 3));
          options = generateOptions(correctAnswer, (v) => [v - 1, v + 2, v * 2]);
          explanation = `The maximum number that divides both is ${correctAnswer}.`;
        } else {
          questionText = `Two lighthouses flash their lights: Light A every ${val1} minutes and Light B every ${val2} minutes. If they flash together at 9:00 AM, at what time will they next flash together?`;
          // LCM is lcm.
          const hour = 9 + Math.floor(lcm / 60);
          const min = lcm % 60;
          correctAnswer = `${hour}:${min < 10 ? '0' + min : min} AM`;
          options = generateOptions(correctAnswer, (v) => [`9:30 AM`, `10:15 AM`, `9:45 AM`]);
          explanation = `LCM of ${val1} and ${val2} is ${lcm} minutes. 9:00 AM + ${lcm} minutes is ${correctAnswer}.`;
        }
        break;
      }
      case "Fractions of Quantities": {
        const den = (i % 5) + 3;
        const mult = (i % 8) + 2;
        const amt = den * mult * 10;
        if (diff === "EASY") {
          questionText = `Find 1/${den} of £${amt}`;
          correctAnswer = `£${amt / den}`;
          options = generateOptions(correctAnswer, (v) => [`£${amt / den + 5}`, `£${amt / den - 5}`, `£${amt / den * 2}`]);
          explanation = `Divide £${amt} by ${den} to get £${amt / den}.`;
        } else if (diff === "MEDIUM") {
          const num = den - 1;
          questionText = `Find ${num}/${den} of £${amt}`;
          correctAnswer = `£${(amt / den) * num}`;
          options = generateOptions(correctAnswer, (v) => [`£${(amt / den) * num - 10}`, `£${(amt / den) * num + 10}`, `£${amt}`]);
          explanation = `Divide £${amt} by ${den} and multiply by ${num} = £${(amt / den) * num}.`;
        } else {
          const num = den - 2 || 1;
          const slice = (amt / den) * num;
          questionText = `If ${num}/${den} of a container of liquid is ${slice} liters, how many liters does the full container hold?`;
          correctAnswer = String(amt);
          options = generateOptions(amt, (v) => [v - 20, v + 20, v + 50]);
          explanation = `${slice} ÷ ${num} × ${den} gives the total capacity: ${amt} liters.`;
        }
        break;
      }
      case "Remainders": {
        const val = i + 15;
        const div = (i % 6) + 3;
        if (diff === "EASY") {
          questionText = `What is the remainder when ${val} is divided by ${div}?`;
          correctAnswer = String(val % div);
          options = generateOptions(val % div, (v) => [v + 1, (v + 2) % div, (v + 3) % div]);
          explanation = `${val} = ${Math.floor(val / div)} × ${div} + ${val % div}. Remainder is ${val % div}.`;
        } else if (diff === "MEDIUM") {
          questionText = `Eggs are packed in cartons of ${div}. If a farmer has ${val} eggs, how many eggs will be leftover after packing full cartons?`;
          correctAnswer = String(val % div);
          options = generateOptions(val  % div, (v) => [v + 1, (v + 2) % div, (v + 3) % div]);
          explanation = `${val} ÷ ${div} leaves a remainder of ${val % div}.`;
        } else {
          // A number divided by div leaves a remainder of r.
          const r = val % div;
          questionText = `A number n when divided by ${div} leaves a remainder of ${r}. What is the remainder when 3n is divided by ${div}?`;
          correctAnswer = String((3 * r) % div);
          options = generateOptions((3 * r) % div, (v) => [(v + 1) % div, (v + 2) % div, (v + 3) % div]);
          explanation = `The remainder of 3n modulo ${div} is equivalent to (3 × ${r}) modulo ${div} = ${(3 * r) % div}.`;
        }
        break;
      }
      case "Profit and Loss": {
        const cost = 20 + i * 5;
        if (diff === "EASY") {
          const sell = cost + (i % 10) + 2;
          questionText = `A toy is bought for £${cost} and sold for £${sell}. What is the profit?`;
          correctAnswer = `£${sell - cost}`;
          options = generateOptions(correctAnswer, (v) => [`£${sell - cost + 1}`, `£${sell - cost - 1}`, `£2`]);
          explanation = `Profit = Selling Price - Cost Price = £${sell} - £${cost} = £${sell - cost}.`;
        } else if (diff === "MEDIUM") {
          const loss = cost * 0.2;
          const sell = cost - loss;
          questionText = `A bicycle was bought for £${cost} and sold for £${sell}. What is the percentage loss?`;
          correctAnswer = `20%`;
          options = generateOptions("20%", (v) => [`15%`, `25%`, `10%`]);
          explanation = `Loss is £${loss}. Percentage loss = (${loss} / ${cost}) × 100 = 20%.`;
        } else {
          const profitPct = 20;
          const sell = cost * 1.2;
          questionText = `By selling a book for £${sell.toFixed(2)}, a bookshop makes a ${profitPct}% profit. What was the origin cost price of the book?`;
          correctAnswer = `£${cost}`;
          options = generateOptions(`£${cost}`, (v) => [`£${cost - 5}`, `£${cost + 5}`, `£${cost - 10}`]);
          explanation = `Cost Price = Selling Price ÷ 1.20 = £${sell.toFixed(2)} ÷ 1.20 = £${cost}.`;
        }
        break;
      }
      case "Prime/Composite Numbers": {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
        const idx = i % primes.length;
        if (diff === "EASY") {
          const p = primes[idx];
          const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18].filter(c => c !== p);
          questionText = `Which of the following numbers is a prime number?`;
          correctAnswer = String(p);
          options = shuffle([String(p), String(composites[0]), String(composites[1]), String(composites[2])]);
          explanation = `A prime number has exactly two factors: 1 and itself. ${p} is prime.`;
        } else if (diff === "MEDIUM") {
          const min = idx * 2 + 1;
          const max = min + 15;
          const countPrimes = primes.filter(p => p >= min && p <= max).length;
          questionText = `How many prime numbers are there between ${min} and ${max}?`;
          correctAnswer = String(countPrimes);
          options = generateOptions(countPrimes, (v) => [v - 1, v + 1, v + 2]);
          explanation = `Primes between ${min} and ${max} are: ${primes.filter(p => p >= min && p <= max).join(', ')}. Total: ${countPrimes}.`;
        } else {
          // Odd composite check
          const oddComposites = [9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57, 65, 69, 75, 77, 81, 85, 87, 91, 93, 95];
          const comp = oddComposites[i % oddComposites.length];
          const testPrimes = primes.slice(0, 3);
          questionText = `Which of the following numbers is a composite number?`;
          correctAnswer = String(comp);
          options = shuffle([String(comp), String(testPrimes[0]), String(testPrimes[1]), String(testPrimes[2])]);
          explanation = `A composite number has more than two factors. ${comp} is composite.`;
        }
        break;
      }
      case "Factor Pairs": {
        const val = (i % 15) * 4 + 12; // multiples of 4
        if (diff === "EASY") {
          questionText = `Which of the following is a factor of ${val}?`;
          correctAnswer = "4";
          options = generateOptions("4", (v) => ["5", "7", "9"]);
          explanation = `${val} divides perfectly by 4.`;
        } else if (diff === "MEDIUM") {
          // count number of factors
          let countF = 0;
          for (let f = 1; f <= val; f++) if (val % f === 0) countF++;
          questionText = `How many factors does the number ${val} have?`;
          correctAnswer = String(countF);
          options = generateOptions(countF, (v) => [v - 2, v + 2, v + 4]);
          explanation = `Factors of ${val} are: ${Array(val).fill(0).map((_, idx) => idx + 1).filter(x => val % x === 0).join(', ')}. Total is ${countF}.`;
        } else {
          let sumF = 0;
          for (let f = 1; f <= val; f++) if (val % f === 0) sumF += f;
          questionText = `Find the sum of all factors of the number ${val}.`;
          correctAnswer = String(sumF);
          options = generateOptions(sumF, (v) => [v - 10, v + 10, v - 20]);
          explanation = `Factors are all integers dividing ${val}. Their sum is ${sumF}.`;
        }
        break;
      }
      case "Percentage Increase/Decrease": {
        const amt = 40 + i * 5;
        if (diff === "EASY") {
          questionText = `Increase £${amt} by 10%.`;
          correctAnswer = `£${(amt * 1.1).toFixed(2)}`;
          options = generateOptions(correctAnswer, (v) => [`£${(amt * 1.05).toFixed(2)}`, `£${(amt * 1.2).toFixed(2)}`, `£${amt}`]);
          explanation = `10% of £${amt} is £${amt * 0.1}. Total is £${amt * 1.1}.`;
        } else if (diff === "MEDIUM") {
          questionText = `Decrease £${amt} by 15%.`;
          correctAnswer = `£${(amt * 0.85).toFixed(2)}`;
          options = generateOptions(correctAnswer, (v) => [`£${(amt * 0.8).toFixed(2)}`, `£${(amt * 0.9).toFixed(2)}`, `£${amt}`]);
          explanation = `15% of £${amt} is £${amt * 0.15}. Subtracting gives £${(amt * 0.85).toFixed(2)}.`;
        } else {
          const orig = amt * 2;
          const sell = orig * 1.25;
          questionText = `A ticket price was increased by 25% to £${sell.toFixed(2)}. What was the original price?`;
          correctAnswer = `£${orig.toFixed(2)}`;
          options = generateOptions(correctAnswer, (v) => [`£${(orig - 10).toFixed(2)}`, `£${(orig + 10).toFixed(2)}`, `£100.00`]);
          explanation = `Original Price = £${sell.toFixed(2)} ÷ 1.25 = £${orig.toFixed(2)}.`;
        }
        break;
      }
      case "Multiplying/Dividing by 10, 100, 1000": {
        const val = i + 12;
        if (diff === "EASY") {
          questionText = `Calculate: ${val} × 100`;
          correctAnswer = String(val * 100);
          options = generateOptions(correctAnswer, (v) => [String(val * 10), String(val * 1000), String(val * 10000)]);
          explanation = `Multiplying by 100 shifts digits two places left: ${val * 100}.`;
        } else if (diff === "MEDIUM") {
          const dec = (val / 10).toFixed(1);
          questionText = `Calculate: ${dec} ÷ 100`;
          correctAnswer = String(Number((dec / 100).toFixed(3)));
          options = generateOptions(correctAnswer, (v) => [String(Number(v) * 10), String(Number(v) / 10), "0.001"]);
          explanation = `Dividing by 100 shifts digits two places right: ${correctAnswer}.`;
        } else {
          const dec = (val / 100).toFixed(2);
          questionText = `Calculate: ${dec} × 1000 ÷ 10`;
          correctAnswer = String(Number((dec * 100).toFixed(2)));
          options = generateOptions(correctAnswer, (v) => [String(Number(v) / 10), String(Number(v) * 10), "10"]);
          explanation = `Multiplying by 1000 then dividing by 10 is equivalent to multiplying by 100: ${correctAnswer}.`;
        }
        break;
      }
      case "Long Multiplication/Division": {
        const a = 15 + i * 2;
        const b = 11 + i % 5;
        if (diff === "EASY") {
          questionText = `Calculate: ${a} × ${b}`;
          correctAnswer = String(a * b);
          options = generateOptions(a * b, (v) => [v - 10, v + 10, v + 20]);
          explanation = `Using written multiplication, ${a} × ${b} = ${a * b}.`;
        } else if (diff === "MEDIUM") {
          const big = a * 10;
          questionText = `Calculate: ${big} ÷ ${b}`;
          const qVal = Math.floor(big / b);
          const rVal = big % b;
          correctAnswer = rVal === 0 ? String(qVal) : `${qVal} r ${rVal}`;
          options = generateOptions(correctAnswer, (v) => [`${qVal} r ${rVal + 1}`, `${qVal - 1} r ${rVal}`, `${qVal + 1}`]);
          explanation = `Dividing ${big} by ${b} leaves quotient ${qVal} and remainder ${rVal}.`;
        } else {
          const factor1 = 125 + i;
          const factor2 = 24;
          questionText = `Calculate: ${factor1} × ${factor2}`;
          correctAnswer = String(factor1 * factor2);
          options = generateOptions(factor1 * factor2, (v) => [v - 100, v + 100, v - 50]);
          explanation = `Performing standard double-digit multiplication gives ${factor1 * factor2}.`;
        }
        break;
      }
      case "Age Problems": {
        const age = 6 + i % 5;
        if (diff === "EASY") {
          questionText = `Jenny is ${age} years old. Her brother is 4 years older. How old will she be in 5 years?`;
          correctAnswer = String(age + 5);
          options = generateOptions(age + 5, (v) => [v - 2, v + 2, v + 5]);
          explanation = `Jenny is ${age} today. In 5 years she will be ${age} + 5 = ${age + 5}.`;
        } else if (diff === "MEDIUM") {
          // dad is 4 times age. Combined is 5*age
          questionText = `A father is four times as old as his son. If the sum of their ages is ${5 * age}, how old is the son?`;
          correctAnswer = String(age);
          options = generateOptions(age, (v) => [v - 2, v + 2, v + 4]);
          explanation = `Son's age is x, Father's is 4x. x + 4x = 5x = ${5 * age}. Thus x = ${age}.`;
        } else {
          // Mom is 32. Daughter is 8.
          // 32 + x = 2*(8+x) => 32 + x = 16 + 2x => x = 16
          const dAge = age + 2;
          const mAge = dAge * 3 + 2;
          // mAge + x = 2*(dAge + x) => mAge + x = 2*dAge + 2x => x = mAge - 2*dAge
          const x = mAge - 2 * dAge;
          questionText = `A mother is ${mAge} years old and her daughter is ${dAge} years old. In how many years will the mother be twice as old as the daughter?`;
          correctAnswer = String(x);
          options = generateOptions(x, (v) => [v - 1, v + 1, v + 2]);
          explanation = `Setting up equation: ${mAge} + x = 2 × (${dAge} + x). Solving gives x = ${x}.`;
        }
        break;
      }
      case "Prime Factor Trees": {
        const val = [12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 50, 60, 72, 80, 90, 100];
        const num = val[i % val.length] + Math.floor(i / val.length) * 12;
        // Prime factorization calculation
        let temp = num;
        const factors = [];
        for (let f = 2; f <= temp; f++) {
          while (temp % f === 0) {
            factors.push(f);
            temp /= f;
          }
        }
        const factorizationStr = factors.join(" × ");
        
        // Index notation
        const counts = {};
        for (const f of factors) counts[f] = (counts[f] || 0) + 1;
        const indexStr = Object.keys(counts).map(k => `${k}${counts[k] > 1 ? '^' + counts[k] : ''}`).join(" × ");

        if (diff === "EASY") {
          questionText = `Which prime factorization corresponds to the number ${num}?`;
          correctAnswer = factorizationStr;
          options = generateOptions(correctAnswer, (v) => ["2 × 3 × 5", "2 × 2 × 7", "3 × 3 × 5"]);
          explanation = `Dividing ${num} into prime components gives: ${factorizationStr}.`;
        } else if (diff === "MEDIUM") {
          questionText = `Find the product of prime factors of ${num}.`;
          correctAnswer = factorizationStr;
          options = generateOptions(correctAnswer, (v) => ["2 × 3 × 3", "2 × 2 × 2 × 5", "5 × 5"]);
          explanation = `${num} factored into primes is ${factorizationStr}.`;
        } else {
          questionText = `Express ${num} as a product of prime factors in index notation format.`;
          correctAnswer = indexStr;
          options = generateOptions(correctAnswer, (v) => ["2² × 3²", "2³ × 5", "3² × 5"]);
          explanation = `In index notation, repeated factors are expressed as exponents: ${indexStr}.`;
        }
        break;
      }
      case "Decimal Operations": {
        const a = (1.2 + i * 0.1).toFixed(1);
        const b = (0.5 + i * 0.05).toFixed(2);
        if (diff === "EASY") {
          questionText = `Calculate: ${a} + ${b}`;
          correctAnswer = String(Number((Number(a) + Number(b)).toFixed(2)));
          options = generateOptions(correctAnswer, (v) => [String(Number(v) + 0.1), String(Number(v) - 0.1), String(Number(v) + 1)]);
          explanation = `Aligning decimal points: ${a} + ${b} = ${correctAnswer}.`;
        } else if (diff === "MEDIUM") {
          const decA = (0.3 + (i % 5) * 0.1).toFixed(1);
          const decB = (0.4 + (i % 3) * 0.1).toFixed(1);
          questionText = `Calculate: ${decA} × ${decB}`;
          correctAnswer = String(Number((Number(decA) * Number(decB)).toFixed(2)));
          options = generateOptions(correctAnswer, (v) => [String(Number(v) * 10), String(Number(v) + 0.1), "0.12"]);
          explanation = `${decA} × ${decB} equals ${correctAnswer}.`;
        } else {
          const decA = (2.4 + (i % 5) * 0.8).toFixed(1);
          questionText = `Calculate: ${decA} ÷ 0.08`;
          correctAnswer = String(Number((Number(decA) / 0.08).toFixed(1)));
          options = generateOptions(correctAnswer, (v) => [String(Number(v) / 10), String(Number(v) * 2), "30"]);
          explanation = `${decA} ÷ 0.08 is equivalent to ${Number(decA) * 100} ÷ 8 = ${correctAnswer}.`;
        }
        break;
      }
      case "Number Sequences": {
        const start = i + 2;
        const step = (i % 5) + 3;
        if (diff === "EASY") {
          questionText = `Identify the next term in the arithmetic sequence: ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, ...`;
          correctAnswer = String(start + step * 4);
          options = generateOptions(correctAnswer, (v) => [Number(v) - step, Number(v) + step * 2, "20"]);
          explanation = `The common difference is +${step}. The next term is ${start + step * 4}.`;
        } else if (diff === "MEDIUM") {
          const decStep = step * 0.5;
          questionText = `Find the next term in the descending sequence: ${start * 10}, ${start * 10 - decStep}, ${start * 10 - decStep * 2}, ...`;
          correctAnswer = String(start * 10 - decStep * 3);
          options = generateOptions(correctAnswer, (v) => [Number(v) - 1, Number(v) + decStep, "0"]);
          explanation = `The common difference is -${decStep}. The next term is ${correctAnswer}.`;
        } else {
          // Formula sequences
          questionText = `If the nth term of a sequence is ${step}n + ${start}, what is the 10th term?`;
          correctAnswer = String(step * 10 + start);
          options = generateOptions(correctAnswer, (v) => [Number(v) - 5, Number(v) + 5, "50"]);
          explanation = `Substitute n = 10 into the formula: ${step}(10) + ${start} = ${step * 10 + start}.`;
        }
        break;
      }
    }

    questionsObj.push({
      questionType: "TEXT",
      questionText,
      options,
      correctAnswer,
      explanation,
      difficulty: diff,
      marks: 1,
      isActive: true
    });
  }

  return questionsObj;
}

// Bulk generate and write to the database
async function main() {
  // Let's verify existing topics first
  console.log("Starting bulk insertion of unique academic questions...");
  const mathsSubject = await prisma.subject.upsert({
    where: { name: "Maths" },
    update: {},
    create: { name: "Maths", description: "Mathematics academic area." }
  });

  let totalUploaded = 0;

  for (const target of targets) {
    const topicName = target.topic;
    const count = target.count;

    console.log(`Generating ${count} questions for "${topicName}"...`);
    const questions = generateQuestionsForTopic(topicName, count);

    // Find or create the syllabus topic
    let syllabus = await prisma.syllabus.findFirst({
      where: {
        subjectId: mathsSubject.id,
        topic: { equals: topicName, mode: 'insensitive' }
      }
    });

    if (!syllabus) {
      syllabus = await prisma.syllabus.create({
        data: {
          subjectId: mathsSubject.id,
          topic: topicName,
          description: `${topicName} topic.`
        }
      });
    }

    // Now insert the questions using createMany (skipping duplicates)
    console.log(`Writing ${questions.length} questions for "${topicName}" to DB...`);
    
    let subCreated = 0;
    for (const q of questions) {
      // Direct duplicate check
      const dup = await prisma.question.findFirst({
        where: {
          subjectId: mathsSubject.id,
          syllabusId: syllabus.id,
          questionText: q.questionText
        }
      });

      if (!dup) {
        await prisma.question.create({
          data: {
            subjectId: mathsSubject.id,
            syllabusId: syllabus.id,
            questionType: q.questionType,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            marks: q.marks,
            isActive: q.isActive
          }
        });
        subCreated++;
      }
    }
    
    totalUploaded += subCreated;
    console.log(`Topic "${topicName}": Added ${subCreated} new, unique questions.`);
  }

  console.log(`Successfully completed! Loaded ${totalUploaded} unique questions across 27 topics.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
