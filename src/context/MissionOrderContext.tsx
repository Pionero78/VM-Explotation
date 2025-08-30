import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import {
  MissionOrderSettings,
  Person,
  HistoryEntry,
  MissionOrderFormData,
  GroupData,
} from "@/types";
import {
  loadSelectedNames,
  saveSelectedNames,
  loadSettings,
  saveSettings,
  loadHistory,
  saveHistory,
} from "@/utils/localStorageHelpers";
import { getTodayDateISO } from "@/utils/formatDate";
import { groupDataMapping } from "@/data/groupData";

interface MissionOrderContextType {
  selectedNames: Person[];
  setSelectedNames: React.Dispatch<React.SetStateAction<Person[]>>;
  currentGroupId: string;
  setCurrentGroupId: React.Dispatch<React.SetStateAction<string>>;
  historyOM: HistoryEntry[];
  setHistoryOM: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
  historyList: HistoryEntry[];
  setHistoryList: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
  settings: MissionOrderSettings;
  setSettings: React.Dispatch<React.SetStateAction<MissionOrderSettings>>;
  formData: MissionOrderFormData;
  setFormData: React.Dispatch<React.SetStateAction<MissionOrderFormData>>;
  importedGroupData: GroupData;
  setImportedGroupData: React.Dispatch<React.SetStateAction<GroupData>>;
  customGroupOrder: { [groupId: string]: string[] };
  setCustomGroupOrder: React.Dispatch<
    React.SetStateAction<{ [groupId: string]: string[] }>
  >;
  addToHistory: (type: "OM" | "List") => void;
  deleteHistoryEntry: (type: "OM" | "List", index: number) => void;
  loadHistoryEntry: (type: "OM" | "List", index: number) => void;
  clearHistory: () => void;
  toggleNameSelection: (name: string, group: string) => void;
  clearSelectedNames: () => void;
  updateSettings: (
    key: keyof MissionOrderSettings,
    value: string | number | boolean,
  ) => void;
  clearAllGroupData: () => void;
  updateImportedGroupData: (newData: GroupData) => void;
  getCurrentGroupData: () => GroupData;
  updateCustomGroupOrder: (groupId: string, newOrder: string[]) => void;
  getSortedGroupNames: (groupId: string) => string[];
  getVisualOrderFromModal: (groupId: string) => string[];
  removeFromSelection: (name: string) => void;
  reorderSelectedNames: (newOrder: Person[]) => void;
  getSortedSelectedNames: () => Person[];
}

const defaultFormData: MissionOrderFormData = {
  residence: "EPTV, 21 BOULEVARD DES MARTYRS, ALGER",
  destination: "",
  motif: "",
  transport: "Véhicule de service",
  dateDepart: "",
  dateRetour: "",
  signataire: "CHEF DE DÉPARTEMENT",
  date: getTodayDateISO(),
};

const MissionOrderContext = createContext<MissionOrderContextType | undefined>(
  undefined,
);

export const MissionOrderProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedNames, setSelectedNames] = useState<Person[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string>("");
  const [historyOM, setHistoryOM] = useState<HistoryEntry[]>([]);
  const [historyList, setHistoryList] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] =
    useState<MissionOrderSettings>(loadSettings());
  const [formData, setFormData] =
    useState<MissionOrderFormData>(defaultFormData);
  const [importedGroupData, setImportedGroupData] = useState<GroupData>({});
  const [customGroupOrder, setCustomGroupOrder] = useState<{
    [groupId: string]: string[];
  }>({});

  // Load data from localStorage on component mount
  useEffect(() => {
    setSelectedNames(loadSelectedNames());
    const history = loadHistory();
    setHistoryOM(history.historyOM);
    setHistoryList(history.historyList);

    // Charger les données importées depuis localStorage
    const savedImportedData = localStorage.getItem("importedGroupData");
    if (savedImportedData) {
      try {
        setImportedGroupData(JSON.parse(savedImportedData));
      } catch (error) {
        console.error("Error loading imported group data:", error);
      }
    }

    // Charger l'ordre personnalisé des groupes
    const savedCustomOrder = localStorage.getItem("customGroupOrder");
    if (savedCustomOrder) {
      try {
        setCustomGroupOrder(JSON.parse(savedCustomOrder));
      } catch (error) {
        console.error("Error loading custom group order:", error);
      }
    }
  }, []);

  // Sauvegarder les données importées dans localStorage à chaque changement
  useEffect(() => {
    if (Object.keys(importedGroupData).length > 0) {
      localStorage.setItem(
        "importedGroupData",
        JSON.stringify(importedGroupData),
      );
    }
  }, [importedGroupData]);

  // Sauvegarder l'ordre personnalisé dans localStorage
  useEffect(() => {
    localStorage.setItem("customGroupOrder", JSON.stringify(customGroupOrder));
  }, [customGroupOrder]);

  // Save selected names to localStorage when they change
  useEffect(() => {
    saveSelectedNames(selectedNames);
  }, [selectedNames]);

  // Save history to localStorage when it changes
  useEffect(() => {
    saveHistory(historyOM, historyList);
  }, [historyOM, historyList]);

  // Save settings to localStorage when they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const addToHistory = (type: "OM" | "List") => {
    const group = selectedNames.length > 0 ? selectedNames[0].group : "Inconnu";
    const historyEntry: HistoryEntry = {
      group,
      selectedNames: [...selectedNames],
      ...formData,
    };

    if (type === "OM") {
      setHistoryOM((prev) => [historyEntry, ...prev.slice(0, 29)]);
    } else {
      setHistoryList((prev) => [historyEntry, ...prev.slice(0, 29)]);
    }
  };

  const deleteHistoryEntry = (type: "OM" | "List", index: number) => {
    if (type === "OM") {
      setHistoryOM((prev) => prev.filter((_, i) => i !== index));
    } else {
      setHistoryList((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const loadHistoryEntry = (type: "OM" | "List", index: number) => {
    const entry = type === "OM" ? historyOM[index] : historyList[index];

    // Create new array to ensure state update
    setSelectedNames([...entry.selectedNames]);
    setFormData({
      residence: entry.residence,
      destination: entry.destination,
      motif: entry.motif,
      transport: entry.transport,
      dateDepart: entry.dateDepart,
      dateRetour: entry.dateRetour,
      signataire: entry.signataire,
      date: entry.date,
    });
  };

  const clearHistory = () => {
    setHistoryOM([]);
    setHistoryList([]);
  };

  const toggleNameSelection = (name: string, group: string) => {
    setSelectedNames((prev) => {
      const index = prev.findIndex(
        (item) => item.name === name && item.group === group,
      );
      if (index === -1) {
        return [...prev, { name, group }];
      } else {
        return prev.filter((_, i) => i !== index);
      }
    });
  };

  const clearSelectedNames = () => {
    setSelectedNames([]);
  };

  const updateSettings = (
    key: keyof MissionOrderSettings,
    value: string | number | boolean,
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllGroupData = () => {
    setSelectedNames([]);
    setImportedGroupData({});
    setCustomGroupOrder({});
    localStorage.removeItem("importedGroupData");
    localStorage.removeItem("customGroupOrder");
  };

  const updateImportedGroupData = (newData: GroupData) => {
    setImportedGroupData(newData);
  };

  const getCurrentGroupData = (): GroupData => {
    // Si des données ont été importées, les utiliser, sinon utiliser les données par défaut
    return Object.keys(importedGroupData).length > 0
      ? importedGroupData
      : groupDataMapping;
  };

  const updateCustomGroupOrder = (groupId: string, newOrder: string[]) => {
    setCustomGroupOrder((prev) => ({
      ...prev,
      [groupId]: newOrder,
    }));
  };

  const getSortedGroupNames = (groupId: string): string[] => {
    const currentData = getCurrentGroupData();
    const groupData = currentData[groupId] || {};
    const names = Object.keys(groupData);

    // Si on a un ordre personnalisé pour ce groupe, l'utiliser
    if (customGroupOrder[groupId]) {
      const customOrder = customGroupOrder[groupId];
      // S'assurer que tous les noms actuels sont inclus
      const missingNames = names.filter((name) => !customOrder.includes(name));
      return [
        ...customOrder.filter((name) => names.includes(name)),
        ...missingNames,
      ];
    }

    // Sinon, retourner l'ordre original du fichier Excel (sans tri alphabétique)
    return names;
  };

  // Nouvelle fonction pour trier selon l'ordre visuel (grille 6 colonnes)
  const getVisualOrderFromModal = (groupId: string): string[] => {
    const sortedNames = getSortedGroupNames(groupId);
    // L'ordre visuel est déjà déterminé par getSortedGroupNames
    // qui utilise soit l'ordre personnalisé (drag & drop) soit l'ordre alphabétique
    // Cet ordre correspond à la lecture visuelle : gauche à droite, ligne par ligne
    return sortedNames;
  };

  const removeFromSelection = (name: string) => {
    setSelectedNames((prev) => prev.filter((item) => item.name !== name));
  };

  const reorderSelectedNames = (newOrder: Person[]) => {
    setSelectedNames(newOrder);
  };

  // Nouvelle fonction pour trier les noms sélectionnés selon l'ordre des groupes
  const getSortedSelectedNames = (): Person[] => {
    const sortedNames = [...selectedNames];

    // Trier chaque groupe selon son ordre personnalisé
    sortedNames.sort((a, b) => {
      if (a.group !== b.group) {
        return 0; // Garder l'ordre relatif entre groupes différents
      }

      // Pour le même groupe, utiliser l'ordre personnalisé
      const groupOrder = getSortedGroupNames(a.group);
      const indexA = groupOrder.indexOf(a.name);
      const indexB = groupOrder.indexOf(b.name);

      return indexA - indexB;
    });

    return sortedNames;
  };

  return (
    <MissionOrderContext.Provider
      value={{
        selectedNames,
        setSelectedNames,
        currentGroupId,
        setCurrentGroupId,
        historyOM,
        setHistoryOM,
        historyList,
        setHistoryList,
        settings,
        setSettings,
        formData,
        setFormData,
        importedGroupData,
        setImportedGroupData,
        customGroupOrder,
        setCustomGroupOrder,
        addToHistory,
        deleteHistoryEntry,
        loadHistoryEntry,
        clearHistory,
        toggleNameSelection,
        clearSelectedNames,
        updateSettings,
        clearAllGroupData,
        updateImportedGroupData,
        getCurrentGroupData,
        updateCustomGroupOrder,
        getSortedGroupNames,
        getVisualOrderFromModal,
        removeFromSelection,
        reorderSelectedNames,
        getSortedSelectedNames,
      }}
    >
      {children}
    </MissionOrderContext.Provider>
  );
};

export const useMissionOrder = (): MissionOrderContextType => {
  const context = useContext(MissionOrderContext);
  if (context === undefined) {
    throw new Error(
      "useMissionOrder must be used within a MissionOrderProvider",
    );
  }
  return context;
};
