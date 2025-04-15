import axios from "axios";
import * as cheerio from "cheerio"; // versione ESM
import fs from "fs/promises"; // versione Promise per import ESM

const BASE_URL = "https://pocket.limitlesstcg.com/cards/";

const typeMapping = {
  G: "Grass",
  R: "Fire",
  W: "Water",
  L: "Lightning",
  P: "Psychic",
  F: "Fighting",
  D: "Darkness",
  M: "Metal",
  Y: "Fairy",
  C: "Colorless",
};

const rateByRarity = {
  "1-3 card": {
    "◊": "100.000%",
    "◊◊": "0.000%",
    "◊◊◊": "0.000%",
    "◊◊◊◊": "0.000%",
    "☆": "0.000%",
    "☆☆": "0.000%",
    "☆☆☆": "0.000%",
    "♛": "0.000%",
  },
  "4 card": {
    "◊": "0.000%",
    "◊◊": "90.000%",
    "◊◊◊": "5.000%",
    "◊◊◊◊": "1.666%",
    "☆": "2.572%",
    "☆☆": "0.500%",
    "☆☆☆": "0.222%",
    "♛": "0.040%",
  },
  "5 card": {
    "◊": "0.000%",
    "◊◊": "60.000%",
    "◊◊◊": "20.000%",
    "◊◊◊◊": "6.664%",
    "☆": "10.288%",
    "☆☆": "2.000%",
    "☆☆☆": "0.888%",
    "♛": "0.160%",
  },
};

const craftingCost = {
  "◊": 35,
  "◊◊": 70,
  "◊◊◊": 150,
  "◊◊◊◊": 500,
  "☆": 400,
  "☆☆": 1250,
  "☆☆☆": 1500,
  "♛": 2500,
};

const FullArtRarities = ["☆", "☆☆", "☆☆☆", "Crown Rare"];
const packs = [
  "Pikachu pack",
  "Charizard pack",
  "Mewtwo pack",
  "Mew pack",
  "Dialga pack",
  "Palkia pack",
];
const sets = ["A1", "P-A", "A1a", "A2", "A2a", "A2b"];

function mapAttackCost(costElements) {
  const costList = [];
  costElements.each((_, el) => {
    const symbol = el.children[0]?.data?.trim() || "";
    for (const char of symbol) {
      const type = typeMapping[char] || "Unknown";
      costList.push(type);
    }
  });
  return costList.length > 0 ? costList : ["No Cost"];
}

function getProbabilitiesByRarity(rarity) {
  const probabilities = {};
  for (const [row, rates] of Object.entries(rateByRarity)) {
    if (rarity in rates) {
      probabilities[row] = rates[rarity];
    }
  }
  return probabilities;
}

async function extractCardInfo($, setCode) {
  const title = $("p.card-text-title");
  const id = title.find("a").attr("href").split("/").pop();
  const name = title.find("a").text().trim();
  const hp = title.text().split(" - ").pop().replace(/\D/g, "");

  const type = (() => {
    const parts = title
      .text()
      .split(" - ")
      .map((p) => p.trim());
    return (
      parts.find((part) => Object.values(typeMapping).includes(part)) ||
      "Unknown Type"
    );
  })();

  const cardTypeRaw = $("p.card-text-type").text().replace(/\s+/g, " ").trim();
  const [cardType, evolutionType] = cardTypeRaw.includes("-")
    ? cardTypeRaw.split("-").map((s) => s.trim())
    : [cardTypeRaw, "Basic"];

  const image = $("div.card-image").find("img").attr("src");

  const attacks = [];
  $("div.card-text-attack").each((_, el) => {
    const $el = $(el);
    const attackInfo = $el.find("p.card-text-attack-info");
    const attackEffect = $el.find("p.card-text-attack-effect");
    const costElements = attackInfo.find("span.ptcg-symbol");

    let attackText = attackInfo.text().trim();
    costElements.each((_, ce) => {
      attackText = attackText.replace($(ce).text(), "").trim();
    });

    const parts = attackText.split(" ");
    const damage = parts.pop();
    const name = parts.join(" ") || "Unknown";

    attacks.push({
      cost: mapAttackCost(costElements),
      name,
      damage,
      effect: attackEffect.text().trim() || "No effect",
    });
  });

  let ability = { name: "No ability", effect: "N/A" };
  if (!cardType.startsWith("Trainer")) {
    const block = $("div.card-text-ability");
    if (block.length) {
      const info = block.find("p.card-text-ability-info");
      const effect = block.find("p.card-text-ability-effect");
      ability = {
        name: info.text().replace("Ability:", "").trim(),
        effect: effect.text().trim(),
      };
    }
  } else {
    const abilityBlock = $("div.card-text-section").next(
      "div.card-text-section"
    );
    if (abilityBlock.length) {
      ability = abilityBlock.text().trim();
    }
  }

  const weaknessBlock = $("p.card-text-wrr")
    .text()
    .split("\n")
    .map((s) => s.trim());
  const weakness = weaknessBlock[0]?.split(": ")[1]?.trim() || "N/A";
  const retreat = weaknessBlock[1]?.split(": ")[1]?.trim() || "N/A";

  const rarityRow = $("table.card-prints-versions tr.current");
  const rarity = rarityRow.find("td").last().text().trim() || "Unknown";
  const fullart = FullArtRarities.includes(rarity) ? "Yes" : "No";

  const ex = name.includes("ex") ? "Yes" : "No";

  const setBlock = $("div.card-prints-current");
  const setDetails = setBlock.find("span.text-lg").text().trim() || "Unknown";
  const packTemp = setBlock.find("span").last().text().split("·").pop().trim();
  const pack = packs.includes(packTemp) ? packTemp : "Every pack";

  const alternateVersions = [];
  $("tr").each((_, tr) => {
    const version = $(tr).find("a").text().trim().replace(/\s+/g, " ");
    const rarity = $(tr).find("td").last().text().trim();
    if (version && rarity) {
      alternateVersions.push({
        version,
        rarity: rarity === "Crown Rare" ? "♛" : rarity,
      });
    }
  });

  const artist = $("div.card-text-artist a").text().trim() || "Unknown";

  return {
    id,
    name,
    hp,
    type,
    card_type: cardType,
    evolution_type: evolutionType,
    image,
    attacks,
    ability,
    weakness,
    retreat,
    rarity,
    fullart,
    ex,
    setCode: setCode,
    set_details: setDetails,
    pack,
    alternate_versions: alternateVersions.length
      ? alternateVersions
      : [{ version: "Unknown", rarity: "Unknown" }],
    artist,
    probability: getProbabilitiesByRarity(rarity),
    crafting_cost: craftingCost[rarity] || "Unknown",
  };
}

export async function scrapeCards(startId, endId, outputFile = "cards.json") {
  const existingCards = [];
  const existingIds = new Set();

  try {
    const fileData = await fs.readFile(outputFile, "utf-8");
    const parsed = JSON.parse(fileData);
    parsed.forEach((card) => {
      existingCards.push(card);
      existingIds.add(`${card.setCode}-${card.id}`);
    });
    console.log(`Trovate ${existingCards.length} carte già salvate.`);
  } catch {
    console.log("Nessun file esistente, si parte da zero.");
  }

  const cards = [];
  for (const setName of sets) {
    let errorCount = 0;
    for (let i = startId; i <= endId; i++) {
      const cardId = `${setName}-${i}`;
      if (existingIds.has(cardId)) {
        console.log(`⏭️  Skipping: ${cardId} (già salvata)`);
        continue;
      }
      const url = `${BASE_URL}${setName}/${i}`;
      try {
        const res = await axios.get(url);
        const $ = cheerio.load(res.data);
        const card = await extractCardInfo($, setName);
        console.log(`Processed: ${setName} - ${i}`);
        cards.push(card);
        errorCount = 0;
      } catch (err) {
        console.warn(`Errore con ${setName}/${i}: ${err.message}`);
        if (++errorCount > 4) break;
      }
    }
  }

  const allCards = [...existingCards, ...cards];
  await fs.writeFile(outputFile, JSON.stringify(allCards, null, 2));
  console.log(
    `Scraping completo! ${cards.length} carte salvate in ${outputFile}`
  );
}

// Esecuzione se chiamato direttamente da CLI
const start = Date.now();
console.log("Avvio scraping...");
scrapeCards(1, 300).then(() => {
  const time = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`Tempo impiegato: ${time} secondi`);
});
