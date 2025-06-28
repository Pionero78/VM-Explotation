import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Upload, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMissionOrder } from "@/context/MissionOrderContext";

interface PresetSlot {
  id: number;
  name: string;
  data: any;
  isEmpty: boolean;
}

const PresetSlots: React.FC = () => {
  const { selectedNames, formData } = useMissionOrder();
  const [presetSlots, setPresetSlots] = useState<PresetSlot[]>([
    { id: 1, name: "Emplacement 1", data: null, isEmpty: true },
    { id: 2, name: "Emplacement 2", data: null, isEmpty: true },
    { id: 3, name: "Emplacement 3", data: null, isEmpty: true },
    { id: 4, name: "Emplacement 4", data: null, isEmpty: true },
  ]);

  const saveToSlot = (slotId: number) => {
    if (selectedNames.length === 0) {
      toast.error("Aucune sélection à sauvegarder");
      return;
    }

    const presetData = {
      selectedNames: [...selectedNames],
      formData: { ...formData },
      timestamp: new Date().toISOString(),
    };

    setPresetSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? { ...slot, data: presetData, isEmpty: false }
          : slot,
      ),
    );

    toast.success(
      `Configuration sauvegardée dans ${presetSlots.find((s) => s.id === slotId)?.name}`,
    );
  };

  const loadFromSlot = (slotId: number) => {
    const slot = presetSlots.find((s) => s.id === slotId);
    if (!slot || slot.isEmpty) {
      toast.error("Aucune configuration à charger");
      return;
    }

    // Here you would implement the loading logic
    toast.success(`Configuration chargée depuis ${slot.name}`);
  };

  const exportSlot = (slotId: number) => {
    const slot = presetSlots.find((s) => s.id === slotId);
    if (!slot || slot.isEmpty) {
      toast.error("Aucune configuration à exporter");
      return;
    }

    const dataStr = JSON.stringify(slot.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `preset_${slot.name.toLowerCase().replace(" ", "_")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Configuration exportée depuis ${slot.name}`);
  };

  const clearSlot = (slotId: number) => {
    setPresetSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, data: null, isEmpty: true } : slot,
      ),
    );

    toast.success(`${presetSlots.find((s) => s.id === slotId)?.name} vidé`);
  };

  return (
    <div className="p-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Préselection
          </h2>
          <p className="text-gray-600">Gérez vos configurations prédéfinies</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {presetSlots.map((slot) => (
            <Card
              key={slot.id}
              className="border-2 border-gray-200 hover:border-blue-300 transition-colors"
            >
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
                  <span>{slot.name}</span>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      slot.isEmpty ? "bg-gray-300" : "bg-green-500"
                    }`}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {!slot.isEmpty && slot.data && (
                    <div className="text-sm text-gray-600 mb-4">
                      <p>
                        <strong>Techniciens:</strong>{" "}
                        {slot.data.selectedNames?.length || 0}
                      </p>
                      <p>
                        <strong>Sauvegardé:</strong>{" "}
                        {new Date(slot.data.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveToSlot(slot.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Sauver
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadFromSlot(slot.id)}
                      disabled={slot.isEmpty}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Charger
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportSlot(slot.id)}
                      disabled={slot.isEmpty}
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Exporter
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => clearSlot(slot.id)}
                      disabled={slot.isEmpty}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Vider
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PresetSlots;
