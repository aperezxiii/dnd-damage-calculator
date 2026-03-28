export default function ResultsPanel({
  results,
  actions,
  expandedBreakdowns,
  toggleBreakdown,
  calculateFinalDamage,
  getPreAdjustmentDamage,
  getColorByType,
  liveGrandTotal,
  groupedDamageTotals,
}) {
  if (results.length === 0) return null;

  const formatModifier = (modifier) => {
    if (modifier === 0) return '';
    return ` ${modifier > 0 ? '+' : '-'} ${Math.abs(modifier)}`;
  };

  const getCritModeLabel = (critType) => {
    switch (critType) {
      case 'max':
        return 'Max + Roll';
      case 'reroll':
        return 'Roll + Roll';
      case 'double':
        return 'Double Roll';
      case 'none':
      default:
        return 'Off';
    }
  };

  const getCritSummary = (result, critType) => {
    const modifierText = formatModifier(result.modifier ?? 0);

    switch (critType) {
      case 'max':
        return `${result.diceTotal} roll + ${result.maxDice} max${modifierText}`;
      case 'reroll':
        return `${result.diceTotal} roll + ${result.critRoll?.total ?? 0} crit roll${modifierText}`;
      case 'double':
        return `${result.diceTotal} roll × 2${modifierText}`;
      case 'none':
      default:
        return `${result.diceTotal} roll${modifierText}`;
    }
  };

  const sortedGroupedTotals = Object.entries(groupedDamageTotals || {}).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Results</h2>

      {results.map((group, actionIndex) => {
        const action = actions[actionIndex];
        if (!action) return null;

        const actionTotal = group.reduce((sum, result, partIndex) => {
          const part = action.parts[partIndex];
          if (!part) return sum;

          return sum + calculateFinalDamage(
            result,
            action.critType,
            part.vulnerable,
            part.resistant
          );
        }, 0);

        return (
          <div
            key={actionIndex}
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0' }}>
              Attack Action {actionIndex + 1} Total: {actionTotal}
            </h3>

            <div style={{ marginBottom: '0.75rem', color: '#555', fontSize: '0.95rem' }}>
              Crit Mode: <strong>{getCritModeLabel(action.critType)}</strong>
            </div>

            {group.map((result, partIndex) => {
              const key = `${actionIndex}-${partIndex}`;
              const isExpanded = expandedBreakdowns.has(key);
              const part = action.parts[partIndex];
              if (!part) return null;

              const finalDamage = calculateFinalDamage(
                result,
                action.critType,
                part.vulnerable,
                part.resistant
              );

              const preAdjustmentDamage = getPreAdjustmentDamage(result, action.critType);

              return (
                <div
                  key={partIndex}
                  style={{ color: getColorByType(result.type), marginBottom: '0.75rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <strong>{result.type}</strong> – {finalDamage}
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>
                      ({getCritSummary(result, action.critType)})
                    </span>
                    <button
                      onClick={() => toggleBreakdown(actionIndex, partIndex)}
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        backgroundColor: 'white',
                      }}
                    >
                      {isExpanded ? 'Hide Breakdown' : 'Show Breakdown'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div
                      style={{
                        fontSize: '0.9rem',
                        marginLeft: '1rem',
                        marginTop: '0.5rem',
                        color: '#666',
                        backgroundColor: 'white',
                        padding: '0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      <div>
                        ▸ Base Roll: {result.breakdown.count}d{result.breakdown.sides} = [{result.breakdown.baseRolled.join(', ')}]
                        {formatModifier(result.modifier ?? 0)}
                      </div>

                      {action.critType === 'max' && (
                        <div>▸ Crit Bonus (Max Dice): {result.maxDice}</div>
                      )}

                      {action.critType === 'reroll' && (
                        <div>
                          ▸ Crit Roll: {result.breakdown.count}d{result.breakdown.sides} = [{result.breakdown.critRolled.join(', ')}]
                        </div>
                      )}

                      {action.critType === 'double' && (
                        <div>▸ Doubled Dice Total: {result.diceTotal} × 2 = {result.diceTotal * 2}</div>
                      )}

                      <div>▸ Pre-Adjustment Damage: {preAdjustmentDamage}</div>
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

      {sortedGroupedTotals.length > 0 && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f4f4f4',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ margin: '0 0 0.75rem 0' }}>Damage by Type</h3>

          {sortedGroupedTotals.map(([type, total]) => (
            <div
              key={type}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
                color: getColorByType(type),
                fontWeight: 'bold',
              }}
            >
              <span>{type}</span>
              <span>{total}</span>
            </div>
          ))}
        </div>
      )}

      <h2
        style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#4CAF50',
          color: 'white',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        🔥 Grand Total Damage: {liveGrandTotal}
      </h2>
    </div>
  );
}