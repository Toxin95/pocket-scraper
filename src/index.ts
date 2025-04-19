import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs/promises";
import {
  PokemonType,
  PokemonRarity,
  CraftingCost,
  FullArtRarities,
  PokemonPack,
  PokemonSet,
  PokemonCard,
} from "./types/types.js";

const BASE_URL = "https://pocket.limitlesstcg.com/cards/";

const typeMapping: Record<string, PokemonType> = {
  G: PokemonType.Grass,
  R: PokemonType.Fire,
  W: PokemonType.Water,
  L: PokemonType.Lightning,
  P: PokemonType.Psychic,
  F: PokemonType.Fighting,
  D: PokemonType.Darkness,
  M: PokemonType.Metal,
  Y: PokemonType.Fairy,
  C: PokemonType.Colorless,
};

const rateByRarity: Record<string, Record<PokemonRarity, string>> = {
  "1-3 card": {
    [PokemonRarity.Common]: "100.000%",
    [PokemonRarity.Uncommon]: "0.000%",
    [PokemonRarity.Rare]: "0.000%",
    [PokemonRarity.UltraRare]: "0.000%",
    [PokemonRarity.Star]: "0.000%",
    [PokemonRarity.DoubleStar]: "0.000%",
    [PokemonRarity.TripleStar]: "0.000%",
    [PokemonRarity.CrownRare]: "0.000%",
  },
  "4 card": {
    [PokemonRarity.Common]: "0.000%",
    [PokemonRarity.Uncommon]: "90.000%",
    [PokemonRarity.Rare]: "5.000%",
    [PokemonRarity.UltraRare]: "1.666%",
    [PokemonRarity.Star]: "2.572%",
    [PokemonRarity.DoubleStar]: "0.500%",
    [PokemonRarity.TripleStar]: "0.222%",
    [PokemonRarity.CrownRare]: "0.040%",
  },
  "5 card": {
    [PokemonRarity.Common]: "0.000%",
    [PokemonRarity.Uncommon]: "60.000%",
    [PokemonRarity.Rare]: "20.000%",
    [PokemonRarity.UltraRare]: "6.664%",
    [PokemonRarity.Star]: "10.288%",
    [PokemonRarity.DoubleStar]: "2.000%",
    [PokemonRarity.TripleStar]: "0.888%",
    [PokemonRarity.CrownRare]: "0.160%",
  },
};

const craftingCost: Record<PokemonRarity, CraftingCost> = {
  [PokemonRarity.Common]: CraftingCost.Common,
  [PokemonRarity.Uncommon]: CraftingCost.Uncommon,
  [PokemonRarity.Rare]: CraftingCost.Rare,
  [PokemonRarity.UltraRare]: CraftingCost.UltraRare,
  [PokemonRarity.Star]: CraftingCost.Star,
  [PokemonRarity.DoubleStar]: CraftingCost.DoubleStar,
  [PokemonRarity.TripleStar]: CraftingCost.TripleStar,
  [PokemonRarity.CrownRare]: CraftingCost.CrownRare,
};

const packs = Object.values(PokemonPack);
const sets = Object.values(PokemonSet);

function mapAttackCost(costElements: cheerio.Cheerio<any>): PokemonType[] {
  const costList: PokemonType[] = [];
  costElements.each((_, el) => {
    const symbol = (el.children[0]?.data?.trim() || "") as string;
    for (const char of symbol) {
      const type = typeMapping[char] || PokemonType.Colorless;
      costList.push(type);
    }
  });
  return costList.length > 0 ? costList : [PokemonType.Colorless];
}

function getProbabilitiesByRarity(rarity: PokemonRarity): { "1-3 card": string; "4 card": string; "5 card": string; } {
  return {
    "1-3 card": rateByRarity["1-3 card"][rarity],
    "4 card": rateByRarity["4 card"][rarity],
    "5 card": rateByRarity["5 card"][rarity]
  };
}

async function extractCardInfo($: cheerio.CheerioAPI, setCode: string): Promise<PokemonCard> {
  const title = $("p.card-text-title");
  const id = title.find("a").attr("href")?.split("/").pop() || "Unknown";
  const name = title.find("a").text().trim();
  const hp = title.text().split(" - ").pop()?.replace(/\D/g, "") || "0";

  const type = (() => {
    const parts = title
      .text()
      .split(" - ")
      .map((p) => p.trim());
    return (
      parts.find((part) => Object.values(typeMapping).includes(part as PokemonType)) ||
      PokemonType.Colorless
    );
  })();

  const cardTypeRaw = $("p.card-text-type").text().replace(/\s+/g, " ").trim();
  const [cardType, evolutionType] = cardTypeRaw.includes("-")
    ? cardTypeRaw.split("-").map((s) => s.trim())
    : [cardTypeRaw, "Basic"];

  const image = $("div.card-image").find("img").attr("src") || "";

  const attacks: PokemonCard["attacks"] = [];
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
    const damage = parts.pop() || "0";
    const name = parts.join(" ") || "Unknown";

    attacks.push({
      cost: mapAttackCost(costElements),
      name,
      damage,
      effect: attackEffect.text().trim() || "No effect",
    });
  });

  let ability: PokemonCard["ability"] = { name: "No ability", effect: "N/A" };
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
  }

  const weaknessBlock = $("p.card-text-wrr")
    .text()
    .split("\n")
    .map((s) => s.trim());
  const weakness = weaknessBlock[0]?.split(": ")[1]?.trim() || "N/A";
  const retreat = weaknessBlock[1]?.split(": ")[1]?.trim() || "N/A";

  const rarityRow = $("table.card-prints-versions tr.current");
  const rarity = rarityRow.find("td").last().text().trim() as PokemonRarity;
  const fullart = rarity in FullArtRarities ? "Yes" : "No";

  const ex = name.includes("ex") ? "Yes" : "No";

  const setBlock = $("div.card-prints-current");
  const setDetails = setBlock.find("span.text-lg").text().trim() || "Unknown";
  const packTemp = setBlock.find("span").last().text().split("·").pop()?.trim() || "Every pack";
  const pack = packs.includes(packTemp as PokemonPack) ? packTemp : "Every pack";

  const alternateVersions: PokemonCard["alternate_versions"] = [];
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
    set_code: setCode,
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

export async function scrapeCards(startId: number, endId: number, outputFile = "./dist/cards.json") {
  const existingCards: PokemonCard[] = [];
  const existingIds = new Set<string>();

  try {
    const fileData = await fs.readFile(outputFile, "utf-8");
    const parsed = JSON.parse(fileData) as PokemonCard[];
    parsed.forEach((card) => {
      existingCards.push(card);
      existingIds.add(`${card.set_code}-${card.id}`);
    });
    console.log(`Trovate ${existingCards.length} carte già salvate.`);
  } catch {
    console.log("Nessun file esistente, si parte da zero.");
  }

  const cards: PokemonCard[] = [];
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
      } catch (err: any) {
        console.warn(`Errore con ${setName}/${i}: ${err.message}`);
        if (++errorCount > 4) break;
      }
    }
  }

  await fs.writeFile(
    outputFile,
    JSON.stringify([...existingCards, ...cards], null, 2)
  );
  console.log(
    `Scraping completo! ${cards.length} carte salvate in ${outputFile}`
  );
}

const start = Date.now();
console.log("Avvio scraping...");
scrapeCards(1, 300).then(() => {
  const time = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`Tempo impiegato: ${time} secondi`);
});
