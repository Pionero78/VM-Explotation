export interface Person {
  name: string;
  group: string;
}

export interface GroupMember {
  [name: string]: string; // name -> job title mapping
}

export interface GroupData {
  [group: string]: GroupMember;
}

export interface MissionOrderSettings {
  fontFamily: string;
  fontSize: number;
  nomTop: number;
  nomLeft: number;
  fieldSpacing: number;
  dateBottom: number;
  dateRight: number;
  signatairePosTop: number;
  signatairePosLeft: number;
  datePosTop: number;
  datePosLeft: number;
  listFontFamily: string;
  listFontSize: number;
  listMarginTop: number;
  listMarginLeft: number;
  listLineSpacing: number;
  listColumnSpacing: number; // Deprecated, kept for compatibility
  listSignatureBottom: number;
  listSignatureRight: number;
  listTitleVerticalPosition: number;
  // Interface-specific calibration settings
  interfaceSectionHeaderHeight: number;
  interfaceSectionTitleSize: number;
  interfaceRowSpacing: number;
  interfaceColumnGap: number;
  // Print-only list calibration settings
  listSectionHeaderHeight: number;
  listSectionTitleSize: number;
  listRowSpacing: number;
  listColumnGap: number;
  formFontFamily: string;
  formFontSize: number;
  formBoldEnabled: boolean;
  formHorizontalSpacing: number;
  formVerticalSpacing: number;
  historyFontFamily: string;
  historyFontSize: number;
  // Options de style gras
  omBoldEnabled: boolean;
  listBoldEnabled: boolean;
  // Option pour l'alternance des couleurs
  alternateRowColors: boolean;
  savedConfigs: CalibrationConfig[];
}

export interface CalibrationConfig {
  id: string;
  name: string;
  description: string;
  settings: Partial<MissionOrderSettings>;
}

export interface MissionOrderFormData {
  residence: string;
  destination: string;
  motif: string;
  transport: string;
  matricule?: string;
  dateDepart: string;
  dateRetour: string;
  signataire: string;
  date: string;
}

export interface HistoryEntry extends MissionOrderFormData {
  group: string;
  selectedNames: Person[];
}

export type GroupType =
  | "HD1"
  | "HD2"
  | "HD3"
  | "HD4"
  | "HD5"
  | "G6"
  | "G7"
  | "G10"
  | "G11"
  | "G12"
  | "FH"
  | "Chauffeurs"
  | "DOP"
  | "Machinistes"
  | "Autres"
  | "TDA"
  | "Fixe";

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
