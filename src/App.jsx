import ActionCard from "./components/ActionCard";
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
  const [actions, setActions] = useState([{ isCrit: false, parts: [{ ...defaultPart }] }]);
  const [results, setResults] = useState([]);
  const [expandedBreakdowns, setExpandedBreakdowns] = useState(new Set());
  const clearDerivedState = () => {
  setResults([]);
  setExpandedBreakdowns(new Set());
};

  // Helper function to calculate final damage with all modifiers
  const calculateFinalDamage = (result, isCrit, vulnerable, resistant) => {
    let adjusted = result.base + (isCrit ? result.critBonus : 0);
    
    if (vulnerable && resistant) {
      // Vulnerable and resistant cancel each other out
    } else if (vulnerable) {
      adjusted *= 2;
    } else if (resistant) {
      adjusted /= 2;
    }
    
    return Math.floor(adjusted);
  };

  const resetAll = () => {
    setActions([{ isCrit: false, parts: [{ ...defaultPart }] }]);
    setResults([]);
    setExpandedBreakdowns(new Set());
  };

  const handlePartChange = (actionIndex, partIndex, field, value) => {
    const updated = [...actions];
    updated[actionIndex].parts[partIndex][field] = value;
    setActions(updated);
  };

  const toggleCrit = (actionIndex) => {
    const updated = [...actions];
    updated[actionIndex].isCrit = !updated[actionIndex].isCrit;
    setActions(updated);
  };

  const addAction = () => {
  setActions([...actions, { isCrit: false, parts: [{ ...defaultPart }] }]);
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

  const validateAndSetNumber = (actionIndex, partIndex, field, value, defaultValue = '0', minValue = null) => {
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

  // Calculate live grand total using the helper function
  const liveGrandTotal = results.reduce((totalSum, group, actionIndex) => {
  return totalSum + group.reduce((sum, result, partIndex) => {
    const action = actions[actionIndex];
    if (!action) return sum;
    const part = action.parts[partIndex];
    if (!part) return sum;
    const finalDamage = calculateFinalDamage(
      result,
      action.isCrit,
      part.vulnerable,
      part.resistant
    );
    return sum + finalDamage;
  }, 0);
}, 0);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px' }}>
      <h1>D&D Multi-Part Damage Calculator</h1>

      {actions.map((action, actionIndex) => (
  <ActionCard
    key={actionIndex}
    action={action}
    actionIndex={actionIndex}
    actionsLength={actions.length}
    toggleCrit={toggleCrit}
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
          style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}
        >
          Add Attack Action
        </button>
        <button 
          onClick={resetAll}
          style={{ backgroundColor: '#9E9E9E', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}
        >
          Reset All
        </button>
      </div>

      <button 
        onClick={handleCalculate}
        style={{ backgroundColor: '#FF5722', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold' }}
      >
        🎲 Roll Damage
      </button>

      {results.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Results</h2>
          {results.map((group, actionIndex) => {
            const action = actions[actionIndex];
            if (!action) return null;
            const actionTotal = group.reduce((sum, result, partIndex) => {
              const part = action.parts[partIndex];
              if (!part) return sum;
              return sum + calculateFinalDamage(result, action.isCrit, part.vulnerable, part.resistant);
            }, 0);

            return (
              <div key={actionIndex} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>Attack Action {actionIndex + 1} Total: {actionTotal}</h3>
                {group.map((result, partIndex) => {
                  const key = `${actionIndex}-${partIndex}`;
                  const isExpanded = expandedBreakdowns.has(key);
                  const part = action.parts[partIndex];
                  if (!part) return null;
                  const finalDamage = calculateFinalDamage(result, action.isCrit, part.vulnerable, part.resistant);
                  
                  return (
                    <div key={partIndex} style={{ color: getColorByType(result.type), marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <strong>{result.type}</strong> – {finalDamage} 
                        <span style={{ color: '#666', fontSize: '0.9rem' }}>
                          ({result.base} base + {action.isCrit ? result.critBonus : 0} crit)
                        </span>
                        <button
                          onClick={() => toggleBreakdown(actionIndex, partIndex)}
                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}
                        >
                          {isExpanded ? 'Hide Breakdown' : 'Show Breakdown'}
                        </button>
                      </div>
                      {isExpanded && (
                        <div style={{ fontSize: '0.9rem', marginLeft: '1rem', marginTop: '0.5rem', color: '#666', backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px' }}>
                          <div>▸ Rolled: {result.breakdown.count}d{result.breakdown.sides} = [{result.breakdown.rolled.join(', ')}]
                            {result.breakdown.modifier !== 0 && ` ${result.breakdown.modifier > 0 ? '+' : '-'} ${Math.abs(result.breakdown.modifier)}`}
                          </div>
                          <div>▸ Crit Bonus: {result.critBonus}</div>
                          <div>▸ Vulnerable: {part.vulnerable ? 'Yes' : 'No'}</div>
                          <div>▸ Resistant: {part.resistant ? 'Yes' : 'No'}</div>
                          <div><strong>▸ Final Damage: {finalDamage}</strong></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          <h2 style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#4CAF50', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
            🔥 Grand Total Damage: {liveGrandTotal}
          </h2>
        </div>
      )}
    </div>
  );
}

export default App;