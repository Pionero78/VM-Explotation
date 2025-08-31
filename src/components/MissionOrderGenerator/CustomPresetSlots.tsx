import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Save, Zap, Edit3, Check, X } from "lucide-react";
import { useMissionOrder } from "@/context/MissionOrderContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PresetSlot {
  id: number;
  name: string;
  data: any;
  timestamp?: string;
}

const CustomPresetSlots: React.FC = () => {
  const {
    settings,
    selectedNames,
    formData,
    setSettings,
    setSelectedNames,
    setFormData,
  } = useMissionOrder();
  const [presetSlots, setPresetSlots] = useState<PresetSlot[]>(() => {
    const saved = localStorage.getItem("customPresetSlots");
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, name: "Config 01", data: null },
          { id: 2, name: "Config 02", data: null },
          { id: 3, name: "Config 03", data: null },
          { id: 4, name: "Config 04", data: null },
        ];
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    localStorage.setItem("customPresetSlots", JSON.stringify(presetSlots));
  }, [presetSlots]);

  const handleSavePreset = (slotId: number) => {
    const currentConfig = {
      settings,
      selectedNames,
      formData,
      timestamp: new Date().toISOString(),
    };

    setPresetSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? { ...slot, data: currentConfig, timestamp: currentConfig.timestamp }
          : slot,
      ),
    );

    const slotName = presetSlots.find((s) => s.id === slotId)?.name;
    toast.success(`Configuration sauvegardée dans "${slotName}"`);
  };

  const handleApplyPreset = (slotId: number) => {
    const slot = presetSlots.find((s) => s.id === slotId);
    if (slot?.data) {
      // Charger les données dans le contexte
      if (slot.data.settings) setSettings(slot.data.settings);
      if (slot.data.selectedNames) setSelectedNames(slot.data.selectedNames);
      if (slot.data.formData) setFormData(slot.data.formData);

      toast.success(`Configuration "${slot.name}" appliquée`);
    } else {
      toast.error("Aucune configuration sauvegardée");
    }
  };

  const handleImportPreset = (
    slotId: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.settings || imported.selectedNames || imported.formData) {
          const importedConfig = {
            ...imported,
            timestamp: new Date().toISOString(),
          };

          setPresetSlots((prev) =>
            prev.map((slot) =>
              slot.id === slotId
                ? {
                    ...slot,
                    data: importedConfig,
                    timestamp: importedConfig.timestamp,
                  }
                : slot,
            ),
          );

          const slotName = presetSlots.find((s) => s.id === slotId)?.name;
          toast.success(`Configuration importée dans "${slotName}"`);
        } else {
          toast.error("Format de fichier invalide");
        }
      } catch (error) {
        toast.error("Erreur lors de l'importation");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleExportPreset = (slotId: number) => {
    const slot = presetSlots.find((s) => s.id === slotId);
    if (slot?.data) {
      const dataStr = JSON.stringify(slot.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `preset_${slot.name.replace(/\s+/g, "_")}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`"${slot.name}" exporté`);
    } else {
      toast.error("Aucune configuration à exporter");
    }
  };

  const handleClearPreset = (slotId: number) => {
    setPresetSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? { ...slot, data: null, timestamp: undefined }
          : slot,
      ),
    );

    const slotName = presetSlots.find((s) => s.id === slotId)?.name;
    toast.success(`"${slotName}" vidé`);
  };

  const handleStartEdit = (slotId: number) => {
    const slot = presetSlots.find((s) => s.id === slotId);
    if (slot) {
      setEditingId(slotId);
      setEditName(slot.name);
    }
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      setPresetSlots((prev) =>
        prev.map((slot) =>
          slot.id === editingId ? { ...slot, name: editName.trim() } : slot,
        ),
      );
      setEditingId(null);
      setEditName("");
      toast.success("Nom mis à jour");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  return (
    <div className="space-y-6 bg-white">
      <h3 className="text-xl font-bold text-gray-800">
        Configurations Prédéfinies
      </h3>

      {/* Grille 2x2 responsive pour les 4 configurations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {presetSlots.map((slot) => (
          <Card
            key={slot.id}
            className="relative overflow-hidden border-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="flex items-center justify-between">
                {editingId === slot.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 h-8 border-2"
                      placeholder="Nom de la configuration"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-800">
                        {slot.name}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          slot.data
                            ? "bg-green-500 border-green-600 shadow-lg"
                            : "bg-red-500 border-red-600 shadow-lg"
                        }`}
                      ></div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(slot.id)}
                      className="h-8 w-8 p-0 hover:bg-gray-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </CardTitle>
              {slot.timestamp && (
                <p className="text-sm text-gray-600 font-medium">
                  Modifié: {new Date(slot.timestamp).toLocaleString("fr-FR")}
                </p>
              )}
            </CardHeader>

            <CardContent className="p-6">
              <div className="flex flex-col gap-3">
                {/* Bouton Importer - Vert avec icône dossier */}
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => handleImportPreset(slot.id, e)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id={`import-${slot.id}`}
                  />
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                    onClick={() =>
                      document.getElementById(`import-${slot.id}`)?.click()
                    }
                  >
                    <FolderOpen className="h-5 w-5" />
                    Importer
                  </Button>
                </div>

                {/* Bouton Exporter - Bleu avec icône disquette */}
                <Button
                  onClick={() => handleExportPreset(slot.id)}
                  disabled={!slot.data}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  Exporter
                </Button>

                {/* Bouton Appliquer - Orange avec icône éclair */}
                <Button
                  onClick={() => handleApplyPreset(slot.id)}
                  disabled={!slot.data}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Zap className="h-5 w-5" />
                  Appliquer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomPresetSlots;
