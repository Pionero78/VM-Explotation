import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Upload, Download, FileSpreadsheet } from 'lucide-react';
import { useMissionOrder } from '@/context/MissionOrderContext';
import { toast } from 'sonner';
import { getEmploymentForName } from '@/data/groupData';
import { formatDate } from '@/utils/formatDate';
import * as XLSX from 'xlsx';

const ExportImportPanel: React.FC = () => {
  const { 
    selectedNames, 
    formData, 
    setSelectedNames, 
    setFormData, 
    getCurrentGroupData,
    importedGroupData,
    settings
  } = useMissionOrder();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentGroupData = getCurrentGroupData();

  // ✅ NO MORE SORTING - Use original order directly
  const orderedSelectedNames = selectedNames;

  const handleExportList = () => {
    if (selectedNames.length === 0) {
      toast.error("Aucun technicien sélectionné");
      return;
    }

    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      selectedNames: orderedSelectedNames,
      formData,
      metadata: {
        totalTechnicians: selectedNames.length,
        mission: formData.motif || 'Mission non définie'
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    
    const missionName = formData.motif ? formData.motif.replace(/[^a-zA-Z0-9]/g, '_') : 'mission';
    const date = formatDate(new Date().toISOString()).replace(/\//g, '-');
    link.download = `liste_${missionName}_${date}.json`;
    
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Liste exportée (${selectedNames.length} techniciens)`);
  };

  const handleExportExcel = () => {
    if (selectedNames.length === 0) {
      toast.error("Aucun technicien sélectionné");
      return;
    }

    // ✅ Use original order without sorting
    const eclairageGroups = ["G6", "G7", "G8", "G9", "G10", "G11", "G12"];
    const eclairageMembers = orderedSelectedNames.filter(member => eclairageGroups.includes(member.group));
    const otherMembers = orderedSelectedNames.filter(member => !eclairageGroups.includes(member.group));

    // Fonction pour analyser le nom complet
    const parseFullName = (fullName: string) => {
      const parts = fullName.trim().split(' ');
      if (parts.length >= 2) {
        const lastName = parts[0];
        const firstName = parts.slice(1).join(' ');
        return { lastName, firstName };
      }
      return { lastName: fullName, firstName: '' };
    };

    // Créer les données Excel
    const data = [];
    
    // En-tête
    data.push(['LISTE DES TECHNICIENS']);
    data.push([`ÉVÉNEMENT : ${formData.motif || 'ACTIVITÉ OFFICIELLE'}`]);
    data.push([`LIEU : ${formData.destination || 'AÉROPORT D\'ALGER'}`]);
    data.push([`DATE : DU ${formData.dateDepart ? formatDate(formData.dateDepart) : ''} AU ${formData.dateRetour ? formatDate(formData.dateRetour) : ''}`]);
    data.push([]);

    // ✅ ÉCLAIRAGE section for G6-G12
    if (eclairageMembers.length > 0) {
      data.push(['ÉCLAIRAGE']);
      eclairageMembers.forEach(item => {
        const { lastName, firstName } = parseFullName(item.name);
        const employment = getEmploymentForName(item.name, currentGroupData);
        data.push([lastName, firstName, employment]);
      });
      data.push([]);
    }

    // ✅ All other members without section headers
    otherMembers.forEach(item => {
      const { lastName, firstName } = parseFullName(item.name);
      const employment = getEmploymentForName(item.name, currentGroupData);
      data.push([lastName, firstName, employment]);
    });

    // Créer le workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Liste Techniciens');
    
    // Télécharger le fichier
    const missionName = formData.motif ? formData.motif.replace(/[^a-zA-Z0-9]/g, '_') : 'mission';
    const date = formatDate(new Date().toISOString()).replace(/\//g, '-');
    XLSX.writeFile(wb, `liste_techniciens_${missionName}_${date}.xlsx`);
    
    toast.success(`Liste Excel exportée (${selectedNames.length} techniciens)`);
  };

  const handleExportCompleteDatabase = () => {
    if (!importedGroupData || Object.keys(importedGroupData).length === 0) {
      toast.error("Aucune base de données importée");
      return;
    }

    // ✅ Export complete database preserving stored order (no sorting)
    const data = [];
    
    // En-tête
    data.push(['BASE DE DONNÉES COMPLÈTE DES TECHNICIENS']);
    data.push([`Exporté le : ${formatDate(new Date().toISOString())}`]);
    data.push([]);
    data.push(['GROUPE', 'NOM', 'PRÉNOM', 'FONCTION']);

    // ✅ Parcourir tous les groupes et techniciens dans l'ordre stocké
    Object.keys(importedGroupData).forEach(groupId => {
      const groupData = importedGroupData[groupId];
      Object.keys(groupData).forEach(fullName => {
        const parts = fullName.trim().split(' ');
        let lastName, firstName;
        if (parts.length >= 2) {
          lastName = parts[0];
          firstName = parts.slice(1).join(' ');
        } else {
          lastName = fullName;
          firstName = '';
        }
        const employment = groupData[fullName];
        data.push([groupId, lastName, firstName, employment]);
      });
    });

    // Créer le workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Base Complète');
    
    // Télécharger le fichier
    const date = formatDate(new Date().toISOString()).replace(/\//g, '-');
    XLSX.writeFile(wb, `base_complete_techniciens_${date}.xlsx`);
    
    // Compter le total de techniciens
    const totalTechnicians = Object.values(importedGroupData).reduce((total, group) => 
      total + Object.keys(group).length, 0
    );
    
    toast.success(`Base complète exportée (${totalTechnicians} techniciens) dans l'ordre original`);
  };

  const handleImportList = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error("Format de fichier non supporté. Utilisez un fichier JSON.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const importedData = JSON.parse(result);
        
        // Validation de la structure
        if (!importedData.selectedNames || !Array.isArray(importedData.selectedNames)) {
          throw new Error("Structure de données invalide");
        }

        // Importer les données
        setSelectedNames(importedData.selectedNames);
        if (importedData.formData) {
          setFormData(importedData.formData);
        }

        toast.success(
          `Liste importée avec succès (${importedData.selectedNames.length} techniciens)`,
          {
            description: importedData.metadata?.mission || 'Mission importée'
          }
        );
      } catch (error) {
        console.error('Import error:', error);
        toast.error("Erreur lors de l'importation", {
          description: "Le fichier semble corrompu ou incompatible."
        });
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const handlePrintOptimized = () => {
    if (selectedNames.length === 0) {
      toast.error("Aucun technicien sélectionné");
      return;
    }

    // Créer le contenu d'impression optimisé
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Impossible d'ouvrir la fenêtre d'impression");
      return;
    }

    // ✅ Use simple grouping logic
    const getGroupedNamesForPrint = () => {
      const grouped: { [key: string]: any[] } = {};
      
      sortedSelectedNames.forEach((item) => {
        if (!grouped[item.group]) grouped[item.group] = [];
        grouped[item.group].push(item);
      });
      
      return grouped;
    };

    const groupedNames = getGroupedNamesForPrint();

    let tableContent = `
      <tr style="background: #f0f0f0;">
        <td colspan="2" style="padding: 12px; font-weight: bold; font-size: 16px; text-align: center;">
          Liste des techniciens - ${formData.motif || 'Mission'}
        </td>
      </tr>
      <tr style="background: #e0e0e0;">
        <td style="padding: 8px; font-weight: bold;">Lieu</td>
        <td style="padding: 8px; font-weight: bold;">${formData.destination || ''}</td>
      </tr>
      <tr style="background: #e0e0e0;">
        <td style="padding: 8px; font-weight: bold;">Date</td>
        <td style="padding: 8px; font-weight: bold;">
          ${formData.dateDepart ? formatDate(formData.dateDepart) : ''} - 
          ${formData.dateRetour ? formatDate(formData.dateRetour) : ''}
        </td>
      </tr>
    `;

    let globalRowIndex = 0;

    // ✅ Simple group iteration for print
    Object.entries(groupedNames).forEach(([groupName, members]) => {
      if (members.length > 0) {
        tableContent += `
          <tr style="background: #333; color: white;">
            <td colspan="2" style="padding: 8px; font-weight: bold; text-align: center;">${groupName}</td>
          </tr>
        `;
        members.forEach(item => {
          const rowBg = settings.alternateRowColors && globalRowIndex % 2 === 1 ? '#f8f9fa' : '#ffffff';
          tableContent += `
            <tr style="background: ${rowBg};">
              <td style="padding: 6px; border: 1px solid #333; font-weight: bold; font-style: italic;">
                ${item.name}
              </td>
              <td style="padding: 6px; border: 1px solid #333; font-weight: bold; font-style: italic;">
                ${getEmploymentForName(item.name, currentGroupData)}
              </td>
            </tr>
          `;
          globalRowIndex++;
        });
      }
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Liste Techniciens - ${formData.motif || 'Mission'}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            td {
              border: 1px solid #333;
              vertical-align: top;
            }
            .signature {
              text-align: right;
              margin-top: 30px;
              font-weight: bold;
              font-style: italic;
            }
            @media print {
              body { margin: 0; }
              .signature { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <table>
            ${tableContent}
          </table>
          <div class="signature">
            CHEF DU DÉPARTEMENT
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export / Import des listes</CardTitle>
        <CardDescription>
          Sauvegardez et partagez vos listes de techniciens (ordre d'origine préservé)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={handleExportList}
            disabled={selectedNames.length === 0}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Exporter Liste JSON
          </Button>
          
          <Button 
            onClick={handleExportExcel}
            disabled={selectedNames.length === 0}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exporter Excel
          </Button>
          
          <Button 
            onClick={handleExportCompleteDatabase}
            disabled={!importedGroupData || Object.keys(importedGroupData).length === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exporter la liste complète
          </Button>
          
          <Button 
            onClick={handleImportList}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Importer Liste
          </Button>
        </div>
        
        <Button 
          onClick={handlePrintOptimized}
          disabled={selectedNames.length === 0}
          variant="secondary"
          className="w-full flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Impression A4
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        {selectedNames.length > 0 && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <strong>{selectedNames.length} technicien(s) sélectionné(s)</strong>
            {formData.motif && (
              <div>Mission: {formData.motif}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExportImportPanel;
