const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

const verbConjugations = {
  "kicked": ["kicks", "will kick", "is kicking"],
  "baked": ["bakes", "will bake", "is baking"],
  "wrote": ["writes", "will write", "is writing"],
  "broke": ["breaks", "will break", "is breaking"],
  "sang": ["sings", "will sing", "is singing"],
  "completed": ["completes", "will complete", "is completing"],
  "drove": ["drives", "will drive", "is driving"],
  "read": ["reads", "will read", "is reading"],
  "built": ["builds", "will build", "is building"],
  "picked": ["picks", "will pick", "is picking"],
  "cooked": ["cooks", "will cook", "is cooking"],
  "watched": ["watches", "will watch", "is watching"],
  "cut": ["cuts", "will cut", "is cutting"],
  "ate": ["eats", "will eat", "is eating"],
  "told": ["tells", "will tell", "is telling"],
  "won": ["wins", "will win", "is winning"],
  "opened": ["opens", "will open", "is opening"],
  "delivered": ["delivers", "will deliver", "is delivering"],
  "switched": ["switches", "will switch", "is switching"],
  "mopped": ["mops", "will mop", "is mopping"],
  "sent": ["sends", "will send", "is sending"],
  "repaired": ["repairs", "will repair", "is repairing"],
  "ordered": ["orders", "will order", "is ordering"],
  "took": ["takes", "will take", "is taking"],
  "polluted": ["pollutes", "will pollute", "is polluting"],
  "hid": ["hides", "will hide", "is hiding"],
  "spotted": ["spots", "will spot", "is spotting"],
  "wrapped": ["wraps", "will wrap", "is wrapping"],
  "treated": ["treats", "will treat", "is treating"],
  "planted": ["plants", "will plant", "is planting"],
  "cleaned": ["cleans", "will clean", "is cleaning"],
  "dropped": ["drops", "will drop", "is dropping"],
  "taught": ["teaches", "will teach", "is teaching"],
  "drank": ["drinks", "will drink", "is drinking"],
  "wore": ["wears", "will wear", "is wearing"],
  "prepared": ["prepares", "will prepare", "is preparing"],
  "painted": ["paints", "will paint", "is painting"],
  "spilled": ["spills", "will spill", "is spilling"],
  "returned": ["returns", "will return", "is returning"],
  "rang": ["rings", "will ring", "is ringing"],
  "served": ["serves", "will serve", "is serving"],
  "asked": ["asks", "will ask", "is asking"],
  "swept": ["sweeps", "will sweep", "is sweeping"],
  "posted": ["posts", "will post", "is posting"],
  "erected": ["erects", "will erect", "is erecting"],
  "extinguished": ["extinguishes", "will extinguish", "is extinguishing"],
  "found": ["finds", "will find", "is finding"],
  "collected": ["collects", "will collect", "is collecting"],
  "designed": ["designs", "will design", "is designing"],
  "heard": ["hears", "will hear", "is hearing"],
  "watered": ["waters", "will water", "is watering"],
  "received": ["receives", "will receive", "is receiving"],
  "carried": ["carries", "will carry", "is carrying"],
  "made": ["makes", "will make", "is making"],
  "gave": ["gives", "will give", "is giving"],
  "passed": ["passes", "will pass", "is passing"],
  "accepted": ["accepts", "will accept", "is accepting"],
  "solved": ["solves", "will solve", "is solving"],
  "caused": ["causes", "will cause", "is causing"],
  "presented": ["presents", "will present", "is presenting"],
  "examined": ["examines", "will examine", "is examining"],
  "processed": ["processes", "will process", "is processing"],
  "filed": ["files", "will file", "is filing"],
  "decorated": ["decorates", "will decorate", "is decorating"],
  "answered": ["answers", "will answer", "is answering"],
  "installed": ["installs", "will install", "is installing"],
  "chaired": ["chairs", "will chair", "is chairing"],
  "closed": ["closes", "will close", "is closing"],
  "followed": ["follows", "will follow", "is following"],
  "confirmed": ["confirms", "will confirm", "is confirming"],
  "performed": ["performs", "will perform", "is performing"],
  "introduced": ["introduces", "will introduce", "is introducing"],
  "scheduled": ["schedules", "will schedule", "is scheduling"],
  "polished": ["polishes", "will polish", "is polishing"],
  "renewed": ["renews", "will renew", "is renewing"],
  "considered": ["considers", "will consider", "is considering"],
  "developed": ["develops", "will develop", "is developing"],
  "drafted": ["drafts", "will draft", "is drafting"],
  "hidden": ["hides", "will hide", "is hiding"],
  "sings": ["sung", "will sing", "is singing"],
  "escorted": ["escorts", "will escort", "is escorting"],
  "launched": ["launches", "will launch", "is launching"],
  "denied": ["denies", "will deny", "is denying"],
  "recorded": ["records", "will record", "is recording"],
  "searched": ["searches", "will search", "is searching"],
  "handled": ["handles", "will handle", "is handling"],
  "questioned": ["questions", "will question", "is questioning"],
  "signed": ["signs", "will sign", "is signing"],
  "resolved": ["resolves", "will resolve", "is resolving"],
  "inspected": ["inspects", "will inspect", "is inspecting"],
  "admired": ["admires", "will admire", "is admiring"],
  "approved": ["approves", "will approve", "is approving"],
  "demolished": ["demolishes", "will demolish", "is demolishing"],
  "investigated": ["investigates", "will investigate", "is investigating"],
  "awarded": ["awards", "will award", "is awarding"],
  "operated": ["operates", "will operate", "is operating"],
  "enforced": ["enforces", "will enforce", "is enforcing"],
  "broken": ["breaks", "will break", "is breaking"],
  "owned": ["owns", "will own", "is owning"],
  "announced": ["announces", "will announce", "is announcing"],
  "paid": ["pays", "will pay", "is paying"],
  "contaminated": ["contaminates", "will contaminate", "is contaminating"],
  "hosted": ["hosts", "will host", "is hosting"],
  "rejected": ["rejects", "will reject", "is rejecting"],
  "visited": ["visits", "will visit", "is visiting"],
  "upgraded": ["upgrades", "will upgrade", "is upgrading"],
  "replied": ["replies", "will reply", "is replying"],
  "witnessed": ["witnesses", "will witness", "is witnessing"],
  "funded": ["funds", "will fund", "is funding"]
};

function getWrongTenseActive(sentence) {
  const helperReplacements = [
    { from: " are doing ", to: " do " },
    { from: " was repairing ", to: " repaired " },
    { from: " have watched ", to: " watched " },
    { from: " had sent ", to: " sent " },
    { from: " will clean ", to: " cleaned " },
    { from: " is managing ", to: " managed " },
    { from: " has prepared ", to: " prepared " },
    { from: " was signing ", to: " signed " },
    { from: " will solve ", to: " solved " },
    { from: " had won ", to: " won " },
    { from: " is making ", to: " made " },
    { from: " have borrowed ", to: " borrowed " },
    { from: " were serving ", to: " served " },
    { from: " had passed ", to: " passed " },
    { from: " is singing ", to: " sang " },
    { from: " was organising ", to: " organised " },
    { from: " will deliver ", to: " delivered " },
    { from: " had announced ", to: " announced " },
    { from: " is constructing ", to: " constructed " },
    { from: " was driving ", to: " drove " },
    { from: " is watering ", to: " watered " },
    { from: " was teaching ", to: " taught " },
    { from: " will implement ", to: " implemented " },
    { from: " had sold ", to: " sold " },
    { from: " is writing ", to: " wrote " },
    { from: " was delivering ", to: " delivered " },
    { from: " will sign ", to: " signed " },
    { from: " is discussing ", to: " discussed " },
    { from: " were organising ", to: " organised " },
    { from: " will refund ", to: " refunded " },
    { from: " is restoring ", to: " restored " },
    { from: " has confirmed ", to: " confirmed " },
    { from: " were performing ", to: " performed " },
    { from: " will introduce ", to: " introduced " },
    { from: " is polishing ", to: " polished " },
    { from: " has presented ", to: " presented " },
    { from: " was examining ", to: " examined " },
    { from: " will process ", to: " processed " },
    { from: " are decorating ", to: " decorated " },
    { from: " has installed ", to: " installed " },
    { from: " was chairing ", to: " chaired " },
    { from: " will close ", to: " closed " },
    { from: " is baking ", to: " baked " },
    { from: " has checked ", to: " checked " },
    { from: " was hosting ", to: " hosted " },
    { from: " will renew ", to: " renewed " },
    { from: " had been considering ", to: " considered " },
    { from: " have been developing ", to: " developed " },
    { from: " will have completed ", to: " completed " },
    { from: " was drafting ", to: " drafted " },
    { from: " is preparing ", to: " prepared " },
    { from: " has been teaching ", to: " taught " },
    { from: " sings ", to: " sang " },
    { from: " was reviewing ", to: " reviewed " },
    { from: " will be testing ", to: " tested " },
    { from: " have made ", to: " made " },
    { from: " are analysing ", to: " analysed " },
    { from: " had been renovating ", to: " renovated " },
    { from: " were escorting ", to: " escorted " },
    { from: " has sent ", to: " sent " },
    { from: " will launch ", to: " launched " },
    { from: " is recording ", to: " recorded " },
    { from: " had searched ", to: " searched " },
    { from: " will have sent ", to: " sent " },
    { from: " has handled ", to: " handled " },
    { from: " were questioning ", to: " questioned " },
    { from: " has built ", to: " built " },
    { from: " was winning ", to: " won " },
    { from: " has been inspecting ", to: " inspected " },
    { from: " were admiring ", to: " admired " },
    { from: " will demolish ", to: " demolished " },
    { from: " will follow ", to: " followed " },
    { from: " is selling ", to: " sold " },
    { from: " was preparing ", to: " prepared " },
    { from: " is operating ", to: " operated " },
    { from: " will enforce ", to: " enforced " },
    { from: " was decorating ", to: " decorated " },
    { from: " is announcing ", to: " announced " },
    { from: " will make ", to: " made " },
    { from: " has contaminated ", to: " contaminated " },
    { from: " was hosting ", to: " hosted " },
    { from: " is visiting ", to: " visited " },
    { from: " will upgrade ", to: " upgraded " },
    { from: " were examining ", to: " examined " },
    { from: " has replied ", to: " replied " },
    { from: " is funding ", to: " funded " },
    { from: " had been writing ", to: " wrote " }
  ];

  for (const hr of helperReplacements) {
    if (sentence.includes(hr.from)) {
      return sentence.replace(hr.from, hr.to);
    }
  }

  const words = sentence.replace(/\.$/, "").split(/\s+/);
  for (const word of words) {
    const cleanWord = word.toLowerCase();
    if (verbConjugations[cleanWord]) {
      const alt = verbConjugations[cleanWord][0];
      const isCap = word.charAt(0) === word.charAt(0).toUpperCase() && word.charAt(0) !== word.charAt(0).toLowerCase();
      const replacement = isCap ? alt.charAt(0).toUpperCase() + alt.slice(1) : alt;
      return sentence.replace(new RegExp(`\\b${word}\\b`), replacement);
    }
  }

  return sentence + " (incorrect tense)";
}

function swapSubjectObject(sentence, verb) {
  const parts = sentence.replace(/\.$/, "").split(new RegExp(`\\b${verb}\\b`, 'i'));
  if (parts.length === 2) {
    const sub = parts[0].trim();
    const obj = parts[1].trim();
    let newSub = obj.charAt(0).toUpperCase() + obj.slice(1);
    let newObj = sub;
    if (sub.startsWith("The ") || sub.startsWith("the ") || sub.startsWith("A ") || sub.startsWith("a ") || sub.startsWith("My ") || sub.startsWith("my ")) {
      newObj = sub.charAt(0).toLowerCase() + sub.slice(1);
    }
    return `${newSub} ${verb} ${newObj}.`;
  }
  return sentence;
}

function getWrongTensePassive(sentence) {
  if (sentence.includes(" was being ")) return sentence.replace(" was being ", " is being ");
  if (sentence.includes(" is being ")) return sentence.replace(" is being ", " was being ");
  if (sentence.includes(" was ")) return sentence.replace(" was ", " is ");
  if (sentence.includes(" were ")) return sentence.replace(" were ", " are ");
  if (sentence.includes(" has been ")) return sentence.replace(" has been ", " was ");
  if (sentence.includes(" had been ")) return sentence.replace(" had been ", " was ");
  if (sentence.includes(" will be ")) return sentence.replace(" will be ", " was ");
  return sentence + " (incorrect tense)";
}

function swapPassive(sentence) {
  const byParts = sentence.replace(/\.$/, "").split(" by ");
  if (byParts.length === 2) {
    const firstPart = byParts[0];
    const subjectPart = byParts[1];
    const fpWords = firstPart.split(/\s+/);
    const verb = fpWords[fpWords.length - 1];
    const objectPart = fpWords.slice(0, fpWords.length - 1).join(" ");
    const auxRegex = /(was|were|has\s+been|had\s+been|will\s+be|is\s+being|was\s+being)/i;
    const auxMatch = objectPart.match(auxRegex);
    if (auxMatch) {
       const aux = auxMatch[1];
       const objectNoun = objectPart.split(aux)[0].trim();
       let newObj = subjectPart.charAt(0).toUpperCase() + subjectPart.slice(1);
       let newSub = objectNoun;
       if (objectNoun.startsWith("The ") || objectNoun.startsWith("the ") || objectNoun.startsWith("A ") || objectNoun.startsWith("a ") || objectNoun.startsWith("My ") || objectNoun.startsWith("my ")) {
          newSub = objectNoun.charAt(0).toLowerCase() + objectNoun.slice(1);
       }
       return `${newObj} ${aux} ${verb} by ${newSub}.`;
    }
  }
  return sentence;
}

function generateDirectSpeechDistractors(directText, indirectText) {
  const dist1 = indirectText;
  const quoteMatch = directText.match(/(.*?,?\s*)"(.*?)(".*?)/);
  if (quoteMatch) {
    const reporting = quoteMatch[1];
    const quoteContent = quoteMatch[2];
    let dist2 = directText;
    if (quoteContent.startsWith("I ")) {
      if (reporting.includes("She ") || reporting.includes("she ")) {
        dist2 = directText.replace('"I ', '"she ').replace('"I am ', '"she is ').replace('"I have ', '"she has ').replace('"I will ', '"she will ');
      } else if (reporting.includes("He ") || reporting.includes("he ")) {
        dist2 = directText.replace('"I ', '"he ').replace('"I am ', '"he is ').replace('"I have ', '"he has ').replace('"I will ', '"he will ');
      }
    } else if (quoteContent.startsWith("We ")) {
      dist2 = directText.replace('"We ', '"they ').replace('"We are ', '"they are ').replace('"We have ', '"they have ').replace('"We will ', '"they will ');
    } else {
      dist2 = directText.replace(" am ", " was ").replace(" are ", " were ").replace(" have ", " had ").replace(" will ", " would ");
    }
    if (dist2 === directText) {
      dist2 = directText.replace("said", "told");
    }

    let dist3 = directText
      .replace(" am ", " was ")
      .replace(" is ", " was ")
      .replace(" are ", " were ")
      .replace(" have ", " had ")
      .replace(" has ", " had ")
      .replace(" will ", " would ")
      .replace(" can ", " could ")
      .replace(" go ", " went ")
      .replace(" see ", " saw ")
      .replace(" like ", " liked ");
    
    if (dist3 === directText) {
      dist3 = directText.replace("said to", "told to").replace("said", "told");
    }

    return [dist1, dist2, dist3];
  }
  return [
    indirectText,
    directText.replace("said", "told"),
    directText.replace("said", "told to")
  ];
}

function generateIndirectSpeechDistractors(directText, indirectText) {
  const dist1 = directText;
  let dist2 = indirectText
    .replace(" was ", " is ")
    .replace(" were ", " are ")
    .replace(" had ", " has ")
    .replace(" would ", " will ")
    .replace(" could ", " can ")
    .replace(" went ", " goes ")
    .replace(" saw ", " sees ")
    .replace(" liked ", " likes ");

  if (dist2 === indirectText) {
    dist2 = indirectText.replace("said", "told");
  }

  let dist3 = indirectText;
  if (indirectText.includes("said that")) {
    dist3 = indirectText.replace("said that", "told that");
  } else if (indirectText.includes("asked")) {
    dist3 = indirectText.replace("asked", "said");
  } else if (indirectText.includes("told me that")) {
    dist3 = indirectText.replace("told me that", "said me that");
  } else {
    dist3 = indirectText.replace("said", "told");
  }

  return [dist1, dist2, dist3];
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function main() {
  const ids = [32, 33, 34, 35];
  let report = "=== DRY RUN REPORT ===\n\n";

  for (const id of ids) {
    const topic = await prisma.englishSyllabus.findUnique({
      where: { id },
      include: { questions: true }
    });

    report += `==========================================\n`;
    report += `TOPIC ID ${id}: ${topic.subTopic}\n`;
    report += `==========================================\n`;

    const samples = topic.questions.slice(0, 8); // look at 8 samples
    for (const q of samples) {
      const activeText = q.questionText;
      const correctAns = q.correctAnswer;
      let options = [correctAns];

      if (id === 32) { // Active Voice
        const passive = activeText.replace("Change to active voice: ", "").trim();
        let verbToSwap = null;
        const activeWords = correctAns.replace(/\.$/, "").split(/\s+/);
        for (const w of activeWords) {
          if (verbConjugations[w.toLowerCase()]) {
            verbToSwap = w;
            break;
          }
        }
        const dist1 = passive;
        const dist2 = getWrongTenseActive(correctAns);
        const dist3 = verbToSwap ? swapSubjectObject(correctAns, verbToSwap) : correctAns + " (modified)";
        options.push(dist1, dist2, dist3);
      } else if (id === 33) { // Passive Voice
        const active = activeText.replace("Change to passive voice: ", "").trim();
        const dist1 = active;
        const dist2 = getWrongTensePassive(correctAns);
        const dist3 = swapPassive(correctAns);
        options.push(dist1, dist2, dist3);
      } else if (id === 34) { // Direct Speech
        const indirect = activeText.replace("Convert to direct speech: ", "").replace("Convert to direct speech (exclamation): ", "").replace("Convert to direct speech (command): ", "").replace("Convert to direct speech (question): ", "").replace("Convert to direct speech with reporting clause in middle: ", "").trim();
        const dists = generateDirectSpeechDistractors(correctAns, indirect);
        options.push(...dists);
      } else if (id === 35) { // Indirect Speech
        const direct = activeText.replace("Convert to indirect speech: ", "").replace("Convert to indirect speech (exclamation): ", "").replace("Convert to indirect speech (command): ", "").replace("Convert to indirect speech (question): ", "").trim();
        const dists = generateIndirectSpeechDistractors(direct, correctAns);
        options.push(...dists);
      }

      // Deduplicate options
      options = [...new Set(options)];
      while (options.length < 4) {
        options.push(correctAns + " (Alt " + options.length + ")");
      }
      
      const shuffled = shuffle([...options]);

      report += `Question: "${q.questionText}"\n`;
      report += `Correct Answer: "${correctAns}"\n`;
      report += `Options: ${JSON.stringify(shuffled)}\n`;
      report += `Has correct answer in options: ${shuffled.includes(correctAns)}\n`;
      report += `------------------------------------------\n`;
    }
  }

  fs.writeFileSync('dry_run_mcq_out.txt', report);
  console.log("Written dry run report to dry_run_mcq_out.txt");
}

main().catch(console.error).finally(() => prisma.$disconnect());
