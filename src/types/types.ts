export type Attack = {
  cost: string[];
  name: string;
  damage: string;
  effect: string;
};

export type AlternateVersion = {
  version: string;
  rarity: string;
};

export type Probability = {
  "1-3 card": string;
  "4 card": string;
  "5 card": string;
};

export type Ability = {
  name: string;
  effect: string;
};

export type PokemonCard = {
  id: string;
  name: string;
  hp: string;
  type: string;
  card_type: string;
  evolution_type: string;
  image: string;
  attacks: Attack[];
  ability: Ability;
  weakness: string;
  retreat: string;
  rarity: string;
  fullart: string;
  ex: string;
  set_code: string;
  set_details: string;
  pack: string;
  alternate_versions: AlternateVersion[];
  artist: string;
  probability: Probability;
  crafting_cost: number;
};

export enum PokemonSet {
  A1 = "A1",
  PA = "P-A",
  A1a = "A1a",
  A2 = "A2",
  A2a = "A2a",
  A2b = "A2b",
}

export enum PokemonType {
  Grass = "Grass",
  Fire = "Fire",
  Water = "Water",
  Lightning = "Lightning",
  Psychic = "Psychic",
  Fighting = "Fighting",
  Darkness = "Darkness",
  Metal = "Metal",
  Fairy = "Fairy",
  Colorless = "Colorless",
}

export enum PokemonRarity {
  Common = "◊",
  Uncommon = "◊◊",
  Rare = "◊◊◊",
  UltraRare = "◊◊◊◊",
  Star = "☆",
  DoubleStar = "☆☆",
  TripleStar = "☆☆☆",
  CrownRare = "♛",
}

export enum CraftingCost {
  Common = 35,
  Uncommon = 70,
  Rare = 150,
  UltraRare = 500,
  Star = 400,
  DoubleStar = 1250,
  TripleStar = 1500,
  CrownRare = 2500,
}

export enum FullArtRarities {
  Star = "☆",
  DoubleStar = "☆☆",
  TripleStar = "☆☆☆",
  CrownRare = "Crown Rare",
}

export enum PokemonPack {
  Pikachu = "Pikachu pack",
  Charizard = "Charizard pack",
  Mewtwo = "Mewtwo pack",
  Mew = "Mew pack",
  Dialga = "Dialga pack",
  Palkia = "Palkia pack",
}