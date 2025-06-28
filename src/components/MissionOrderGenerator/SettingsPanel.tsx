import { useMissionOrder } from "@/context/MissionOrderContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw } from "lucide-react";
import { MissionOrderSettings } from "@/types";
import CalibrationPresets from "./CalibrationPresets";
import CustomPresetSlots from "./CustomPresetSlots";

import { toast } from "sonner";
import * as XLSX from "xlsx";

const SettingsPanel: React.FC = () => {
  const {
    settings,
    updateSettings,
    getSortedSelectedNames,
    getCurrentGroupData,
  } = useMissionOrder();

  const handleInputChange = (
    key: keyof MissionOrderSettings,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    updateSettings(
      key,
      e.target.type === "number" ? Number(e.target.value) : e.target.value,
    );
  };

  const handleSelectChange = (
    key: keyof MissionOrderSettings,
    value: string,
  ) => {
    updateSettings(key, value);
  };

  const handleCheckboxChange = (
    key: keyof MissionOrderSettings,
    checked: boolean,
  ) => {
    updateSettings(key, checked);
  };

  const handleSliderChange = (
    key: keyof MissionOrderSettings,
    value: number[],
  ) => {
    updateSettings(key, value[0]);
  };

  const resetListSettings = () => {
    // Reset list-specific settings to defaults
    updateSettings("listFontFamily", "Arial, sans-serif");
    updateSettings("listFontSize", 12);
    updateSettings("listMarginTop", 20);
    updateSettings("listMarginLeft", 20);
    updateSettings("listLineSpacing", 2);
    updateSettings("listBoldEnabled", false);
    updateSettings("listSectionHeaderHeight", 32);
    updateSettings("listSectionTitleSize", 14);
    updateSettings("listRowSpacing", 6);
    updateSettings("listColumnGap", 24);

    toast.success("Paramètres de liste réinitialisés aux valeurs par défaut");
  };

  const resetInterfaceSettings = () => {
    // Reset interface-specific settings to defaults
    updateSettings("interfaceSectionHeaderHeight", 32);
    updateSettings("interfaceSectionTitleSize", 14);
    updateSettings("interfaceRowSpacing", 6);
    updateSettings("interfaceColumnGap", 24);

    toast.success(
      "Paramètres d'interface réinitialisés aux valeurs par défaut",
    );
  };

  const exportTechnicianListToExcel = () => {
    const sortedSelectedNames = getSortedSelectedNames();
    const currentGroupData = getCurrentGroupData();

    if (sortedSelectedNames.length === 0) {
      toast.error("Aucun technicien sélectionné à exporter");
      return;
    }

    // Helper function to get employment for a name
    const getEmploymentForName = (name: string): string => {
      for (const [groupName, members] of Object.entries(currentGroupData)) {
        if (members[name]) {
          return members[name];
        }
      }
      return "";
    };

    // Parse full name into lastName and firstName
    const parseFullName = (fullName: string) => {
      const parts = fullName.trim().split(" ");
      if (parts.length >= 2) {
        const lastName = parts[0].toUpperCase();
        const firstName = parts.slice(1).join(" ").toUpperCase();
        return { lastName, firstName };
      }
      return { lastName: fullName.toUpperCase(), firstName: "" };
    };

    // Group technicians by category
    const eclairageGroups = ["G6", "G7", "G10", "G11", "G12"];
    const transmissionGroups = ["FH"];
    const chauffeurGroups = ["Chauffeurs"];
    const tdaGroups = ["TDA"];
    const fixeGroups = ["Fixe"];
    const autresGroups = ["Autres"];
    const machinistesGroups = ["Machinistes"];

    const regularNames = sortedSelectedNames.filter(
      (item) =>
        !eclairageGroups.includes(item.group) &&
        !transmissionGroups.includes(item.group) &&
        !chauffeurGroups.includes(item.group) &&
        !tdaGroups.includes(item.group) &&
        !fixeGroups.includes(item.group) &&
        !autresGroups.includes(item.group) &&
        !machinistesGroups.includes(item.group),
    );

    const eclairageNames = sortedSelectedNames.filter((item) =>
      eclairageGroups.includes(item.group),
    );
    const transmissionNames = sortedSelectedNames.filter((item) =>
      transmissionGroups.includes(item.group),
    );
    const chauffeurNames = sortedSelectedNames.filter((item) =>
      chauffeurGroups.includes(item.group),
    );
    const tdaNames = sortedSelectedNames.filter((item) =>
      tdaGroups.includes(item.group),
    );
    const fixeNames = sortedSelectedNames.filter((item) =>
      fixeGroups.includes(item.group),
    );
    const autresNames = sortedSelectedNames.filter((item) =>
      autresGroups.includes(item.group),
    );
    const machinistesNames = sortedSelectedNames.filter((item) =>
      machinistesGroups.includes(item.group),
    );

    // Build Excel data
    const excelData: any[] = [];
    let currentIndex = 1;

    // Add regular names first
    regularNames.forEach((item) => {
      const { lastName, firstName } = parseFullName(item.name);
      const employment = getEmploymentForName(item.name);
      excelData.push({
        "N°": currentIndex++,
        NOM: lastName,
        PRÉNOM: firstName,
        FONCTION: employment.toUpperCase(),
      });
    });

    // Helper function to add section with header
    const addSection = (sectionTitle: string, names: any[]) => {
      if (names.length > 0) {
        // Add section header
        excelData.push({
          "N°": "",
          NOM: sectionTitle,
          PRÉNOM: "",
          FONCTION: "",
        });

        names.forEach((item) => {
          const { lastName, firstName } = parseFullName(item.name);
          const employment = getEmploymentForName(item.name);
          excelData.push({
            "N°": currentIndex++,
            NOM: lastName,
            PRÉNOM: firstName,
            FONCTION: employment.toUpperCase(),
          });
        });
      }
    };

    // Add all sections
    addSection("ÉCLAIRAGE", eclairageNames);
    addSection("TRANSMISSION", transmissionNames);
    addSection("CHAUFFEURS", chauffeurNames);
    addSection("TDA", tdaNames);
    addSection("FIXE", fixeNames);
    addSection("AUTRES", autresNames);
    addSection("MACHINISTES", machinistesNames);

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Style the section headers (make them bold and centered)
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let row = range.s.r; row <= range.e.r; row++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: 1 }); // Column B (NOM)
      const cell = worksheet[cellRef];
      if (
        cell &&
        cell.v &&
        typeof cell.v === "string" &&
        [
          "ÉCLAIRAGE",
          "TRANSMISSION",
          "CHAUFFEURS",
          "TDA",
          "FIXE",
          "AUTRES",
          "MACHINISTES",
        ].includes(cell.v)
      ) {
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center" },
          fill: { fgColor: { rgb: "000000" } },
        };
      }
    }

    // Set column widths
    worksheet["!cols"] = [
      { width: 5 }, // N°
      { width: 20 }, // NOM
      { width: 20 }, // PRÉNOM
      { width: 25 }, // FONCTION
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Liste Techniciens");

    // Generate filename with current date
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const filename = `liste_techniciens_${dateStr}.xlsx`;

    // Write and download file
    XLSX.writeFile(workbook, filename);

    toast.success(`Liste exportée vers ${filename}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="om" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="om">Ordre de Mission</TabsTrigger>
            <TabsTrigger value="list">Liste</TabsTrigger>
            <TabsTrigger value="ui">Interface</TabsTrigger>
            <TabsTrigger value="preselection">Préselection</TabsTrigger>
          </TabsList>

          <TabsContent value="om" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="font-family">Police (OM) :</Label>
                  <Select
                    value={settings.fontFamily}
                    onValueChange={(value) =>
                      handleSelectChange("fontFamily", value)
                    }
                  >
                    <SelectTrigger className="mt-1" id="font-family">
                      <SelectValue placeholder="Sélectionner une police" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="'Times New Roman', Times, serif">
                        Times New Roman
                      </SelectItem>
                      <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                      <SelectItem value="Verdana, sans-serif">
                        Verdana
                      </SelectItem>
                      <SelectItem value="Corbel, sans-serif">Corbel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="font-size">Taille (pt) :</Label>
                  <Input
                    id="font-size"
                    type="number"
                    min="8"
                    max="22"
                    value={settings.fontSize}
                    onChange={(e) => handleInputChange("fontSize", e)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="om-bold"
                  checked={settings.omBoldEnabled}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("omBoldEnabled", checked as boolean)
                  }
                />
                <Label htmlFor="om-bold">
                  Activer le style gras à l'impression (OM)
                </Label>
              </div>

              <h3 className="text-lg font-semibold mt-4">
                Outils de calibration (OM)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom-top">Position verticale Nom (mm) :</Label>
                  <Input
                    id="nom-top"
                    type="number"
                    min="0"
                    max="270"
                    value={settings.nomTop}
                    onChange={(e) => handleInputChange("nomTop", e)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="nom-left">
                    Position horizontale Nom (mm) :
                  </Label>
                  <Input
                    id="nom-left"
                    type="number"
                    min="0"
                    max="210"
                    value={settings.nomLeft}
                    onChange={(e) => handleInputChange("nomLeft", e)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="field-spacing">
                  Espacement vertical (mm) :
                </Label>
                <Input
                  id="field-spacing"
                  type="number"
                  min="5"
                  max="50"
                  value={settings.fieldSpacing}
                  onChange={(e) => handleInputChange("fieldSpacing", e)}
                  className="mt-1"
                />
              </div>

              <h3 className="text-lg font-semibold mt-4">
                Calibrage Signataire
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signataire-top">
                    Position verticale Signataire (mm) :
                  </Label>
                  <Input
                    id="signataire-top"
                    type="number"
                    min="0"
                    max="270"
                    value={settings.signatairePosTop}
                    onChange={(e) => handleInputChange("signatairePosTop", e)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="signataire-left">
                    Position horizontale Signataire (mm) :
                  </Label>
                  <Input
                    id="signataire-left"
                    type="number"
                    min="0"
                    max="210"
                    value={settings.signatairePosLeft}
                    onChange={(e) => handleInputChange("signatairePosLeft", e)}
                    className="mt-1"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold mt-4">Calibrage Date</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date-pos-top">
                    Position verticale Date Signature (mm) :
                  </Label>
                  <Input
                    id="date-pos-top"
                    type="number"
                    min="0"
                    max="270"
                    value={settings.datePosTop}
                    onChange={(e) => handleInputChange("datePosTop", e)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="date-pos-left">
                    Position horizontale Date Signature (mm) :
                  </Label>
                  <Input
                    id="date-pos-left"
                    type="number"
                    min="0"
                    max="210"
                    value={settings.datePosLeft}
                    onChange={(e) => handleInputChange("datePosLeft", e)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Paramètres généraux de la liste
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetListSettings}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="list-font-family">Police (Liste) :</Label>
                  <Select
                    value={settings.listFontFamily}
                    onValueChange={(value) =>
                      handleSelectChange("listFontFamily", value)
                    }
                  >
                    <SelectTrigger className="mt-1" id="list-font-family">
                      <SelectValue placeholder="Sélectionner une police" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                      <SelectItem value="'Times New Roman', Times, serif">
                        Times New Roman
                      </SelectItem>
                      <SelectItem value="Verdana, sans-serif">
                        Verdana
                      </SelectItem>
                      <SelectItem value="Corbel, sans-serif">Corbel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="list-font-size">Taille (pt) :</Label>
                  <Input
                    id="list-font-size"
                    type="number"
                    min="8"
                    max="22"
                    value={settings.listFontSize}
                    onChange={(e) => handleInputChange("listFontSize", e)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="list-bold"
                  checked={settings.listBoldEnabled}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("listBoldEnabled", checked as boolean)
                  }
                />
                <Label htmlFor="list-bold">
                  Activer le style gras à l'impression (Liste)
                </Label>
              </div>

              <h3 className="text-lg font-semibold mt-6">
                📏 Bandeaux de section (Liste imprimable uniquement)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="print-section-header-height">
                    Header height (5–60 px) :
                  </Label>
                  <Input
                    id="print-section-header-height"
                    type="number"
                    min="5"
                    max="60"
                    value={settings.listSectionHeaderHeight || 32}
                    onChange={(e) =>
                      handleInputChange("listSectionHeaderHeight", e)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="print-section-title-size">
                    Taille police titre bandeau (px) :
                  </Label>
                  <Input
                    id="print-section-title-size"
                    type="number"
                    min="10"
                    max="20"
                    value={settings.listSectionTitleSize || 14}
                    onChange={(e) =>
                      handleInputChange("listSectionTitleSize", e)
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold mt-6">
                📐 Espacement précis (Liste imprimable)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="print-row-spacing">
                    Espacement entre lignes (px) :
                  </Label>
                  <Input
                    id="print-row-spacing"
                    type="number"
                    min="2"
                    max="20"
                    value={settings.listRowSpacing || 6}
                    onChange={(e) => handleInputChange("listRowSpacing", e)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="print-column-gap">
                    Espacement entre colonnes (px) :
                  </Label>
                  <Input
                    id="print-column-gap"
                    type="number"
                    min="10"
                    max="50"
                    value={settings.listColumnGap || 24}
                    onChange={(e) => handleInputChange("listColumnGap", e)}
                    className="mt-1"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold mt-6">
                Outils de calibration (Liste)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="list-title-vertical">
                    Espacement titre → ÉVÉNEMENT (px) :
                  </Label>
                  <Input
                    id="list-title-vertical"
                    type="number"
                    min="0"
                    max="50"
                    value={settings.listTitleVerticalPosition || 20}
                    onChange={(e) =>
                      handleInputChange("listTitleVerticalPosition", e)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="list-margin-top">
                    Marge supérieure (mm) :
                  </Label>
                  <Input
                    id="list-margin-top"
                    type="number"
                    min="0"
                    max="50"
                    value={settings.listMarginTop}
                    onChange={(e) => handleInputChange("listMarginTop", e)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                  <Label htmlFor="list-margin-left">Marge gauche (mm) :</Label>
                  <Input
                    id="list-margin-left"
                    type="number"
                    min="0"
                    max="50"
                    value={settings.listMarginLeft}
                    onChange={(e) => handleInputChange("listMarginLeft", e)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ui" className="space-y-4">
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">
                Paramètres du formulaire
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="form-font-family">Police :</Label>
                  <Select
                    value={settings.formFontFamily}
                    onValueChange={(value) =>
                      handleSelectChange("formFontFamily", value)
                    }
                  >
                    <SelectTrigger className="mt-1" id="form-font-family">
                      <SelectValue placeholder="Sélectionner une police" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                      <SelectItem value="'Times New Roman', Times, serif">
                        Times New Roman
                      </SelectItem>
                      <SelectItem value="Verdana, sans-serif">
                        Verdana
                      </SelectItem>
                      <SelectItem value="Corbel, sans-serif">Corbel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="form-font-size">Taille (px) :</Label>
                  <Input
                    id="form-font-size"
                    type="number"
                    min="10"
                    max="24"
                    value={settings.formFontSize}
                    onChange={(e) => handleInputChange("formFontSize", e)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="form-horizontal-spacing">
                  Espacement horizontal entre colonnes (px) :
                </Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[settings.formHorizontalSpacing]}
                    onValueChange={(value) =>
                      handleSliderChange("formHorizontalSpacing", value)
                    }
                    max={50}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 text-center">
                    {settings.formHorizontalSpacing}px
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="form-vertical-spacing">
                  Espacement vertical entre lignes (px) :
                </Label>
                <div className="mt-2 space-y-2">
                  <Slider
                    value={[settings.formVerticalSpacing || 8]}
                    onValueChange={(value) =>
                      handleSliderChange("formVerticalSpacing", value)
                    }
                    max={20}
                    min={2}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 text-center">
                    {settings.formVerticalSpacing || 8}px
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="form-bold"
                  checked={settings.formBoldEnabled}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("formBoldEnabled", checked as boolean)
                  }
                />
                <Label htmlFor="form-bold">
                  Activer le style gras (Interface)
                </Label>
              </div>

              <h3 className="text-lg font-semibold mt-6">
                📏 Bandeaux de section (Interface uniquement)
              </h3>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Contrôles pour l'affichage en temps réel uniquement
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetInterfaceSettings}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interface-section-header-height">
                    Hauteur du bandeau noir (px) :
                  </Label>
                  <div className="mt-2 space-y-2">
                    <Slider
                      value={[settings.interfaceSectionHeaderHeight || 32]}
                      onValueChange={(value) =>
                        handleSliderChange(
                          "interfaceSectionHeaderHeight",
                          value,
                        )
                      }
                      max={60}
                      min={20}
                      step={2}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600 text-center">
                      {settings.interfaceSectionHeaderHeight || 32}px
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="interface-section-title-size">
                    Taille police titre bandeau (px) :
                  </Label>
                  <div className="mt-2 space-y-2">
                    <Slider
                      value={[settings.interfaceSectionTitleSize || 14]}
                      onValueChange={(value) =>
                        handleSliderChange("interfaceSectionTitleSize", value)
                      }
                      max={20}
                      min={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600 text-center">
                      {settings.interfaceSectionTitleSize || 14}px
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mt-6">
                📐 Espacement précis (Interface)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interface-row-spacing">
                    Espacement entre lignes (px) :
                  </Label>
                  <div className="mt-2 space-y-2">
                    <Slider
                      value={[settings.interfaceRowSpacing || 6]}
                      onValueChange={(value) =>
                        handleSliderChange("interfaceRowSpacing", value)
                      }
                      max={20}
                      min={2}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600 text-center">
                      {settings.interfaceRowSpacing || 6}px
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="interface-column-gap">
                    Espacement entre colonnes (px) :
                  </Label>
                  <div className="mt-2 space-y-2">
                    <Slider
                      value={[settings.interfaceColumnGap || 24]}
                      onValueChange={(value) =>
                        handleSliderChange("interfaceColumnGap", value)
                      }
                      max={50}
                      min={10}
                      step={2}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600 text-center">
                      {settings.interfaceColumnGap || 24}px
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mt-6">
                Paramètres de l'historique
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="history-font-family">Police :</Label>
                  <Select
                    value={settings.historyFontFamily}
                    onValueChange={(value) =>
                      handleSelectChange("historyFontFamily", value)
                    }
                  >
                    <SelectTrigger className="mt-1" id="history-font-family">
                      <SelectValue placeholder="Sélectionner une police" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                      <SelectItem value="'Times New Roman', Times, serif">
                        Times New Roman
                      </SelectItem>
                      <SelectItem value="Verdana, sans-serif">
                        Verdana
                      </SelectItem>
                      <SelectItem value="Corbel, sans-serif">Corbel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="history-font-size">Taille (px) :</Label>
                  <Input
                    id="history-font-size"
                    type="number"
                    min="10"
                    max="20"
                    value={settings.historyFontSize}
                    onChange={(e) => handleInputChange("historyFontSize", e)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preselection" className="space-y-4">
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">
                Préselection des paramètres
              </h3>
              <p className="text-sm text-gray-600">
                Sauvegardez et chargez vos configurations de calibrage
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((slotId) => {
                  const slotKey = `preset_slot_${slotId}`;
                  const savedPreset = localStorage.getItem(slotKey);
                  const hasData = !!savedPreset;

                  return (
                    <div
                      key={slotId}
                      className="border-2 border-gray-200 hover:border-blue-300 transition-colors rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-800">
                          Emplacement {slotId}
                        </h4>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            hasData ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                      </div>

                      {hasData && (
                        <div className="text-sm text-gray-600 mb-4">
                          <p>
                            <strong>Sauvegardé:</strong>{" "}
                            {(() => {
                              try {
                                const data = JSON.parse(savedPreset);
                                return new Date(
                                  data.timestamp,
                                ).toLocaleDateString();
                              } catch {
                                return "Date inconnue";
                              }
                            })()}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const presetData = {
                              settings: { ...settings },
                              timestamp: new Date().toISOString(),
                            };
                            localStorage.setItem(
                              slotKey,
                              JSON.stringify(presetData),
                            );
                            toast.success(
                              `Configuration sauvegardée dans l'emplacement ${slotId}`,
                            );
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Sauver
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!hasData) {
                              toast.error("Aucune configuration à charger");
                              return;
                            }
                            try {
                              const data = JSON.parse(savedPreset);
                              Object.entries(data.settings).forEach(
                                ([key, value]) => {
                                  updateSettings(
                                    key as keyof MissionOrderSettings,
                                    value as any,
                                  );
                                },
                              );
                              toast.success(
                                `Configuration chargée depuis l'emplacement ${slotId}`,
                              );
                            } catch (error) {
                              toast.error(
                                "Erreur lors du chargement de la configuration",
                              );
                            }
                          }}
                          disabled={!hasData}
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          Charger
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!hasData) {
                              toast.error("Aucune configuration à exporter");
                              return;
                            }
                            const dataStr = savedPreset;
                            const dataBlob = new Blob([dataStr], {
                              type: "application/json",
                            });
                            const url = URL.createObjectURL(dataBlob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = `preset_emplacement_${slotId}.json`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                            toast.success(
                              `Configuration exportée depuis l'emplacement ${slotId}`,
                            );
                          }}
                          disabled={!hasData}
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          Exporter
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            localStorage.removeItem(slotKey);
                            toast.success(`Emplacement ${slotId} vidé`);
                          }}
                          disabled={!hasData}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Vider
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
