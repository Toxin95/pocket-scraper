import { PokemonCard, PokemonSet } from './types/types';

/**
 * Filtra le carte Pokémon in base ai criteri specificati.
 * @param cards - Array di carte Pokémon.
 * @param criteria - Oggetto contenente i criteri di filtro.
 * @returns Array di carte che soddisfano i criteri.
 */
export function filterPokemonCards(
  cards: PokemonCard[],
  criteria: {
    type?: string;
    rarity?: string;
    maxCraftingCost?: number;
    abilityPresence?: boolean;
    setCode?: PokemonSet;
  }
): PokemonCard[] {
  return cards.filter((card) => {
    return (
      (criteria.type ? card.type === criteria.type : true) &&
      (criteria.rarity ? card.rarity === criteria.rarity : true) &&
      (criteria.maxCraftingCost !== undefined
        ? card.crafting_cost <= criteria.maxCraftingCost
        : true) &&
      (criteria.abilityPresence !== undefined
        ? criteria.abilityPresence
          ? card.ability && card.ability.effect !== 'N/A'
          : !card.ability || card.ability.effect === 'N/A'
        : true) &&
      (criteria.setCode ? card.set_code === criteria.setCode : true)
    );
  });
}

/**
 * Filtra le carte Pokémon in base al tipo.
 * @param cards - Array di carte Pokémon.
 * @param type - Tipo di Pokémon (es. "Grass").
 * @param setCode - Codice del set (opzionale).
 * @returns Array di carte che corrispondono al tipo e al set specificato.
 */
export function filterByType(cards: PokemonCard[], type: string, setCode?: PokemonSet): PokemonCard[] {
  return cards.filter((card) => card.type === type && (setCode ? card.set_code === setCode : true));
}

/**
 * Filtra le carte Pokémon in base alla rarità.
 * @param cards - Array di carte Pokémon.
 * @param rarity - Rarità della carta (es. "◊").
 * @param setCode - Codice del set (opzionale).
 * @returns Array di carte che corrispondono alla rarità e al set specificato.
 */
export function filterByRarity(cards: PokemonCard[], rarity: string, setCode?: PokemonSet): PokemonCard[] {
  return cards.filter((card) => card.rarity === rarity && (setCode ? card.set_code === setCode : true));
}

/**
 * Filtra le carte Pokémon in base al costo massimo di crafting.
 * @param cards - Array di carte Pokémon.
 * @param maxCost - Costo massimo di crafting.
 * @param setCode - Codice del set (opzionale).
 * @returns Array di carte con costo di crafting inferiore o uguale al massimo e appartenenti al set specificato.
 */
export function filterByCraftingCost(cards: PokemonCard[], maxCost: number, setCode?: PokemonSet): PokemonCard[] {
  return cards.filter((card) => card.crafting_cost <= maxCost && (setCode ? card.set_code === setCode : true));
}

/**
 * Filtra le carte Pokémon in base alla presenza di un'abilità.
 * @param cards - Array di carte Pokémon.
 * @param hasAbility - True se si vogliono carte con abilità, false altrimenti.
 * @param setCode - Codice del set (opzionale).
 * @returns Array di carte che soddisfano il criterio e appartengono al set specificato.
 */
export function filterByAbilityPresence(cards: PokemonCard[], hasAbility: boolean, setCode?: PokemonSet): PokemonCard[] {
  return cards.filter(
    (card) =>
      (hasAbility ? card.ability && card.ability.effect !== 'N/A' : !card.ability || card.ability.effect === 'N/A') &&
      (setCode ? card.set_code === setCode : true)
  );
}

/**
 * Filtra le carte Pokémon in base al set.
 * @param cards - Array di carte Pokémon.
 * @param setCode - Codice del set (es. PokemonSet.A1).
 * @returns Array di carte che appartengono al set specificato.
 */
export function filterBySet(cards: PokemonCard[], setCode: PokemonSet): PokemonCard[] {
  return cards.filter((card) => card.set_code === setCode);
}

