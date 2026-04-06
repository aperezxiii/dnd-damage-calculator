import { supabase } from "./lib/supabase";
import { useEffect, useRef, useState } from "react";
import ActionCard from "./components/ActionCard";
import LoadoutsPanel from "./components/LoadoutsPanel";
import ResultsPanel from "./components/ResultsPanel";
import RollHistoryPanel from "./components/RollHistoryPanel";
import { calculateDamage } from "./damageCalculator";
import Button from "./components/ui/Button";
import { darkInputStyle } from "./components/ui/formStyles";

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

const LOADOUTS_STORAGE_KEY = "dnd-damage-calculator-loadouts";

function TabButton({ label, isActive, onClick }) {
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
        padding: "0.6rem 1rem",
        borderRadius: "999px",
        border: "none",
        fontWeight: "700",
        fontSize: "0.95rem",
        cursor: "pointer",
        whiteSpace: "nowrap",

        backgroundColor: isActive
          ? "#111827"
          : isHovered
          ? "#e5e7eb"
          : "#f3f4f6",

        color: isActive ? "#ffffff" : "#374151",

        transform: isPressed
          ? "scale(0.98)"
          : isHovered
          ? "translateY(-1px)"
          : "translateY(0)",

        boxShadow: isActive
          ? "0 6px 16px rgba(0,0,0,0.12)"
          : isHovered
          ? "0 8px 18px rgba(0,0,0,0.08)"
          : "none",

        outline: isActive ? "2px solid rgba(17,24,39,0.15)" : "none",

        transition: "all 0.18s ease",
      }}
    >
      {label}
    </button>
  );
}


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
  const [localLoadouts, setLocalLoadouts] = useState(() => {
    try {
      const raw = localStorage.getItem(LOADOUTS_STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to read local loadouts from localStorage:", error);
      return [];
    }
  });

  const [cloudLoadouts, setCloudLoadouts] = useState([]);
  const [loadoutName, setLoadoutName] = useState("");
  const [activeTab, setActiveTab] = useState("builder");
  const [loadoutMessage, setLoadoutMessage] = useState("");
  const [loadoutMessageType, setLoadoutMessageType] = useState("success");
  const [authMessage, setAuthMessage] = useState("");
  const [authMessageType, setAuthMessageType] = useState("success");
  const [showBuilderCTA, setShowBuilderCTA] = useState(false);
  const resultsRef = useRef(null);
  const [pendingDeletedLoadout, setPendingDeletedLoadout] = useState(null);
  const deleteTimeoutRef = useRef(null);

  const clearDerivedState = () => {
    setResults([]);
    setExpandedBreakdowns(new Set());
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));

  const normalizeLoadoutName = (name) => name.trim();

  const createLoadoutId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random()}`;
  };

  const sanitizePartForLoadout = (part) => ({
    ...deepClone(part),
    vulnerable: false,
    resistant: false,
  });

  const sanitizeActionForLoadout = (action) => ({
    ...deepClone(action),
    critType: "none",
    parts: (action.parts || []).map(sanitizePartForLoadout),
  });

  const visibleLoadouts = user ? cloudLoadouts : localLoadouts;

  const isSignedIn = Boolean(user);
  const loadoutStorageLabel = isSignedIn
    ? `Loadouts are saved to your account${user?.email ? ` (${user.email})` : ""}.`
    : "Loadouts are saved on this device.";

  useEffect(() => {
    try {
      localStorage.setItem(LOADOUTS_STORAGE_KEY, JSON.stringify(localLoadouts));
    } catch (error) {
      console.error("Failed to write local loadouts to localStorage:", error);
    }
  }, [localLoadouts]);  

  useEffect(() => {
    if (!loadoutMessage) return;
    const timeoutId = setTimeout(() => {
      setLoadoutMessage("");
    }, pendingDeletedLoadout ? 5000 : 2500);
    return () => clearTimeout(timeoutId);
  }, [loadoutMessage, pendingDeletedLoadout]);

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

  useEffect(() => {
    if (!user) return;

    fetchLoadoutsFromSupabase();
  }, [user]);

  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
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
    
    setCloudLoadouts([]);
    setLoadoutName("");
    setLoadoutMessage("");
    setShowBuilderCTA(false);
    clearPendingDeleteTimer();
    setPendingDeletedLoadout(null);
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

  const buildLoadoutSnapshot = (name, existingLoadout = null) => {
    const now = new Date().toISOString();

    return {
      id: existingLoadout?.id || createLoadoutId(),
      name,
      createdAt: existingLoadout?.createdAt || now,
      updatedAt: now,
      version: 1,
      actionsSnapshot: actions.map(sanitizeActionForLoadout),
    };
  };

  const saveLoadoutToSupabase = async (loadout) => {
    if (!user) {
      const error = new Error("No signed-in user found.");
      console.error(error.message);
      return { data: null, error };
    }

    const { data, error } = await supabase
      .from("loadouts")
      .upsert(
        [
          {
            user_id: user.id,
            name: loadout.name,
            data: loadout,
          },
        ],
        {
          onConflict: "user_id,name",
        }
      )
      .select();

    console.log("SAVE LOADOUT RESULT:", { data, error });
    return { data, error };
  };

  const deleteLoadoutFromSupabase = async (loadout) => {
    if (!user) return { data: null, error: new Error("No signed-in user found.") };

    const { data, error } = await supabase
      .from("loadouts")
      .delete()
      .eq("user_id", user.id)
      .eq("name", loadout.name);

    console.log("DELETE LOADOUT RESULT:", { data, error });
    return { data, error };
  };

  const restoreLoadoutToSupabase = async (loadout) => {
    if (!user) {
      const error = new Error("No signed-in user found.");
      console.error(error.message);
      return { data: null, error };
    }

    const { data, error } = await supabase
      .from("loadouts")
      .upsert(
        [
          {
            user_id: user.id,
            name: loadout.name,
            data: loadout,
          },
        ],
        {
          onConflict: "user_id,name",
        }
      )
      .select();

    console.log("RESTORE LOADOUT RESULT:", { data, error });
    return { data, error };
  };

  const clearPendingDeleteTimer = () => {
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }
  };

  const finalizePendingDelete = () => {
    clearPendingDeleteTimer();
    setPendingDeletedLoadout(null);
  };

  const undoDeleteLoadout = async () => {
    if (!pendingDeletedLoadout) return;

    const { loadout, source } = pendingDeletedLoadout;

    clearPendingDeleteTimer();

    if (source === "cloud") {
      const { error } = await restoreLoadoutToSupabase(loadout);
      if (error) {
        console.error("Failed to restore cloud loadout:", error);
        setLoadoutMessage(`Could not restore "${loadout.name}"`);
        setLoadoutMessageType("error");
        setPendingDeletedLoadout(null);
        return;
      }

      setCloudLoadouts((prev) => [loadout, ...prev]);
      setLoadoutMessage(`Restored "${loadout.name}" to account`);
      setLoadoutMessageType("success");
    } else {
      setLocalLoadouts((prev) => [loadout, ...prev]);
      setLoadoutMessage(`Restored "${loadout.name}" locally`);
      setLoadoutMessageType("success");
    }

    setPendingDeletedLoadout(null);
  };

  const fetchLoadoutsFromSupabase = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("loadouts")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch loadouts:", error);
      return;
    }

    const mappedLoadouts = (data || [])
      .map((row) => row.data)
      .filter(Boolean);

    setCloudLoadouts(mappedLoadouts);
  };

  const saveLoadout = async () => {
    const trimmedName = normalizeLoadoutName(loadoutName);
    if (!trimmedName) return;

    const sourceLoadouts = user ? cloudLoadouts : localLoadouts;
    const existing = sourceLoadouts.find((loadout) => loadout.name === trimmedName);
    const nextLoadout = buildLoadoutSnapshot(trimmedName, existing || null);

    if (user) {
      const { error } = await saveLoadoutToSupabase(nextLoadout);

      if (error) {
        console.error("Failed to save cloud loadout:", error);
        setLoadoutMessage(`Could not save "${trimmedName}" to account`);
        setLoadoutMessageType("error");
        setShowBuilderCTA(false);
        return;
      }

      setCloudLoadouts((prev) => {
        if (existing) {
          return prev.map((loadout) =>
            loadout.id === existing.id ? nextLoadout : loadout
          );
        }

        return [nextLoadout, ...prev];
      });
    } else {
      setLocalLoadouts((prev) => {
        if (existing) {
          return prev.map((loadout) =>
            loadout.id === existing.id ? nextLoadout : loadout
          );
        }

        return [nextLoadout, ...prev];
      });
    }

    setLoadoutName(trimmedName);
    setLoadoutMessage(`Saved "${trimmedName}"`);
    setLoadoutMessageType("success");
    setShowBuilderCTA(false);
  };

  const loadLoadout = (loadoutId) => {
    const selected = visibleLoadouts.find((loadout) => loadout.id === loadoutId);
    if (!selected) return;

    setActions(deepClone(selected.actionsSnapshot || [defaultAction()]));
    clearDerivedState();
    setLoadoutName(selected.name || "");
    setLoadoutMessage(`Loaded "${selected.name}" into Builder`);
    setLoadoutMessageType("success");
    setShowBuilderCTA(true);
  };

  const addLoadoutAsNewAction = (loadoutId) => {
    const selected = visibleLoadouts.find((loadout) => loadout.id === loadoutId);
    if (!selected) return;

    const sanitizedActions = (selected.actionsSnapshot || []).map(sanitizeActionForLoadout);
    if (sanitizedActions.length === 0) return;

    setActions((prev) => [...prev, ...sanitizedActions]);
    clearDerivedState();
    setLoadoutMessage(`Added "${selected.name}" as a new action`);
    setLoadoutMessageType("success");
    setShowBuilderCTA(true);
  };

  const addLoadoutToAction = (loadoutId, targetActionIndex) => {
    const selected = visibleLoadouts.find((loadout) => loadout.id === loadoutId);
    if (!selected) return;

    const sourceActions = selected.actionsSnapshot || [];
    if (sourceActions.length !== 1) return;

    const sourceAction = sourceActions[0];
    const partsToAppend = (sourceAction.parts || []).map(sanitizePartForLoadout);

    if (partsToAppend.length === 0) return;

    setActions((prev) => {
      if (!prev[targetActionIndex]) return prev;

      const updated = deepClone(prev);
      updated[targetActionIndex].parts.push(...partsToAppend);
      return updated;
    });

    clearDerivedState();
    setLoadoutMessage(`Added "${selected.name}" to Action ${targetActionIndex + 1}`);
    setLoadoutMessageType("success");
    setShowBuilderCTA(true);
  };

  const deleteLoadout = async (loadoutId) => {
    const selected = visibleLoadouts.find((loadout) => loadout.id === loadoutId);
    if (!selected) return;

    clearPendingDeleteTimer();

    if (user) {
      const confirmed = window.confirm(
        `Delete "${selected.name}" from your account? This cannot be undone.`
      );

      if (!confirmed) return;

      const { error } = await deleteLoadoutFromSupabase(selected);
      if (error) {
        console.error("Failed to delete cloud loadout:", error);
        setLoadoutMessage(`Could not delete "${selected.name}" from account`);
        setLoadoutMessageType("error");
        return;
      }

      setCloudLoadouts((prev) => prev.filter((loadout) => loadout.id !== loadoutId));
      setPendingDeletedLoadout({
        loadout: selected,
        source: "cloud",
      });
      setLoadoutMessage(`Deleted "${selected.name}" from account`);
      setLoadoutMessageType("success");
    } else {
      setLocalLoadouts((prev) => prev.filter((loadout) => loadout.id !== loadoutId));
      setPendingDeletedLoadout({
        loadout: selected,
        source: "local",
      });
      setLoadoutMessage(`Deleted "${selected.name}" locally`);
      setLoadoutMessageType("success");
    }

    setShowBuilderCTA(false);

    deleteTimeoutRef.current = setTimeout(() => {
      finalizePendingDelete();
    }, 5000);
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
          <div
            style={{
              marginTop: "0.85rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.65rem",
              alignItems: "center",
            }}
          >
            {user ? (
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#9ca3af",
                }}
              >
                Signed in as: <strong>{user.email}</strong>
              </div>
            ) : (
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#9ca3af",
                }}
              >
                Not signed in
              </div>
            )}

            <div
              style={{
                padding: "0.35rem 0.65rem",
                borderRadius: "999px",
                fontSize: "0.8rem",
                fontWeight: "700",
                backgroundColor: user ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)",
                color: user ? "#bbf7d0" : "#d1d5db",
                border: user
                  ? "1px solid rgba(34,197,94,0.3)"
                  : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {user ? "Cloud Save Active" : "Local Save Only"}
            </div>
          </div>

          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >            
            {!user ? (
              <>
                <input
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  style={{
                    ...darkInputStyle,
                    width: "auto",
                    flex: "1 1 260px",
                    minWidth: "220px",
                    maxWidth: "320px",
                  }}
                />

                <input
                  className="auth-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  style={{
                    ...darkInputStyle,
                    width: "auto",
                    flex: "1 1 220px",
                    minWidth: "180px",
                    maxWidth: "280px",
                  }}
                />
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Button onClick={handleSignIn} variant="primary" size="lg">
                    Sign In
                  </Button>

                  <Button onClick={handleSignUp} variant="dark" size="lg">
                    Sign Up
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={handleSignOut} variant="danger" size="lg">
                Sign Out
              </Button>
            )}
          </div>
          {authMessage && (
              <div
                style={{
                  marginTop: "0.9rem",
                  maxWidth: "720px",
                  padding: "0.85rem 0.95rem",
                  backgroundColor: authMessageType === "error" ? "rgba(127,29,29,0.22)" : "rgba(34,197,94,0.14)",
                  border: authMessageType === "error"
                    ? "1px solid rgba(248,113,113,0.35)"
                    : "1px solid rgba(74,222,128,0.28)",
                  borderRadius: "12px",
                  color: authMessageType === "error" ? "#fecaca" : "#dcfce7",
                  fontSize: "0.92rem",
                  fontWeight: "600",
                  lineHeight: 1.45,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "0.95rem", lineHeight: 1 }}>
                  {authMessageType === "error" ? "❌" : "✅"}
                </span>
                <span>{authMessage}</span>
              </div>
            )}
          </div>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "0.5rem",
            overflowX: "auto",
          }}
        >
          {[
            { key: "builder", label: "Builder" },
            { key: "results", label: "Results" },
            { key: "history", label: "History" },
            { key: "loadouts", label: "Loadouts" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <TabButton
                key={tab.key}
                label={tab.label}
                isActive={isActive}
                onClick={() => setActiveTab(tab.key)}
              />
            );
          })}
        </div>

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