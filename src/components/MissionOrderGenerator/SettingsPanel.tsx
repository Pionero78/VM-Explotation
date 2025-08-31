import React from "react";
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

import { Button } from "@/components/ui/button";
import { RotateCcw, Upload } from "lucide-react";
import { MissionOrderSettings } from "@/types";
import CalibrationPresets from "./CalibrationPresets";
import CustomPresetSlots from "./CustomPresetSlots";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { toast } from "sonner";

const SettingsPanel: React.FC = () => {
  try {
    const { settings, updateSettings } = useMissionOrder();

    if (!settings) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p>Chargement des paramètres...</p>
            </div>
          </CardContent>
        </Card>
      );
    }

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

    const [showImportDialog, setShowImportDialog] = React.useState(false);
    const [importedConfig, setImportedConfig] = React.useState<any>(null);
    const [selectedSlot, setSelectedSlot] = React.useState<number>(1);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImportFromExternal = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith(".json")) {
        toast.error("Veuillez sélectionner un fichier .json");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const config = JSON.parse(content);

          if (!config.settings || typeof config.settings !== "object") {
            toast.error("Format de fichier invalide");
            return;
          }

          setImportedConfig(config);
          setShowImportDialog(true);
        } catch (error) {
          console.error("Error parsing imported file:", error);
          toast.error("Erreur lors de la lecture du fichier");
        }
      };
      reader.readAsText(file);

      // Reset file input
      if (event.target) {
        event.target.value = "";
      }
    };

    const confirmImport = () => {
      if (!importedConfig) return;

      const slotKey = `preset_slot_${selectedSlot}`;
      const presetData = {
        settings: importedConfig.settings,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(slotKey, JSON.stringify(presetData));
      toast.success(
        `Configuration importée dans l'Emplacement ${selectedSlot}`,
      );

      setShowImportDialog(false);
      setImportedConfig(null);
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
                        <SelectItem value="Corbel, sans-serif">
                          Corbel
                        </SelectItem>
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
                    <Label htmlFor="nom-top">
                      Position verticale Nom (mm) :
                    </Label>
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
                      onChange={(e) =>
                        handleInputChange("signatairePosLeft", e)
                      }
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
                        <SelectItem value="Corbel, sans-serif">
                          Corbel
                        </SelectItem>
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
                      handleCheckboxChange(
                        "listBoldEnabled",
                        checked as boolean,
                      )
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
                    <Label htmlFor="list-margin-left">
                      Marge gauche (mm) :
                    </Label>
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
                        <SelectItem value="Corbel, sans-serif">
                          Corbel
                        </SelectItem>
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
                  <Input
                    id="form-horizontal-spacing"
                    type="number"
                    min="5"
                    max="50"
                    value={settings.formHorizontalSpacing}
                    onChange={(e) =>
                      handleInputChange("formHorizontalSpacing", e)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="form-vertical-spacing">
                    Espacement vertical entre lignes (px) :
                  </Label>
                  <Input
                    id="form-vertical-spacing"
                    type="number"
                    min="2"
                    max="20"
                    value={settings.formVerticalSpacing || 8}
                    onChange={(e) =>
                      handleInputChange("formVerticalSpacing", e)
                    }
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="form-bold"
                    checked={settings.formBoldEnabled}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "formBoldEnabled",
                        checked as boolean,
                      )
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
                    <Input
                      id="interface-section-header-height"
                      type="number"
                      min="20"
                      max="60"
                      value={settings.interfaceSectionHeaderHeight || 32}
                      onChange={(e) =>
                        handleInputChange("interfaceSectionHeaderHeight", e)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="interface-section-title-size">
                      Taille police titre bandeau (px) :
                    </Label>
                    <Input
                      id="interface-section-title-size"
                      type="number"
                      min="10"
                      max="20"
                      value={settings.interfaceSectionTitleSize || 14}
                      onChange={(e) =>
                        handleInputChange("interfaceSectionTitleSize", e)
                      }
                      className="mt-1"
                    />
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
                    <Input
                      id="interface-row-spacing"
                      type="number"
                      min="2"
                      max="20"
                      value={settings.interfaceRowSpacing || 6}
                      onChange={(e) =>
                        handleInputChange("interfaceRowSpacing", e)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="interface-column-gap">
                      Espacement entre colonnes (px) :
                    </Label>
                    <Input
                      id="interface-column-gap"
                      type="number"
                      min="10"
                      max="50"
                      value={settings.interfaceColumnGap || 24}
                      onChange={(e) =>
                        handleInputChange("interfaceColumnGap", e)
                      }
                      className="mt-1"
                    />
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
                        <SelectItem value="Corbel, sans-serif">
                          Corbel
                        </SelectItem>
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
              <CustomPresetSlots />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error("Error in SettingsPanel:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Paramètres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Une erreur s'est produite lors du chargement des paramètres.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Recharger la page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
};

export default SettingsPanel;
