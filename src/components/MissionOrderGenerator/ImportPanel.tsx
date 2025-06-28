import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";
import { Person, GroupType, GroupData } from "@/types";
import { useMissionOrder } from "@/context/MissionOrderContext";
import { Download, Upload, FileSpreadsheet } from "lucide-react";

const ImportPanel: React.FC = () => {
  const { toast } = useToast();
  const {
    clearAllGroupData,
    updateImportedGroupData,
    getCurrentGroupData,
    importedGroupData,
  } = useMissionOrder();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<
    Array<{ name: string; group: string; poste: string }>
  >([]);
  const [importing, setImporting] = useState(false);
  const [importedTechnicians, setImportedTechnicians] = useState<
    Array<{
      lastName: string;
      firstName: string;
      function: string;
      group: string;
    }>
  >([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcel(selectedFile);
    }
  };

  const parseExcel = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);

        // ✅ Extract name, group and poste from Excel data - PRESERVE ORIGINAL ORDER
        const formattedData = parsedData
          .map((row: any) => {
            return {
              name: row["Nom"] || "",
              group: row["Équipe"] || row["Equipe"] || "",
              poste: row["Poste"] || "Poste non spécifié",
            };
          })
          .filter((item) => item.name && item.group);

        // ✅ Do NOT sort - preserve Excel row order
        setPreviewData(formattedData);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast({
          title: "Erreur",
          description:
            "Impossible de lire le fichier Excel. Vérifiez le format.",
          variant: "destructive",
        });
        setPreviewData([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  // 📥 Import global technician list from Excel (preserving original order)
  const importAllTechniciansFromExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const globalList = jsonData
          .map((row: any) => ({
            lastName: (row.NOM || row.Nom || "").toString().toUpperCase(),
            firstName: (row.PRÉNOM || row["Prénom"] || row.Prenom || "")
              .toString()
              .toUpperCase(),
            function: (row.FONCTION || row.Fonction || row.Poste || "")
              .toString()
              .toUpperCase(),
            group: (
              row.ÉQUIPE ||
              row.Equipe ||
              row.Groupe ||
              row.MODALE ||
              ""
            ).toString(),
          }))
          .filter((item) => item.lastName && item.group);

        setImportedTechnicians(globalList);

        toast({
          title: "Liste globale importée",
          description: `${globalList.length} techniciens importés dans l'ordre d'origine.`,
        });

        console.log("Imported global technicians list:", globalList);
      } catch (error) {
        console.error("Error importing global list:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'importer la liste globale.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 📤 Export current full technician list to Excel (preserving original order)
  const exportAllTechniciansToExcel = () => {
    const currentData = getCurrentGroupData();

    if (!currentData || Object.keys(currentData).length === 0) {
      toast({
        title: "Aucune donnée disponible",
        description: "Aucune liste de techniciens disponible à exporter.",
        variant: "destructive",
      });
      return;
    }

    const wb = XLSX.utils.book_new();

    // Build data array with same format as import
    const dataForExcel: any[] = [];
    let rowIndex = 1;

    // Iterate through all groups and technicians in current order
    Object.entries(currentData).forEach(([groupName, members]) => {
      Object.entries(members).forEach(([fullName, employment]) => {
        // Parse full name into parts
        const nameParts = fullName.trim().split(" ");
        let lastName = "";
        let firstName = "";

        if (nameParts.length >= 2) {
          lastName = nameParts[0].toUpperCase();
          firstName = nameParts.slice(1).join(" ").toUpperCase();
        } else {
          lastName = fullName.toUpperCase();
        }

        dataForExcel.push({
          Nom: fullName,
          Équipe: groupName,
          Poste: employment,
        });
        rowIndex++;
      });
    });

    // Create worksheet with the data
    const ws = XLSX.utils.json_to_sheet(dataForExcel);

    // Set column widths for better readability
    ws["!cols"] = [
      { width: 25 }, // Nom
      { width: 15 }, // Équipe
      { width: 30 }, // Poste
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Liste complète");

    // Generate filename with current date
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const filename = `liste_globale_techniciens_${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);

    toast({
      title: "Export réussi",
      description: `Liste globale exportée (${dataForExcel.length} techniciens) vers ${filename}`,
    });
  };

  const handleImport = () => {
    if (previewData.length === 0) {
      toast({
        title: "Aucune donnée",
        description: "Aucune donnée à importer.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);

    try {
      // Créer une nouvelle structure de données vide
      const newGroupData: GroupData = {};

      // ✅ Ajouter chaque personne dans l'ordre d'origine (pas de tri)
      previewData.forEach((item) => {
        const { name, group, poste } = item;

        // Normaliser les noms de groupes pour inclure Autres et Machinistes
        let normalizedGroup = group;
        if (group.toLowerCase().includes("autre")) {
          normalizedGroup = "Autres";
        } else if (group.toLowerCase().includes("machiniste")) {
          normalizedGroup = "Machinistes";
        }

        // S'assurer que le groupe existe dans notre structure de données
        if (!newGroupData[normalizedGroup as GroupType]) {
          newGroupData[normalizedGroup as GroupType] = {};
        }

        // Ajouter la personne au groupe avec son poste
        newGroupData[normalizedGroup as GroupType][name] = poste;
      });

      // Remplacer complètement les données existantes
      updateImportedGroupData(newGroupData);

      toast({
        title: "Importation réussie",
        description: `${previewData.length} techniciens ont été importés avec leurs postes dans l'ordre d'origine.`,
      });

      console.log("New group data with preserved order:", newGroupData);

      // Reset state
      setFile(null);
      setPreviewData([]);
    } catch (error) {
      console.error("Error importing data:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'importation.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteList = () => {
    setPreviewData([]);
    setFile(null);
    setImportedTechnicians([]);
    clearAllGroupData(); // Vide aussi les données des modales
    toast({
      title: "Liste supprimée",
      description:
        "La liste d'aperçu et toutes les données des groupes ont été supprimées.",
    });
  };

  // Calculer les statistiques actuelles basées sur les données courantes
  const getCurrentStats = () => {
    const currentData = getCurrentGroupData();
    const teamCount = Object.keys(currentData).length;
    let totalEmployees = 0;
    const teamCounts: { [key: string]: number } = {};

    Object.entries(currentData).forEach(([team, members]) => {
      const memberCount = Object.keys(members).length;
      teamCounts[team] = memberCount;
      totalEmployees += memberCount;
    });

    return { teamCount, totalEmployees, teamCounts };
  };

  const stats = getCurrentStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Importer des données d'équipes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Mettez à jour les équipes de l'entreprise à partir d'un fichier
            Excel (ordre d'origine préservé)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="excel-import">Fichier Excel</Label>
              <Input
                id="excel-import"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                placeholder="Parcourir... Aucun fichier sélectionné."
              />
            </div>
            <div className="flex flex-col gap-2 min-w-[200px]">
              <Button
                variant="outline"
                size="sm"
                className="bg-green-100 hover:bg-green-200 text-green-700 border-green-300"
              >
                Aperçu
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteList}
              >
                Supprimer liste
              </Button>
              <Button
                size="sm"
                onClick={handleImport}
                disabled={importing || previewData.length === 0}
              >
                {importing ? "Importation..." : "Confirmer l'importation"}
              </Button>
            </div>
          </div>

          {previewData.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">
                Aperçu des données ({previewData.length} techniciens)
              </h3>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Nom
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Équipe
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Poste
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-2 whitespace-nowrap text-sm">
                          {item.name}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm">
                          {item.group}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm">
                          {item.poste}
                        </td>
                      </tr>
                    ))}
                    {previewData.length > 10 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-2 text-sm text-center text-gray-500"
                        >
                          ... et {previewData.length - 10} autre(s)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Liste globale (Import/Export Excel)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Importez et exportez la liste complète des techniciens (ordre
            d'origine préservé)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="global-import">
                📥 Importer la liste globale depuis Excel
              </Label>
              <Input
                id="global-import"
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importAllTechniciansFromExcel(file);
                }}
                className="mt-2"
              />
            </div>
            <div className="flex flex-col justify-end">
              <Button
                onClick={exportAllTechniciansToExcel}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4" />
                📤 Exporter la liste globale au format Excel
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              📋 Export de la liste globale actuelle
            </h4>
            <div className="text-sm text-blue-700">
              <p>
                • Exporte tous les techniciens de la base de données actuelle
              </p>
              <p>• Format Excel compatible pour réimportation</p>
              <p>• Colonnes : Nom, Équipe, Poste</p>
              <p>• Ordre d'origine préservé</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Données actuelles</CardTitle>
          <p className="text-sm text-muted-foreground">
            Aperçu des données actuellement utilisées par l'application
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Nombre d'équipes:</strong> {stats.teamCount}
            </p>
            <p>
              <strong>Nombre d'employés:</strong> {stats.totalEmployees}
            </p>
            <p>
              <strong>Équipes:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              {Object.entries(stats.teamCounts).map(([team, count]) => (
                <li key={team}>
                  {team}: {count} employés
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions pour le format Excel</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Le fichier Excel doit avoir les colonnes: "Nom", "Équipe", "Poste"
            </li>
            <li>
              Les groupes peuvent inclure: HD1, HD2, FH, G6, G7, G10, G11, G12,
              Chauffeurs, TDA, Fixe, Autres, Machinistes
            </li>
            <li>Exemple: TEBRANI MOHAMED, HD1, IXM-CHEF D'ÉMISSION</li>
            <li>
              Les groupes "Autres" et "Machinistes" seront automatiquement
              reconnus
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportPanel;
