const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const verbConjugations = {
  "bought": ["buys", "will buy", "is buying"],
  "broadcast": ["broadcasts", "will broadcast", "is broadcasting"],
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
  "heard": ["hairs", "will hear", "is hearing"],
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
    { from: " was being ", to: " is being " },
    { from: " were being ", to: " are being " },
    { from: " had been being ", to: " has been being " },
    { from: " had been ", to: " has been " },
    { from: " have been ", to: " had been " },
    { from: " has been ", to: " had been " },
    { from: " was ", to: " is " },
    { from: " were ", to: " are " },
    { from: " will be ", to: " would be " },
    { from: " will ", to: " would " },
    { from: " would ", to: " will " },
    { from: " is ", to: " was " },
    { from: " are ", to: " were " },
    { from: " has ", to: " had " },
    { from: " have ", to: " had " },
    { from: " had ", to: " has " }
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

  return sentence.replace(/\b(\w+ed)\b/g, "$1s");
}

function getFirstNounPhrase(sentence) {
  const clean = sentence.trim().split(/\s+(or|OR)\s+/)[0];
  const words = clean.split(/\s+/);
  const firstWord = words[0];
  const determinerRegex = /^(the|a|an|my|our|their|his|her|its|your)$/i;
  if (determinerRegex.test(firstWord) && words.length > 1) {
    return words[0] + " " + words[1];
  }
  return firstWord;
}

function swapNouns(activeText, passiveText, swapInPassive) {
  const cleanActive = activeText.trim().replace(/\.$/, "");
  const cleanPassive = passiveText.trim().replace(/\.$/, "");

  const activeSub = getFirstNounPhrase(cleanActive);
  const passiveSub = getFirstNounPhrase(cleanPassive);

  if (!activeSub || !passiveSub) return null;

  const targetSentence = swapInPassive ? cleanPassive : cleanActive;
  const lowerTarget = targetSentence.toLowerCase();
  const lowerActiveSub = activeSub.toLowerCase();
  const lowerPassiveSub = passiveSub.toLowerCase();

  const idxActiveSub = lowerTarget.indexOf(lowerActiveSub);
  const idxPassiveSub = lowerTarget.lastIndexOf(lowerPassiveSub);

  if (idxActiveSub === -1 || idxPassiveSub === -1) {
    return null;
  }

  let firstIdx = Math.min(idxActiveSub, idxPassiveSub);
  let secondIdx = Math.max(idxActiveSub, idxPassiveSub);
  
  let firstLen = firstIdx === idxActiveSub ? activeSub.length : passiveSub.length;
  let secondLen = secondIdx === idxActiveSub ? activeSub.length : passiveSub.length;

  let firstReplacement = firstIdx === idxActiveSub ? passiveSub : activeSub;
  let secondReplacement = secondIdx === idxActiveSub ? passiveSub : activeSub;

  if (firstIdx === 0) {
    firstReplacement = firstReplacement.charAt(0).toUpperCase() + firstReplacement.slice(1);
  }
  
  const commonArticles = ["the", "a", "an", "my", "our", "their", "his", "her", "its", "your"];
  if (commonArticles.includes(secondReplacement.toLowerCase().split(/\s+/)[0])) {
    secondReplacement = secondReplacement.charAt(0).toLowerCase() + secondReplacement.slice(1);
  }

  const prefix = targetSentence.substring(0, firstIdx);
  const middle = targetSentence.substring(firstIdx + firstLen, secondIdx);
  const suffix = targetSentence.substring(secondIdx + secondLen);

  return prefix + firstReplacement + middle + secondReplacement + suffix + ".";
}

function getWrongTensePassive(sentence) {
  return getWrongTenseActive(sentence);
}

function getDirectPronounShift(directText) {
  const match = directText.match(/^(.*?\b(said|asked|exclaimed|told|warned|requested|reminded|offered|proposed|suggested)\b[^"]*)"([^"]+)"/i);
  if (!match) return null;
  
  const reporting = match[1];
  const quote = match[3];
  
  let newQuote = quote;
  const repLower = reporting.toLowerCase();
  
  let targetHeShe = "he";
  let targetHisHer = "his";
  if (repLower.includes("she") || repLower.includes("girl") || repLower.includes("woman") || repLower.includes("mother") || repLower.includes("aunt") || repLower.includes("grandmother") || repLower.includes("sarah")) {
    targetHeShe = "she";
    targetHisHer = "her";
  }
  
  if (quote.startsWith("I am ")) {
    newQuote = quote.replace(/^I am /, `${targetHeShe.charAt(0).toUpperCase() + targetHeShe.slice(1)} is `);
  } else if (quote.startsWith("I'm ")) {
    newQuote = quote.replace(/^I'm /, `${targetHeShe.charAt(0).toUpperCase() + targetHeShe.slice(1)} is `);
  } else if (quote.startsWith("I ")) {
    newQuote = quote.replace(/^I /, `${targetHeShe.charAt(0).toUpperCase() + targetHeShe.slice(1)} `);
  } else if (quote.startsWith("We are ")) {
    newQuote = quote.replace(/^We are /, "They are ");
  } else if (quote.startsWith("We ")) {
    newQuote = quote.replace(/^We /, "They ");
  } else if (quote.startsWith("my ")) {
    newQuote = quote.replace(/^my /, `${targetHisHer} `);
  }
  
  newQuote = newQuote
    .replace(/\bI\b/g, targetHeShe)
    .replace(/\bmy\b/g, targetHisHer)
    .replace(/\bwe\b/g, "they")
    .replace(/\bour\b/g, "their");

  if (newQuote !== quote) {
    return reporting + `"` + newQuote + `"`;
  }
  return null;
}

function getDirectTenseShift(directText) {
  const match = directText.match(/^(.*?\b(said|asked|exclaimed|told|warned|requested|reminded|offered|proposed|suggested)\b[^"]*)"([^"]+)"/i);
  if (!match) return null;
  const reporting = match[1];
  const quote = match[3];
  
  let newQuote = quote
    .replace(/\bis\b/g, "was")
    .replace(/\bam\b/g, "was")
    .replace(/\bare\b/g, "were")
    .replace(/\bhave\b/g, "had")
    .replace(/\bhas\b/g, "had")
    .replace(/\bwill\b/g, "would")
    .replace(/\bcan\b/g, "could")
    .replace(/\bgo\b/g, "went")
    .replace(/\bwant\b/g, "wanted")
    .replace(/\blike\b/g, "liked")
    .replace(/\blove\b/g, "loved")
    .replace(/\blive\b/g, "lived")
    .replace(/\bfeel\b/g, "felt")
    .replace(/\bdo\b/g, "did");

  if (newQuote !== quote) {
    return reporting + `"` + newQuote + `"`;
  }
  return null;
}

function generateDirectSpeechDistractors(directText, indirectText) {
  const dist1 = indirectText;
  let dist2 = getDirectPronounShift(directText);
  if (!dist2 || dist2 === directText) {
    if (directText.includes("said to")) {
      dist2 = directText.replace("said to", "told to");
    } else if (directText.includes("said")) {
      dist2 = directText.replace("said", "told");
    } else if (directText.includes("asked")) {
      dist2 = directText.replace("asked", "said");
    } else if (directText.includes("told")) {
      dist2 = directText.replace("told", "said");
    } else {
      dist2 = directText + " (incorrect)";
    }
  }

  let dist3 = getDirectTenseShift(directText);
  if (!dist3 || dist3 === directText || dist3 === dist2) {
    if (directText.includes("asked")) {
      dist3 = directText.replace("asked", "told");
    } else if (directText.includes("said to")) {
      dist3 = directText.replace("said to", "said");
    } else if (directText.includes("said")) {
      dist3 = directText.replace("said", "told");
    } else {
      dist3 = directText + " (Alt)";
    }
  }
  return [dist1, dist2, dist3];
}

function getIndirectWrongTense(indirectText) {
  let res = indirectText
    .replace(/\bwas\b/g, "is")
    .replace(/\bwere\b/g, "are")
    .replace(/\bhad\b/g, "has")
    .replace(/\bwould\b/g, "will")
    .replace(/\bcould\b/g, "can")
    .replace(/\bwent\b/g, "goes")
    .replace(/\bsaw\b/g, "sees")
    .replace(/\bliked\b/g, "likes")
    .replace(/\bloved\b/g, "loves")
    .replace(/\bwanted\b/g, "wants")
    .replace(/\blived\b/g, "lives")
    .replace(/\bfelt\b/g, "feels")
    .replace(/\bplayed\b/g, "plays")
    .replace(/\bworked\b/g, "works")
    .replace(/\bran\b/g, "runs")
    .replace(/\bwalked\b/g, "walks")
    .replace(/\bdrank\b/g, "drinks")
    .replace(/\bate\b/g, "eats")
    .replace(/\bsang\b/g, "sings")
    .replace(/\bdid\b/g, "does")
    .replace(/\bcame\b/g, "comes")
    .replace(/\bspoke\b/g, "speaks")
    .replace(/\btook\b/g, "takes")
    .replace(/\bdrove\b/g, "drives")
    .replace(/\bneeded\b/g, "needs")
    .replace(/\bshould\b/g, "shall")
    .replace(/\bmight\b/g, "may")
    .replace(/\bforbade\b/g, "forbids")
    .replace(/\bordered\b/g, "orders")
    .replace(/\breminded\b/g, "reminds")
    .replace(/\binsisted\b/g, "insists")
    .replace(/\bwarned\b/g, "warns")
    .replace(/\badvised\b/g, "advises")
    .replace(/\bproposed\b/g, "proposes")
    .replace(/\bsuggested\b/g, "suggests")
    .replace(/\boffered\b/g, "offers")
    .replace(/\binstructed\b/g, "instructs")
    .replace(/\brequested\b/g, "requests");

  if (res !== indirectText) {
    return res;
  }
  return null;
}

function getIndirectWrongStructure(indirectText) {
  let res = indirectText;
  if (res.includes("said that")) res = res.replace("said that", "told that");
  else if (res.includes("asked ")) res = res.replace("asked ", "said ");
  else if (res.includes("told me ")) res = res.replace("told me ", "said me ");
  else if (res.includes("requested me ")) res = res.replace("requested me ", "said me ");
  else if (res.includes("requested him ")) res = res.replace("requested him ", "said him ");
  else if (res.includes("reminded me ")) res = res.replace("reminded me ", "said me ");
  else if (res.includes("warned me ")) res = res.replace("warned me ", "said me ");
  else if (res.includes("advised me ")) res = res.replace("advised me ", "said me ");
  else if (res.includes("forbade me ")) res = res.replace("forbade me ", "said me ");
  else if (res.includes("ordered me ")) res = res.replace("ordered me ", "said me ");
  else if (res.includes("insisted ")) res = res.replace("insisted ", "said ");
  else if (res.includes("proposed ")) res = res.replace("proposed ", "said ");
  else if (res.includes("suggested ")) res = res.replace("suggested ", "said ");
  else if (res.includes("offered to")) res = res.replace("offered to", "said to");
  else if (res.includes("instructed me ")) res = res.replace("instructed me ", "said me ");

  if (res !== indirectText) return res;
  if (indirectText.includes("told")) return indirectText.replace("told", "said");
  if (indirectText.includes("said")) return indirectText.replace("said", "told");
  return indirectText + " (incorrect)";
}

function generateIndirectSpeechDistractors(directText, indirectText) {
  const dist1 = directText;
  let dist2 = getIndirectWrongTense(indirectText);
  if (!dist2 || dist2 === indirectText) {
    dist2 = indirectText.replace("said", "told");
  }
  
  let dist3 = getIndirectWrongStructure(indirectText);
  if (!dist3 || dist3 === indirectText || dist3 === dist2) {
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

function addFallbackIfRequired(options, correctAns, countRef) {
  const unique = [...new Set(options)];
  while (unique.length < 4) {
    let fallback = "";
    if (unique.length === 1) fallback = correctAns.replace(/\b(was|is|are|were)\b/g, "be");
    else if (unique.length === 2) fallback = correctAns.replace(/\.$/, "") + " indeed.";
    else fallback = correctAns.replace(/\b(the|a|an)\b/gi, "");
    
    if (unique.includes(fallback) || fallback === "") {
      fallback = correctAns + " (Alt " + unique.length + ")";
    }
    unique.push(fallback);
    countRef.count++;
  }
  return unique;
}

async function main() {
  const ids = [32, 33, 34, 35];
  let updateCount = 0;
  let fallbackRef = { count: 0 };

  for (const id of ids) {
    const topic = await prisma.englishSyllabus.findUnique({
      where: { id },
      include: { questions: true }
    });

    console.log(`Processing Topic "${topic.topic}" / Subtopic "${topic.subTopic}" (ID ${id}) containing ${topic.questions.length} questions...`);

    for (const q of topic.questions) {
      const activeText = q.questionText;
      const correctAns = q.correctAnswer;
      let options = [correctAns];

      if (id === 32) {
        const passive = activeText.replace("Change to active voice: ", "").trim();
        const dist1 = passive;
        const dist2 = getWrongTenseActive(correctAns);
        
        let dist3 = swapNouns(correctAns, passive, false);
        if (!dist3 || dist3 === correctAns) {
          dist3 = correctAns + " (modified)";
        }
        options.push(dist1, dist2, dist3);
      } else if (id === 33) {
        const active = activeText.replace("Change to passive voice: ", "").trim();
        const dist1 = active;
        const dist2 = getWrongTensePassive(correctAns);
        
        let dist3 = swapNouns(active, correctAns, true);
        if (!dist3 || dist3 === correctAns) {
          dist3 = correctAns + " (modified)";
        }
        options.push(dist1, dist2, dist3);
      } else if (id === 34) {
        const indirect = activeText.replace("Convert to direct speech: ", "").replace("Convert to direct speech (exclamation): ", "").replace("Convert to direct speech (command): ", "").replace("Convert to direct speech (question): ", "").replace("Convert to direct speech with reporting clause in middle: ", "").trim();
        const dists = generateDirectSpeechDistractors(correctAns, indirect);
        options.push(...dists);
      } else if (id === 35) {
        const direct = activeText.replace("Convert to indirect speech: ", "").replace("Convert to indirect speech (exclamation): ", "").replace("Convert to indirect speech (command): ", "").replace("Convert to indirect speech (question): ", "").trim();
        const dists = generateIndirectSpeechDistractors(direct, correctAns);
        options.push(...dists);
      }

      const deduplicated = addFallbackIfRequired(options, correctAns, fallbackRef);
      const shuffledOptions = shuffle(deduplicated);

      await prisma.englishQuestion.update({
        where: { id: q.id },
        data: {
          options: shuffledOptions,
          correctAnswer: correctAns,
          questionType: "TEXT"
        }
      });

      updateCount++;
    }
  }

  console.log(`Database update complete! Updated ${updateCount} questions successfully.`);
  console.log(`Fallback options count: ${fallbackRef.count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
