import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const LOADOUTS_STORAGE_KEY = "dnd-damage-calculator-loadouts";

export default function useLoadouts({
  user,
  actions,
  setActions,
  defaultAction,
  clearDerivedState,
}) {
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
  const [loadoutMessage, setLoadoutMessage] = useState("");
  const [loadoutMessageType, setLoadoutMessageType] = useState("success");
  const [showBuilderCTA, setShowBuilderCTA] = useState(false);
  const [pendingDeletedLoadout, setPendingDeletedLoadout] = useState(null);
  const deleteTimeoutRef = useRef(null);

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

  const visibleLoadouts = user ? cloudLoadouts : localLoadouts;

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
    if (!user) {
      return {
        data: null,
        error: new Error("No signed-in user found."),
      };
    }

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

    const existing = sourceLoadouts.find(
      (loadout) => loadout.name === trimmedName
    );

    const nextLoadout = buildLoadoutSnapshot(
      trimmedName,
      existing || null
    );

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

  const deleteLoadout = async (loadoutId) => {
    const selected = visibleLoadouts.find(
      (loadout) => loadout.id === loadoutId
    );

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
        setLoadoutMessage(
          `Could not delete "${selected.name}" from account`
        );
        setLoadoutMessageType("error");
        return;
      }

      setCloudLoadouts((prev) =>
        prev.filter((loadout) => loadout.id !== loadoutId)
      );

      setPendingDeletedLoadout({
        loadout: selected,
        source: "cloud",
      });

      setLoadoutMessage(`Deleted "${selected.name}" from account`);
      setLoadoutMessageType("success");
    } else {
      setLocalLoadouts((prev) =>
        prev.filter((loadout) => loadout.id !== loadoutId)
      );

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

  const clearLoadoutSessionState = () => {
    setCloudLoadouts([]);
    setLoadoutName("");
    setLoadoutMessage("");
    setShowBuilderCTA(false);
    clearPendingDeleteTimer();
    setPendingDeletedLoadout(null);
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

    const sanitizedActions = (selected.actionsSnapshot || []).map(
      sanitizeActionForLoadout
    );

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
    const partsToAppend = (sourceAction.parts || []).map(
      sanitizePartForLoadout
    );

    if (partsToAppend.length === 0) return;

    setActions((prev) => {
      if (!prev[targetActionIndex]) return prev;

      const updated = deepClone(prev);
      updated[targetActionIndex].parts.push(...partsToAppend);
      return updated;
    });

    clearDerivedState();
    setLoadoutMessage(
      `Added "${selected.name}" to Action ${targetActionIndex + 1}`
    );
    setLoadoutMessageType("success");
    setShowBuilderCTA(true);
  };

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
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setCloudLoadouts([]);
      return;
    }

    fetchLoadoutsFromSupabase();
  }, [user]);

  return {
    localLoadouts,
    setLocalLoadouts,
    cloudLoadouts,
    setCloudLoadouts,
    loadoutName,
    setLoadoutName,
    loadoutMessage,
    setLoadoutMessage,
    loadoutMessageType,
    setLoadoutMessageType,
    showBuilderCTA,
    setShowBuilderCTA,
    pendingDeletedLoadout,
    setPendingDeletedLoadout,
    deleteTimeoutRef,
    deepClone,
    normalizeLoadoutName,
    createLoadoutId,
    sanitizePartForLoadout,
    sanitizeActionForLoadout,
    clearPendingDeleteTimer,
    finalizePendingDelete,
    visibleLoadouts,
    isSignedIn,
    loadoutStorageLabel,
    buildLoadoutSnapshot,
    loadLoadout,
    addLoadoutAsNewAction,
    addLoadoutToAction,
    saveLoadout,
    deleteLoadout,
    undoDeleteLoadout,
    clearLoadoutSessionState,
    fetchLoadoutsFromSupabase,
  };
}