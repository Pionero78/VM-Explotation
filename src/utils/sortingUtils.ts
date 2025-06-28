
import { Person } from '@/types';
import { GroupData } from '@/types';

// Définition de la hiérarchie des fonctions
const FUNCTION_HIERARCHY: { [key: string]: number } = {
  // Chef d'émission
  "Chef d'émission": 1,
  "CHEF D'EMISSION": 1,
  "IXM-CHEF D'EMISSION": 1,
  "Ingénieur - Chef d'émission": 1,
  
  // Ingénieurs
  "Ingénieur": 2,
  "Ingénieur d'Exploitation": 2,
  "IXM": 2,
  "IXM Niveau 1": 2,
  "IXM Niveau 2": 2,
  "I.X.M": 2,
  "I.X.M Niveau 1": 2,
  
  // Personnel SON
  "Ingénieur du son": 3,
  "Perchman": 3,
  "ITT": 3,
  
  // Chef opérateur
  "Directeur Photo Principal": 4,
  "Chef Opérateur": 4,
  
  // Opérateur de prise de vue
  "Directeur Photo": 5,
  "Opérateur": 5,
  
  // Assistant de prise de vue
  "Assistant": 6,
  
  // Opérateur sur synthétiseur
  "Opérateur Synthétiseur": 7,
  
  // Techniciens
  "Technicien": 8,
  "Technicien Supérieur": 8,
  "Technicien Supérieur Niveau 1": 8,
  
  // Machinistes et autres
  "Machiniste": 9,
  "Concepteur Lumière": 9,
  "Chef Éclairagiste": 9,
  "Aide Éclairagiste": 9,
  "Conducteur de véhicule": 9,
  "Conducteur de véhicule Lourd": 9,
  "Secrétaire de direction": 9
};

export const getFunctionOrder = (jobTitle: string): number => {
  // Recherche exacte d'abord
  if (FUNCTION_HIERARCHY[jobTitle]) {
    return FUNCTION_HIERARCHY[jobTitle];
  }
  
  // Recherche partielle pour les titres non listés
  const lowerJobTitle = jobTitle.toLowerCase();
  
  if (lowerJobTitle.includes("chef") && lowerJobTitle.includes("émission")) return 1;
  if (lowerJobTitle.includes("ingénieur")) return 2;
  if (lowerJobTitle.includes("son") || lowerJobTitle.includes("perch")) return 3;
  if (lowerJobTitle.includes("chef") && lowerJobTitle.includes("opérateur")) return 4;
  if (lowerJobTitle.includes("opérateur") || lowerJobTitle.includes("directeur photo")) return 5;
  if (lowerJobTitle.includes("assistant")) return 6;
  if (lowerJobTitle.includes("synthétiseur")) return 7;
  if (lowerJobTitle.includes("technicien")) return 8;
  
  // Par défaut, placer en fin de liste
  return 10;
};

export const sortNamesByFunction = (names: string[], groupData: GroupData): string[] => {
  return [...names].sort((a, b) => {
    const jobA = getJobTitleForName(a, groupData);
    const jobB = getJobTitleForName(b, groupData);
    
    const orderA = getFunctionOrder(jobA);
    const orderB = getFunctionOrder(jobB);
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // Si même ordre de fonction, trier par nom alphabétique
    return a.localeCompare(b, 'fr', { sensitivity: 'base' });
  });
};

const getJobTitleForName = (name: string, groupData: GroupData): string => {
  for (const group in groupData) {
    if (groupData[group][name]) {
      return groupData[group][name];
    }
  }
  return '';
};

export const sortPersonsByFunction = (persons: Person[], groupData: GroupData): Person[] => {
  return [...persons].sort((a, b) => {
    const jobA = getJobTitleForName(a.name, groupData);
    const jobB = getJobTitleForName(b.name, groupData);
    
    const orderA = getFunctionOrder(jobA);
    const orderB = getFunctionOrder(jobB);
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // Si même ordre de fonction, trier par nom alphabétique
    return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
  });
};
