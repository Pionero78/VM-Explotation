
import { GroupData } from '@/types';

// Données hardcodées supprimées - seules les données importées via Excel seront utilisées
export const groupDataMapping: GroupData = {
  "HD1": {},
  "HD2": {},
  "HD3": {},
  "HD4": {},
  "HD5": {},
  "G6": {},
  "G7": {},
  "G10": {},
  "G11": {},
  "G12": {},
  "FH": {},
  "Chauffeurs": {},
  "DOP": {},
  "Machinistes": {},
  "Autres": {},
  "TDA": {},
  "Fixe": {}
};

export const getGroupColor = (group: string): string => {
  if (group.startsWith('HD')) return 'bg-hd';
  if (group.startsWith('G')) return 'bg-g';
  if (group === 'FH') return 'bg-fh';
  if (group === 'Chauffeurs') return 'bg-chauffeurs';
  if (group === 'DOP') return 'bg-dop';
  if (group === 'Machinistes' || group === 'Autres') return 'bg-machinistes';
  if (group === 'TDA') return 'bg-green-200';
  if (group === 'Fixe') return 'bg-gray-200';
  return 'bg-gray-200';
};

// Fonction modifiée pour forcer l'affichage en majuscules
export const getEmploymentForName = (name: string, currentData?: GroupData): string => {
  const dataToUse = currentData || groupDataMapping;
  
  for (const group in dataToUse) {
    if (dataToUse[group][name]) {
      return dataToUse[group][name].toUpperCase();
    }
  }
  return '';
};
