import ActionCard from "./components/ActionCard";
import ResultsPanel from "./components/ResultsPanel";
import { useState } from 'react';
import { calculateDamage } from './damageCalculator';

const defaultPart = {
  name: '',
  diceCount: '1',
  diceType: 'd8',
  modifier: '0',
  vulnerable: false,
  resistant: false,
  damageType: 'Neutral',
};

function App() {
  const [actions, setActions] = useState([
    { critType: 'none', parts: [{ ...defaultPart }] }
  ]);
  const [results, setResults] = useState([]);
  const [expandedBreakdowns, setExpandedBreakdowns] = useState(new Set());

  const clearDerivedState = () => {
    setResults([]);
    setExpandedBreakdowns(new Set());
  };

  const getPreAdjustmentDamage = (result, critType) => {
    const diceTotal = result.diceTotal ?? 0;
    const modifier = result.modifier ?? 0;
    const maxDice = result.maxDice ?? 0;
    const critRollTotal = result.critRoll?.total ?? 0;

    switch (critType) {
      case 'max':
        return diceTotal + maxDice + modifier;
      case 'reroll':
        return diceTotal + critRollTotal + modifier;
      case 'double':
        return (diceTotal * 2) + modifier;
      case 'none':
      default:
        return diceTotal + modifier;
    }
  };

  const calculateFinalDamage = (result, critType, vulnerable, resistant) => {
    let adjusted = getPreAdjustmentDamage(result, critType);

    if (vulnerable && resistant) {
      // cancel each other out
    } else if (vulnerable) {
      adjusted *= 2;
    } else if (resistant) {
      adjusted /= 2;
    }

    return Math.floor(adjusted);
  };

  const resetAll = () => {
    setActions([{ critType: 'none', parts: [{ ...defaultPart }] }]);
    setResults([]);
    setExpandedBreakdowns(new Set());
  };

  const handlePartChange = (actionIndex, partIndex, field, value) => {
    const updated = [...actions];
    updated[actionIndex].parts[partIndex][field] = value;
    setActions(updated);
  };

  const handleCritTypeChange = (actionIndex, value) => {
    const updated = [...actions];
    updated[actionIndex].critType = value;
    setActions(updated);
  };

  const addAction = () => {
    setActions([...actions, { critType: 'none', parts: [{ ...defaultPart }] }]);
    clearDerivedState();
  };

  const removeAction = (index) => {
    setActions(actions.filter((_, i) => i !== index));
    clearDerivedState();
  };

  const addPart = (actionIndex) => {
    const updated = [...actions];
    updated[actionIndex].parts.push({ ...defaultPart });
    setActions(updated);
    clearDerivedState();
  };

  const removePart = (actionIndex, partIndex) => {
    const updated = [...actions];
    updated[actionIndex].parts.splice(partIndex, 1);
    setActions(updated);
    clearDerivedState();
  };

  const validateAndSetNumber = (
    actionIndex,
    partIndex,
    field,
    value,
    defaultValue = '0',
    minValue = null
  ) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || (minValue !== null && parsed < minValue)) {
      handlePartChange(actionIndex, partIndex, field, defaultValue);
    }
  };

  const handleCalculate = () => {
    const allResults = actions.map((action) =>
      action.parts.map((part) => {
        const count = parseInt(part.diceCount, 10) || 1;
        const mod = parseInt(part.modifier, 10) || 0;
        const type = part.diceType.replace(/^d/, '');
        const diceNotation = `${count}d${type}${mod !== 0 ? (mod > 0 ? `+${mod}` : `${mod}`) : ''}`;

        return calculateDamage({
          attackName: part.name,
          diceNotation,
          type: part.damageType,
        });
      })
    );

    setResults(allResults);
  };

  const toggleBreakdown = (actionIndex, partIndex) => {
    const key = `${actionIndex}-${partIndex}`;
    const updated = new Set(expandedBreakdowns);

    if (updated.has(key)) {
      updated.delete(key);
    } else {
      updated.add(key);
    }

    setExpandedBreakdowns(updated);
  };

  const getColorByType = (type) => {
    const map = {
      Radiant: '#ccaa00',
      Fire: '#ee5500',
      Cold: '#3399cc',
      Force: '#cc3333',
      Lightning: '#3366cc',
      Necrotic: '#40b050',
      Poison: '#44bb00',
      Psychic: '#cc77aa',
      Thunder: '#8844bb',
      Slashing: '#8c8c8c',
      Piercing: '#8c8c8c',
      Bludgeoning: '#8c8c8c',
      Neutral: '#444',
    };
    return map[type] || '#666';
  };

  const damageTypes = [
    "Neutral", "Slashing", "Piercing", "Bludgeoning",
    "Fire", "Cold", "Lightning", "Thunder",
    "Acid", "Poison", "Necrotic", "Radiant",
    "Psychic", "Force"
  ];

  const diceTypes = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];

  const liveGrandTotal = results.reduce((totalSum, group, actionIndex) => {
    return totalSum + group.reduce((sum, result, partIndex) => {
      const action = actions[actionIndex];
      if (!action) return sum;

      const part = action.parts[partIndex];
      if (!part) return sum;

      const finalDamage = calculateFinalDamage(
        result,
        action.critType,
        part.vulnerable,
        part.resistant
      );

      return sum + finalDamage;
    }, 0);
  }, 0);
  const groupedDamageTotals = results.reduce((totals, group, actionIndex) => {
  const action = actions[actionIndex];
  if (!action) return totals;

  group.forEach((result, partIndex) => {
    const part = action.parts[partIndex];
    if (!part) return;

    const finalDamage = calculateFinalDamage(
      result,
      action.critType,
      part.vulnerable,
      part.resistant
    );

    const type = result.type || 'Neutral';
    totals[type] = (totals[type] || 0) + finalDamage;
  });

  return totals;
}, {});

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px' }}>
      <h1>D&amp;D Multi-Part Damage Calculator</h1>

      {actions.map((action, actionIndex) => (
        <ActionCard
          key={actionIndex}
          action={action}
          actionIndex={actionIndex}
          actionsLength={actions.length}
          handleCritTypeChange={handleCritTypeChange}
          addPart={addPart}
          removeAction={removeAction}
          handlePartChange={handlePartChange}
          validateAndSetNumber={validateAndSetNumber}
          removePart={removePart}
          damageTypes={damageTypes}
          diceTypes={diceTypes}
        />
      ))}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={addAction}
          style={{
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px'
          }}
        >
          Add Attack Action
        </button>

        <button
          onClick={resetAll}
          style={{
            backgroundColor: '#9E9E9E',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px'
          }}
        >
          Reset All
        </button>
      </div>

      <button
        onClick={handleCalculate}
        style={{
          backgroundColor: '#FF5722',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '4px',
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}
      >
        🎲 Roll Damage
      </button>

      {results.length > 0 && (
        <ResultsPanel
          results={results}
          actions={actions}
          expandedBreakdowns={expandedBreakdowns}
          toggleBreakdown={toggleBreakdown}
          calculateFinalDamage={calculateFinalDamage}
          getPreAdjustmentDamage={getPreAdjustmentDamage}
          getColorByType={getColorByType}
          liveGrandTotal={liveGrandTotal}
          groupedDamageTotals={groupedDamageTotals}
        />
      )}
    </div>
  );
}

export default App;