import { supabase } from "./lib/supabase";
import { useEffect, useRef, useState } from "react";
import ActionCard from "./components/ActionCard";
import LoadoutsPanel from "./components/LoadoutsPanel";
import ResultsPanel from "./components/ResultsPanel";
import RollHistoryPanel from "./components/RollHistoryPanel";
import { calculateDamage } from "./damageCalculator";
import Button from "./components/ui/Button";
import damageTypes from "./constants/damageTypes";
import diceTypes from "./constants/diceTypes";
import TabsNav from "./components/navigation/TabsNav";
import AuthPanel from "./components/auth/AuthPanel";
import useLoadouts from "./hooks/useLoadouts";

const defaultPart = {
  name: "",
  diceCount: "1",
  diceType: "d8",
  modifier: "0",
  vulnerable: false,
  resistant: false,
  damageType: "Neutral",
};

const defaultAction = () => ({
  critType: "none",
  parts: [{ ...defaultPart }],
});

function App() {  
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);  
  const [actions, setActions] = useState([defaultAction()]);
  const [results, setResults] = useState([]);
  const [expandedBreakdowns, setExpandedBreakdowns] = useState(new Set());
  const [rollHistory, setRollHistory] = useState([]);
  const [expandedHistory, setExpandedHistory] = useState(new Set());
  const [activeTab, setActiveTab] = useState("builder");
  const [authMessage, setAuthMessage] = useState("");
  const [authMessageType, setAuthMessageType] = useState("success");
  const resultsRef = useRef(null);
  const clearDerivedState = () => {
    setResults([]);
    setExpandedBreakdowns(new Set());
  };
  const {
    loadoutName,
    setLoadoutName,
    loadoutMessage,
    loadoutMessageType,
    showBuilderCTA,
    pendingDeletedLoadout,
    deepClone,
    visibleLoadouts,
    loadoutStorageLabel,
    loadLoadout,
    addLoadoutAsNewAction,
    addLoadoutToAction,
    saveLoadout,
    deleteLoadout,
    undoDeleteLoadout,
    clearLoadoutSessionState,
  } = useLoadouts({
    user,
    actions,
    setActions,
    defaultAction,
    clearDerivedState,
  });
  
  useEffect(() => {
    if (!authMessage) return;
    const timeoutId = setTimeout(() => {
      setAuthMessage("");
    }, 3500);
    return () => clearTimeout(timeoutId);
  }, [authMessage]);

  useEffect(() => {
    let isMounted = true;

    const getInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Failed to get session:", error);
        return;
      }

      if (!isMounted) return;

      setSession(data.session);
      setUser(data.session?.user ?? null);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setAuthMessage("Please enter both email and password.");
      setAuthMessageType("error");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    console.log("SIGN IN RESULT:", { data, error });

    if (error) {
      setAuthMessage(error.message || "Could not sign in. Please check your email and password.");
      setAuthMessageType("error");
      return;
    }

    setEmail("");
    setPassword("");
    setAuthMessage("Signed in successfully. Cloud save is now active.");
    setAuthMessageType("success");
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      setAuthMessage(error.message || "Could not sign out.");
      setAuthMessageType("error");
      return;
    }
    
    clearLoadoutSessionState();
    setAuthMessage("Signed out successfully.");
    setAuthMessageType("success");
  };

  const handleSignUp = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setAuthMessage("Please enter both email and password.");
      setAuthMessageType("error");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });

    console.log("SIGN UP RESULT:", { data, error });

    if (error) {
      setAuthMessage(error.message || "Could not create account. Please try again.");
      setAuthMessageType("error");
      return;
    }

    setEmail("");
    setPassword("");
    setAuthMessage("Account created. You can sign in now.");
    setAuthMessageType("success");
  };

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
    setActions([defaultAction()]);
    clearDerivedState();
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
    setActions([...actions, defaultAction()]);
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
    setActiveTab("results");
   
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
          <AuthPanel
            user={user}
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            handleSignIn={handleSignIn}
            handleSignUp={handleSignUp}
            handleSignOut={handleSignOut}
            authMessage={authMessage}
            authMessageType={authMessageType}
          />
          </div>

        <TabsNav activeTab={activeTab} setActiveTab={setActiveTab} />

    {activeTab === "builder" && (
      <>
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
            alignItems: "center",
          }}
        >   

          <Button onClick={addAction} variant="primary">
            Add Attack Action
          </Button>

          <Button onClick={resetAll} variant="dark">
            Reset All
          </Button>
        </div>

        <div style={{ marginBottom: results.length > 0 ? "1.5rem" : 0 }}>
          <Button
            onClick={handleCalculate}
            variant="primary"
            size="xl"
            fullWidth
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              boxShadow: "0 6px 14px rgba(234,88,12,0.24)",
            }}
          >
            {results.length > 0 ? "🎲 Roll Again" : "🎲 Roll Damage"}
          </Button>
        </div>
      </>
    )}

        {activeTab === "results" && (
          <div>
            {results.length === 0 ? (
              <div
                style={{
                  marginTop: "2rem",
                  padding: "2rem",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "16px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                  textAlign: "center",
                  color: "#6b7280",
                  fontSize: "1rem",
                }}
              >
                No results yet — roll damage to see results.
              </div>
            ) : (
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
          </div>
        )}

        {activeTab === "history" && (
          <RollHistoryPanel
            rollHistory={rollHistory}
            expandedHistory={expandedHistory}
            toggleHistoryItem={toggleHistoryItem}
            calculateFinalDamage={calculateFinalDamage}
            getColorByType={getColorByType}
            clearHistory={clearHistory}
          />
        )}

        {activeTab === "loadouts" && (
          <LoadoutsPanel
            loadoutName={loadoutName}
            setLoadoutName={setLoadoutName}
            loadoutMessage={loadoutMessage}
            loadoutMessageType={loadoutMessageType}
            showBuilderCTA={showBuilderCTA}
            goToBuilder={() => setActiveTab("builder")}
            loadouts={visibleLoadouts}
            saveLoadout={saveLoadout}
            loadLoadout={loadLoadout}
            addLoadoutAsNewAction={addLoadoutAsNewAction}
            addLoadoutToAction={addLoadoutToAction}
            deleteLoadout={deleteLoadout}
            actions={actions}
            storageLabel={loadoutStorageLabel}
            pendingDeletedLoadout={pendingDeletedLoadout}
            undoDeleteLoadout={undoDeleteLoadout}
          />
        )}
      </div>
    </div>
  );
}

export default App;