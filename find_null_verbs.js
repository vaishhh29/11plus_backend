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

async function main() {
  const topic = await prisma.englishSyllabus.findUnique({
    where: { id: 32 },
    include: { questions: true }
  });

  let out = "";
  let count = 0;
  for (const q of topic.questions) {
    const activeText = q.correctAnswer;
    let verbToSwap = null;
    const activeWords = activeText.replace(/\.$/, "").split(/\s+/);
    for (const w of activeWords) {
      if (verbConjugations[w.toLowerCase()]) {
        verbToSwap = w;
        break;
      }
    }
    if (!verbToSwap) {
      out += `No verb found for question: "${activeText}"\n`;
      count++;
    }
  }
  out += `Total active voice questions with null verb swap: ${count}\n`;
  fs.writeFileSync('null_verbs_out.txt', out);
  console.log("Written missing verbs to null_verbs_out.txt");
}

main().catch(console.error).finally(() => prisma.$disconnect());
