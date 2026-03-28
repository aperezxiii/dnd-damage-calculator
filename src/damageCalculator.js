import { rollDice, parseDiceNotation, extractDamageType } from './utils';

export function calculateDamage({ attackName, diceNotation, type }) {
  const { count, sides, modifier } = parseDiceNotation(diceNotation);

  const baseRoll =
    count > 0 ? rollDice(sides, count) : { total: 0, rollsArray: [] };

  // Store a second roll up front so "Roll + Roll" can update dynamically
  // after the initial calculation without rerolling later.
  const critRoll =
    count > 0 ? rollDice(sides, count) : { total: 0, rollsArray: [] };

  const maxDice = count > 0 ? count * sides : 0;

  return {
    type: type || extractDamageType(attackName),
    diceTotal: baseRoll.total,
    modifier,
    maxDice,
    critRoll,
    breakdown: {
      baseRolled: baseRoll.rollsArray,
      critRolled: critRoll.rollsArray,
      sides,
      count,
      notation: diceNotation,
    },
  };
}