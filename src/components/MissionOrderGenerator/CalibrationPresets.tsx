import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/ResizableMovableDialog';
import { useMissionOrder } from '@/context/MissionOrderContext';
import { CalibrationConfig } from '@/types';
import { Save, Upload, Trash2, Edit, Download, FileUp } from 'lucide-react';
import { toast } from 'sonner';

const CalibrationPresets: React.FC = () => {
  const { settings, updateSettings } = useMissionOrder();
  const [newConfigName, setNewConfigName] = useState('');
  const [newConfigDescription, setNewConfigDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<CalibrationConfig | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isDataReady, setIsDataReady] = useState(false);

  // Fonction de validation stricte
  const isValidConfig = (config: any): config is CalibrationConfig => {
    return config && 
           typeof config === 'object' &&
           config.id && 
           typeof config.id === 'string' && 
           config.id.trim().length > 0 &&
           config.name &&
           typeof config.name === 'string' &&
           config.name.trim().length > 0 &&
           config.description &&
           typeof config.description === 'string' &&
           config.settings &&
           typeof config.settings === 'object';
  };

  // Nettoyer et valider les configurations au montage du composant
  useEffect(() => {
    console.log('Nettoyage des configurations...');
    
    const validConfigs = settings.savedConfigs.filter((config, index) => {
      const isValid = isValidConfig(config);
      if (!isValid) {
        console.log(`Configuration ${index} invalide:`, config);
      }
      return isValid;
    });

    console.log('Configurations valides trouvées:', validConfigs.length);

    if (validConfigs.length !== settings.savedConfigs.length || validConfigs.length === 0) {
      console.log('Mise à jour des configurations nécessaire');
      
      if (validConfigs.length === 0) {
        const defaultConfigs = [
          {
            id: 'standard',
            name: 'Standard A4',
            description: 'Configuration standard pour papier A4',
            settings: {
              nomTop: 90,
              nomLeft: 40,
              fieldSpacing: 15,
              signatairePosTop: 250,
              signatairePosLeft: 40,
              datePosTop: 250,
              datePosLeft: 150,
              fontSize: 12,
              fontFamily: "'Times New Roman', Times, serif"
            }
          },
          {
            id: 'compact',
            name: 'Format Compact',
            description: 'Configuration compacte pour économiser l\'espace',
            settings: {
              nomTop: 80,
              nomLeft: 30,
              fieldSpacing: 12,
              signatairePosTop: 240,
              signatairePosLeft: 30,
              datePosTop: 240,
              datePosLeft: 130
            }
          },
          {
            id: 'custom1',
            name: 'Préselection personnalisée 1',
            description: 'Configuration personnalisable',
            settings: {}
          },
          {
            id: 'custom2',
            name: 'Préselection personnalisée 2',
            description: 'Configuration personnalisable',
            settings: {}
          }
        ];
        updateSettings('savedConfigs', defaultConfigs as any);
        toast.success("Configurations réinitialisées avec les valeurs par défaut");
      } else {
        updateSettings('savedConfigs', validConfigs as any);
        toast.success(`${settings.savedConfigs.length - validConfigs.length} configurations corrompues supprimées`);
      }
    }
    
    setIsDataReady(true);
  }, [settings.savedConfigs, updateSettings]);

  const saveCurrentConfig = () => {
    if (!newConfigName.trim()) {
      toast.error("Veuillez saisir un nom pour la configuration");
      return;
    }

    // Limiter à 4 configurations personnalisables maximum
    const customConfigs = settings.savedConfigs.filter(config => 
      config.id.startsWith('custom') || !['standard', 'compact'].includes(config.id)
    );

    if (customConfigs.length >= 4) {
      toast.error("Vous ne pouvez sauvegarder que 4 configurations personnalisées maximum");
      return;
    }

    const newConfig: CalibrationConfig = {
      id: `custom_${Date.now()}`,
      name: newConfigName.trim(),
      description: newConfigDescription.trim(),
      settings: {
        nomTop: settings.nomTop,
        nomLeft: settings.nomLeft,
        fieldSpacing: settings.fieldSpacing,
        signatairePosTop: settings.signatairePosTop,
        signatairePosLeft: settings.signatairePosLeft,
        datePosTop: settings.datePosTop,
        datePosLeft: settings.datePosLeft,
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily
      }
    };

    const updatedConfigs = [...settings.savedConfigs, newConfig];
    updateSettings('savedConfigs', updatedConfigs as any);
    
    setNewConfigName('');
    setNewConfigDescription('');
    setIsDialogOpen(false);
    
    toast.success("Configuration sauvegardée avec succès");
  };

  const loadConfig = (configId: string) => {
    const config = settings.savedConfigs.find(c => c.id === configId);
    if (config) {
      Object.entries(config.settings).forEach(([key, value]) => {
        updateSettings(key as keyof typeof settings, value as any);
      });
      toast.success(`Configuration "${config.name}" chargée`);
    } else {
      toast.error("Configuration non trouvée");
    }
  };

  const deleteConfig = (configId: string) => {
    if (['standard', 'compact'].includes(configId)) {
      toast.error("Impossible de supprimer les configurations par défaut");
      return;
    }

    const updatedConfigs = settings.savedConfigs.filter(c => c.id !== configId);
    updateSettings('savedConfigs', updatedConfigs as any);
    toast.success("Configuration supprimée");
  };

  const startEditConfig = (config: CalibrationConfig) => {
    setEditingConfig(config);
    setEditName(config.name);
    setEditDescription(config.description);
    setIsEditDialogOpen(true);
  };

  const saveEditConfig = () => {
    if (!editingConfig || !editName.trim()) {
      toast.error("Veuillez saisir un nom valide");
      return;
    }

    const updatedConfigs = settings.savedConfigs.map(config => 
      config.id === editingConfig.id 
        ? { ...config, name: editName.trim(), description: editDescription.trim() }
        : config
    );

    updateSettings('savedConfigs', updatedConfigs as any);
    setIsEditDialogOpen(false);
    setEditingConfig(null);
    setEditName('');
    setEditDescription('');
    toast.success("Configuration mise à jour");
  };

  const exportConfig = (config: CalibrationConfig) => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.name.replace(/\s+/g, '_')}_config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Configuration exportée");
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.id && imported.name && imported.settings) {
          const customConfigs = settings.savedConfigs.filter(config => 
            config.id.startsWith('custom') || !['standard', 'compact'].includes(config.id)
          );

          if (customConfigs.length >= 4) {
            toast.error("Vous ne pouvez avoir que 4 configurations personnalisées maximum");
            return;
          }

          const newId = `custom_${Date.now()}`;
          const importedConfig = { ...imported, id: newId };
          const updatedConfigs = [...settings.savedConfigs, importedConfig];
          updateSettings('savedConfigs', updatedConfigs as any);
          toast.success(`Configuration "${imported.name}" importée`);
        } else {
          toast.error("Format de fichier invalide");
        }
      } catch (error) {
        toast.error("Erreur lors de l'importation");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Fonction de récupération des configurations valides
  const getValidConfigs = (): CalibrationConfig[] => {
    if (!isDataReady) return [];
    
    return settings.savedConfigs.filter(config => {
      const isValid = isValidConfig(config);
      if (!isValid) {
        console.warn('Configuration invalide détectée lors du rendu:', config);
      }
      return isValid;
    });
  };

  const validConfigs = getValidConfigs();
  const customConfigs = validConfigs.filter(config => 
    !['standard', 'compact'].includes(config.id)
  );

  if (!isDataReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Configurations Prédéfinies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Configurations Prédéfinies ({customConfigs.length}/4 personnalisées)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {validConfigs.length > 0 ? (
          <div>
            <Label htmlFor="preset-select" className="text-sm">Charger une configuration :</Label>
            <Select onValueChange={loadConfig}>
              <SelectTrigger id="preset-select" className="mt-1">
                <SelectValue placeholder="Sélectionner une configuration" />
              </SelectTrigger>
              <SelectContent>
                {validConfigs.map((config) => {
                  if (!config.id || config.id.trim() === '') {
                    return null;
                  }
                  
                  return (
                    <SelectItem key={config.id} value={config.id}>
                      {config.name} - {config.description}
                    </SelectItem>
                  );
                }).filter(Boolean)}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Aucune configuration disponible. Sauvegardez votre première configuration.
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="flex items-center gap-1"
                disabled={customConfigs.length >= 4}
              >
                <Save className="h-3 w-3" />
                Sauvegarder {customConfigs.length >= 4 && "(Max atteint)"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sauvegarder la Configuration Actuelle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="config-name">Nom :</Label>
                  <Input
                    id="config-name"
                    value={newConfigName}
                    onChange={(e) => setNewConfigName(e.target.value)}
                    placeholder="Ex: Format Personnel"
                  />
                </div>
                <div>
                  <Label htmlFor="config-description">Description :</Label>
                  <Input
                    id="config-description"
                    value={newConfigDescription}
                    onChange={(e) => setNewConfigDescription(e.target.value)}
                    placeholder="Ex: Configuration pour impression A4 personnalisée"
                  />
                </div>
                <Button onClick={saveCurrentConfig} className="w-full">
                  Sauvegarder
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <input
            type="file"
            accept=".json"
            onChange={importConfig}
            style={{ display: 'none' }}
            id="import-config"
          />
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => document.getElementById('import-config')?.click()}
            className="flex items-center gap-1"
          >
            <FileUp className="h-3 w-3" />
            Importer
          </Button>
        </div>

        {validConfigs.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm">Configurations sauvegardées :</Label>
            {validConfigs.map((config) => {
              const isDefault = ['standard', 'compact'].includes(config.id);
              return (
                <div key={config.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {config.name} {isDefault && <span className="text-xs text-gray-500">(par défaut)</span>}
                    </div>
                    <div className="text-xs text-gray-500">{config.description}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadConfig(config.id)}
                      title="Charger la configuration"
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportConfig(config)}
                      title="Exporter la configuration"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    {!isDefault && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditConfig(config)}
                          title="Modifier le nom/description"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteConfig(config.id)}
                          title="Supprimer la configuration"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nom :</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nom de la configuration"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description :</Label>
                <Input
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description de la configuration"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={saveEditConfig}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CalibrationPresets;
