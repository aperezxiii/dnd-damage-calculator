import { useRef, useState } from "react";
import ActionCard from "./components/ActionCard";
import ResultsPanel from "./components/ResultsPanel";
import RollHistoryPanel from "./components/RollHistoryPanel";
import { calculateDamage } from "./damageCalculator";

const defaultPart = {
  name: "",
  diceCount: "1",
  diceType: "d8",
  modifier: "0",
  vulnerable: false,
  resistant: false,
  damageType: "Neutral",
};

function AppButton({
  children,
  onClick,
  background,
  shadowColor,
  fullWidth = false,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        width: fullWidth ? "100%" : "auto",
        background,
        color: "white",
        border: "none",
        padding: fullWidth ? "1rem 1.25rem" : "0.75rem 1rem",
        borderRadius: fullWidth ? "14px" : "10px",
        fontSize: fullWidth ? "1.1rem" : "0.95rem",
        fontWeight: fullWidth ? "800" : "700",
        cursor: "pointer",
        boxShadow: isHovered ? `0 12px 24px ${shadowColor}` : `0 6px 14px ${shadowColor}`,
        transform: isPressed ? "scale(0.99)" : isHovered ? "translateY(-1px)" : "translateY(0)",
        transition: "transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease",
        opacity: isHovered ? 0.98 : 1,
      }}
    >
      {children}
    </button>
  );
}

function App() {
  const [actions, setActions] = useState([{ critType: "none", parts: [{ ...defaultPart }] }]);
  const [results, setResults] = useState([]);
  const [expandedBreakdowns, setExpandedBreakdowns] = useState(new Set());
  const [rollHistory, setRollHistory] = useState([]);
  const [expandedHistory, setExpandedHistory] = useState(new Set());
  const resultsRef = useRef(null);

  const clearDerivedState = () => {
    setResults([]);
    setExpandedBreakdowns(new Set());
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));

  const getPreAdjustmentDamage = (result, critType) => {
    const diceTotal = result.diceTotal ?? 0;
    const modifier = result.modifier ?? 0;
    const maxDice = result.maxDice ?? 0;
    const critRollTotal = result.critRoll?.total ?? 0;

    switch (critType) {
      case "max":
        return diceTotal + maxDice + modifier;
      case "reroll":
        return diceTotal + critRollTotal + modifier;
      case "double":
        return diceTotal * 2 + modifier;
      case "none":
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

  const calculateGrandTotalFromSnapshot = (resultsSnapshot, actionsSnapshot) => {
    return resultsSnapshot.reduce((totalSum, group, actionIndex) => {
      return totalSum + group.reduce((sum, result, partIndex) => {
        const action = actionsSnapshot[actionIndex];
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
  };

  const calculateGroupedDamageTotalsFromSnapshot = (resultsSnapshot, actionsSnapshot) => {
    return resultsSnapshot.reduce((totals, group, actionIndex) => {
      const action = actionsSnapshot[actionIndex];
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

        const type = result.type || "Neutral";
        totals[type] = (totals[type] || 0) + finalDamage;
      });

      return totals;
    }, {});
  };

  const buildHistorySnapshot = (allResults) => {
    const actionsSnapshot = deepClone(actions);
    const resultsSnapshot = deepClone(allResults);

    return {
      id: Date.now() + Math.random(),
      rollNumber: rollHistory.length + 1,
      rolledAt: new Date().toISOString(),
      actionsSnapshot,
      resultsSnapshot,
      grandTotal: calculateGrandTotalFromSnapshot(resultsSnapshot, actionsSnapshot),
      groupedDamageTotals: calculateGroupedDamageTotalsFromSnapshot(resultsSnapshot, actionsSnapshot),
    };
  };

  const resetAll = () => {
    setActions([{ critType: "none", parts: [{ ...defaultPart }] }]);
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
    setActions([...actions, { critType: "none", parts: [{ ...defaultPart }] }]);
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
    defaultValue = "0",
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
        const type = part.diceType.replace(/^d/, "");
        const diceNotation = `${count}d${type}${mod !== 0 ? (mod > 0 ? `+${mod}` : `${mod}`) : ""}`;

        return calculateDamage({
          attackName: part.name,
          diceNotation,
          type: part.damageType,
        });
      })
    );

    setResults(allResults);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);

    const snapshot = buildHistorySnapshot(allResults);
    setRollHistory((prev) => [snapshot, ...prev].slice(0, 10));
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

  const toggleHistoryItem = (historyId) => {
    const updated = new Set(expandedHistory);

    if (updated.has(historyId)) {
      updated.delete(historyId);
    } else {
      updated.add(historyId);
    }

    setExpandedHistory(updated);
  };

  const getColorByType = (type) => {
    const map = {
      Radiant: "#ccaa00",
      Fire: "#ee5500",
      Cold: "#3399cc",
      Force: "#cc3333",
      Lightning: "#3366cc",
      Necrotic: "#40b050",
      Poison: "#44bb00",
      Psychic: "#cc77aa",
      Thunder: "#8844bb",
      Slashing: "#8c8c8c",
      Piercing: "#8c8c8c",
      Bludgeoning: "#8c8c8c",
      Neutral: "#444",
    };
    return map[type] || "#666";
  };

  const clearHistory = () => {
    setRollHistory([]);
    setExpandedHistory(new Set());
  };

  const damageTypes = [
    "Neutral", "Slashing", "Piercing", "Bludgeoning",
    "Fire", "Cold", "Lightning", "Thunder",
    "Acid", "Poison", "Necrotic", "Radiant",
    "Psychic", "Force",
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

      const type = result.type || "Neutral";
      totals[type] = (totals[type] || 0) + finalDamage;
    });

    return totals;
  }, {});

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #f3f4f6 100%)",
        padding: "2rem 1rem 3rem",
      }}
    >
      <div
        style={{
          maxWidth: "980px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: "1.75rem",
            padding: "1.5rem",
            background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
            color: "white",
            borderRadius: "18px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              fontWeight: "800",
              lineHeight: 1.15,
            }}
          >
            D&amp;D Multi-Part Damage Calculator
          </h1>
          <p
            style={{
              margin: "0.6rem 0 0 0",
              color: "#d1d5db",
              fontSize: "1rem",
              lineHeight: 1.5,
              maxWidth: "720px",
            }}
          >
            Build attack actions, configure crit behavior, and calculate grouped damage totals with live breakdowns.
          </p>
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
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
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          <AppButton
            onClick={addAction}
            background="#2563eb"
            shadowColor="rgba(37,99,235,0.22)"
          >
            Add Attack Action
          </AppButton>

          <AppButton
            onClick={resetAll}
            background="#6b7280"
            shadowColor="rgba(107,114,128,0.2)"
          >
            Reset All
          </AppButton>
        </div>

        <div style={{ marginBottom: results.length > 0 ? "1.5rem" : 0 }}>
          <AppButton
            onClick={handleCalculate}
            background="linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
            shadowColor="rgba(234,88,12,0.24)"
            fullWidth
          >
            🎲 Roll Damage
          </AppButton>
        </div>

        {results.length > 0 && (
          <div ref={resultsRef}>
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
          </div>
        )}

        <RollHistoryPanel
          rollHistory={rollHistory}
          expandedHistory={expandedHistory}
          toggleHistoryItem={toggleHistoryItem}
          calculateFinalDamage={calculateFinalDamage}
          getColorByType={getColorByType}
          clearHistory={clearHistory}
        />
      </div>
    </div>
  );
}

export default App;