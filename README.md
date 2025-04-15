# Pokémon TCG Scraper

This Node.js script scrapes Pokémon card data from the website [pocket.limitlesstcg.com](https://pocket.limitlesstcg.com/cards/), collecting detailed information about each card including its stats, rarity, attacks, abilities, and more.

## Data Source

The data for Pokémon cards was obtained from the Pocket Limitless TCG website.
This data was used for the creation of the dataset in JSON.

## Features

- Scrapes card data from multiple sets (`A1`, `P-A`, `A1a`, `A2`, `A2a`, `A2b`)
- Extracts key information such as:
  - Name, ID, HP, Type, Card Type, Evolution Type
  - Image, Attacks, Abilities, Weakness, Retreat Cost
  - Rarity, Pack, Artist, Alternate Versions
  - Crafting Costs and Pull Probabilities
- Saves results to a JSON file (`cards.json` by default)
- Skips already downloaded cards for efficiency
- Includes error handling and retry limits

## Setup

### Requirements

- Node.js (v18 or later recommended)
- `axios`, `cheerio` for HTTP requests and HTML parsing

### Installation

```bash
npm run install
```

## Usage

You can run the scraper via CLI:

```bash
npm run start
```

By default, it scrapes cards with IDs from 1 to 300 for each set.

### Parameters

You can also use the exported `scrapeCards` function:

```js
import { scrapeCards } from "./yourscript.js";

scrapeCards(1, 100, "mycards.json");
```

Arguments:

- `startId`: Starting numeric ID of cards to scrape
- `endId`: Ending numeric ID
- `outputFile`: Optional path to output JSON file

## Data Format

Each card in the JSON output includes fields like:

```json
{
  "id": "123",
  "name": "Pikachu",
  "hp": "60",
  "type": "Electric",
  "card_type": "Pokémon",
  "evolution_type": "Basic",
  "image": "https://...",
  "attacks": [ ... ],
  "ability": { ... },
  "weakness": "Fighting",
  "retreat": "1",
  "rarity": "◊◊",
  "fullart": "No",
  "ex": "No",
  "setCode": "A1",
  "set_details": "Set Title",
  "pack": "Pikachu pack",
  "alternate_versions": [ ... ],
  "artist": "John Doe",
  "probability": { "4 card": "90.000%" },
  "crafting_cost": 70
}
```

## Notes

- Full art cards are marked based on rarity (`☆`, `☆☆`, `☆☆☆`, or "Crown Rare")
- Rarity affects both probability of pulling and crafting cost
- Some default fallback values are used for unknown fields


## Legal Disclaimer and Copyright Notice

This project is non-commercial and for educational purposes only. All rights to Pokémon and any related intellectual property, including but not limited to trademarks, copyrights, and patents, are owned by their respective holders. This project is not affiliated with, endorsed by, or sponsored by the owners of Pokémon or any related entities. No infringement of intellectual property rights is intended.

