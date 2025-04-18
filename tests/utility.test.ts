import { filterPokemonCards, filterByType, filterByRarity, filterByCraftingCost, filterByAbilityPresence, filterBySet } from '../utility/utility';
import { PokemonCard, PokemonSet } from '../src/types/types';

const mockCards: PokemonCard[] = [
  {
    id: '1',
    name: 'Bulbasaur',
    hp: '70',
    type: 'Grass',
    card_type: 'Pokémon',
    evolution_type: 'Basic',
    image: '',
    attacks: [],
    ability: { name: 'Overgrow', effect: 'Boosts Grass moves' },
    weakness: 'Fire',
    retreat: '1',
    rarity: '◊',
    fullart: 'No',
    ex: 'No',
    set_code: 'A1',
    set_details: 'Genetic Apex',
    pack: 'Every pack',
    alternate_versions: [],
    artist: 'Artist A',
    probability: { '1-3 card': '50%', '4 card': '30%', '5 card': '20%' },
    crafting_cost: 35,
  },
  {
    id: '2',
    name: 'Charmander',
    hp: '60',
    type: 'Fire',
    card_type: 'Pokémon',
    evolution_type: 'Basic',
    image: '',
    attacks: [],
    ability: { name: 'Blaze', effect: 'Boosts Fire moves' },
    weakness: 'Water',
    retreat: '1',
    rarity: '◊◊',
    fullart: 'No',
    ex: 'No',
    set_code: 'A2',
    set_details: 'Space-Time Smackdown',
    pack: 'Every pack',
    alternate_versions: [],
    artist: 'Artist B',
    probability: { '1-3 card': '40%', '4 card': '40%', '5 card': '20%' },
    crafting_cost: 70,
  },
];

describe('Utility Functions', () => {
  test('filterPokemonCards filters by type and rarity', () => {
    const result = filterPokemonCards(mockCards, { type: 'Grass', rarity: '◊' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bulbasaur');
  });

  test('filterByType filters by type', () => {
    const result = filterByType(mockCards, 'Fire');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charmander');
  });

  test('filterByRarity filters by rarity', () => {
    const result = filterByRarity(mockCards, '◊');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bulbasaur');
  });

  test('filterByCraftingCost filters by crafting cost', () => {
    const result = filterByCraftingCost(mockCards, 50);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bulbasaur');
  });

  test('filterByAbilityPresence filters by ability presence', () => {
    const result = filterByAbilityPresence(mockCards, true);
    expect(result).toHaveLength(2);
  });

  test('filterBySet filters by set code', () => {
    const result = filterBySet(mockCards, PokemonSet.A1);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bulbasaur');
  });
});
