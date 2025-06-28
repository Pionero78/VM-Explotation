
import { MissionOrderSettings, Person, HistoryEntry, CalibrationConfig } from "@/types";

export const saveSelectedNames = (selectedNames: Person[]): void => {
  localStorage.setItem("selectedNames", JSON.stringify(selectedNames));
};

export const loadSelectedNames = (): Person[] => {
  const stored = localStorage.getItem("selectedNames");
  return stored ? JSON.parse(stored) : [];
};

export const saveHistory = (historyOM: HistoryEntry[], historyList: HistoryEntry[]): void => {
  localStorage.setItem("historyOM", JSON.stringify(historyOM.slice(0, 5)));
  localStorage.setItem("historyList", JSON.stringify(historyList.slice(0, 5)));
};

export const loadHistory = (): { historyOM: HistoryEntry[], historyList: HistoryEntry[] } => {
  const storedOM = localStorage.getItem("historyOM");
  const storedList = localStorage.getItem("historyList");
  return {
    historyOM: storedOM ? JSON.parse(storedOM) : [],
    historyList: storedList ? JSON.parse(storedList) : []
  };
};

export const getDefaultSettings = (): MissionOrderSettings => {
  return {
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: 12,
    nomTop: 90,
    nomLeft: 40,
    fieldSpacing: 15,
    dateBottom: 45,
    dateRight: 40,
    // Nouveaux paramètres pour signataire et date
    signatairePosTop: 250,
    signatairePosLeft: 40,
    datePosTop: 250,
    datePosLeft: 150,
    listFontFamily: "Arial, sans-serif",
    listFontSize: 12,
    listMarginTop: 20,
    listMarginLeft: 20,
    listLineSpacing: 2,
    listColumnSpacing: 20, // Deprecated, kept for compatibility
    
    // Interface calibration settings
    interfaceSectionHeaderHeight: 32,
    interfaceSectionTitleSize: 14,
    interfaceRowSpacing: 6,
    interfaceColumnGap: 24,
    
    // Print-only list calibration settings
    listSectionHeaderHeight: 32,
    listSectionTitleSize: 14,
    listRowSpacing: 6,
    listColumnGap: 24,
    
    listSignatureBottom: 20,
    listSignatureRight: 20,
    formFontFamily: "Arial, sans-serif",
    formFontSize: 16,
    formBoldEnabled: false,
    formHorizontalSpacing: 12,
    formVerticalSpacing: 8,
    historyFontFamily: "Arial, sans-serif",
    historyFontSize: 14,
    // Options de style gras
    omBoldEnabled: false,
    listBoldEnabled: false,
    // Option pour l'alternance des couleurs
    alternateRowColors: true,
    // Configurations prédéfinies par défaut avec 4 emplacements personnalisables
    savedConfigs: [
      {
        id: 'standard',
        name: 'Standard A4',
        description: 'Configuration standard pour papier A4',
        settings: {
          nomTop: 90,
          nomLeft: 40,
          fieldSpacing: 15,
          signatairePosTop: 250,
          signatairePosLeft: 40,
          datePosTop: 250,
          datePosLeft: 150
        }
      },
      {
        id: 'compact',
        name: 'Format Compact',
        description: 'Configuration compacte pour économiser l\'espace',
        settings: {
          nomTop: 80,
          nomLeft: 30,
          fieldSpacing: 12,
          signatairePosTop: 240,
          signatairePosLeft: 30,
          datePosTop: 240,
          datePosLeft: 130
        }
      },
      {
        id: 'custom1',
        name: 'Préselection personnalisée 1',
        description: 'Configuration personnalisable',
        settings: {}
      },
      {
        id: 'custom2',
        name: 'Préselection personnalisée 2',
        description: 'Configuration personnalisable',
        settings: {}
      }
    ]
  };
};

export const saveSettings = (settings: MissionOrderSettings): void => {
  localStorage.setItem('printSettings', JSON.stringify(settings));
};

export const loadSettings = (): MissionOrderSettings => {
  const settings = JSON.parse(localStorage.getItem('printSettings') || '{}');
  return { ...getDefaultSettings(), ...settings };
};
