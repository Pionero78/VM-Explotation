
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Upload, Download, Trash2, Edit3, Check, X } from 'lucide-react';
import { useMissionOrder } from '@/context/MissionOrderContext';
import { toast } from 'sonner';
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
  const { settings, selectedNames, formData, setSettings, setSelectedNames, setFormData } = useMissionOrder();
  const [presetSlots, setPresetSlots] = useState<PresetSlot[]>(() => {
    const saved = localStorage.getItem('customPresetSlots');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Emplacement 1', data: null },
      { id: 2, name: 'Emplacement 2', data: null },
      { id: 3, name: 'Emplacement 3', data: null },
      { id: 4, name: 'Emplacement 4', data: null }
    ];
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    localStorage.setItem('customPresetSlots', JSON.stringify(presetSlots));
  }, [presetSlots]);

  const handleSavePreset = (slotId: number) => {
    const currentConfig = {
      settings,
      selectedNames,
      formData,
      timestamp: new Date().toISOString()
    };

    setPresetSlots(prev => prev.map(slot =>
      slot.id === slotId 
        ? { ...slot, data: currentConfig, timestamp: currentConfig.timestamp }
        : slot
    ));

    const slotName = presetSlots.find(s => s.id === slotId)?.name;
    toast.success(`Configuration sauvegardée dans "${slotName}"`);
  };

  const handleLoadPreset = (slotId: number) => {
    const slot = presetSlots.find(s => s.id === slotId);
    if (slot?.data) {
      // Charger les données dans le contexte
      if (slot.data.settings) setSettings(slot.data.settings);
      if (slot.data.selectedNames) setSelectedNames(slot.data.selectedNames);
      if (slot.data.formData) setFormData(slot.data.formData);
      
      toast.success(`Configuration "${slot.name}" chargée`);
    } else {
      toast.error('Aucune configuration sauvegardée');
    }
  };

  const handleExportPreset = (slotId: number) => {
    const slot = presetSlots.find(s => s.id === slotId);
    if (slot?.data) {
      const dataStr = JSON.stringify(slot.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `preset_${slot.name.replace(/\s+/g, '_')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`"${slot.name}" exporté`);
    } else {
      toast.error('Aucune configuration à exporter');
    }
  };

  const handleClearPreset = (slotId: number) => {
    setPresetSlots(prev => prev.map(slot =>
      slot.id === slotId 
        ? { ...slot, data: null, timestamp: undefined }
        : slot
    ));
    
    const slotName = presetSlots.find(s => s.id === slotId)?.name;
    toast.success(`"${slotName}" vidé`);
  };

  const handleStartEdit = (slotId: number) => {
    const slot = presetSlots.find(s => s.id === slotId);
    if (slot) {
      setEditingId(slotId);
      setEditName(slot.name);
    }
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      setPresetSlots(prev => prev.map(slot =>
        slot.id === editingId 
          ? { ...slot, name: editName.trim() }
          : slot
      ));
      setEditingId(null);
      setEditName('');
      toast.success('Nom mis à jour');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Emplacements de présélections</h3>
      {/* Grille 2x2 pour les 4 emplacements */}
      <div className="grid grid-cols-2 gap-4">
        {presetSlots.map((slot) => (
          <Card key={slot.id} className={`relative transition-all ${
            slot.data ? 'border-green-200 bg-green-50' : 'border-gray-200'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                {editingId === slot.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 h-8"
                      placeholder="Nom de l'emplacement"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                    />
                    <Button size="sm" onClick={handleSaveEdit} className="h-6 w-6 p-0">
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-6 w-6 p-0">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="flex items-center gap-2">
                      {slot.name}
                      {slot.data && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(slot.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </CardTitle>
              {slot.timestamp && (
                <p className="text-xs text-gray-500">
                  {new Date(slot.timestamp).toLocaleString('fr-FR')}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSavePreset(slot.id)}
                  className="text-xs"
                >
                  <Save className="h-3 w-3 mr-1" />
                  Sauver
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLoadPreset(slot.id)}
                  disabled={!slot.data}
                  className="text-xs"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Charger
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleExportPreset(slot.id)}
                  disabled={!slot.data}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={!slot.data}
                      className="text-xs"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Vider
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Vider l'emplacement</AlertDialogTitle>
                      <AlertDialogDescription>
                        Voulez-vous vraiment vider "{slot.name}" ?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleClearPreset(slot.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Vider
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomPresetSlots;
