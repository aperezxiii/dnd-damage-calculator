export default function ResultsPanel({
  results,
  actions,
  expandedBreakdowns,
  toggleBreakdown,
  calculateFinalDamage,
  getColorByType,
  liveGrandTotal,
}) {
  if (results.length === 0) return null;

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
            action.isCrit,
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

            {group.map((result, partIndex) => {
              const key = `${actionIndex}-${partIndex}`;
              const isExpanded = expandedBreakdowns.has(key);
              const part = action.parts[partIndex];
              if (!part) return null;

              const finalDamage = calculateFinalDamage(
                result,
                action.isCrit,
                part.vulnerable,
                part.resistant
              );

              return (
                <div
                  key={partIndex}
                  style={{ color: getColorByType(result.type), marginBottom: '0.75rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <strong>{result.type}</strong> – {finalDamage}
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>
                      ({result.base} base + {action.isCrit ? result.critBonus : 0} crit)
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
                        ▸ Rolled: {result.breakdown.count}d{result.breakdown.sides} = [{result.breakdown.rolled.join(', ')}]
                        {result.breakdown.modifier !== 0 &&
                          ` ${result.breakdown.modifier > 0 ? '+' : '-'} ${Math.abs(result.breakdown.modifier)}`}
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