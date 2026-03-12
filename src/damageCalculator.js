import { rollDice, parseDiceNotation, extractDamageType } from './utils';

export function calculateDamage({ attackName, diceNotation, type }) {
  const { count, sides, modifier } = parseDiceNotation(diceNotation);

  const baseRoll = count > 0 ? rollDice(sides, count) : { total: 0, rollsArray: [] };
  const baseTotal = baseRoll.total + modifier;
  const critBonus = count > 0 ? count * sides : 0;

  return {
    type: type || extractDamageType(attackName),
    base: baseTotal,
    critBonus,
    breakdown: {
      rolled: baseRoll.rollsArray,
      modifier,
      sides,
      count,
      notation: diceNotation
    }
  };
}
