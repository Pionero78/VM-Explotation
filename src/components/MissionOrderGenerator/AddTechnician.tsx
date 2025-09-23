
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/ResizableMovableDialog';
import { useMissionOrder } from '@/context/MissionOrderContext';
import { GroupType } from '@/types';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_GROUPS: { id: GroupType; label: string }[] = [
  { id: 'HD1', label: 'HD1' },
  { id: 'HD2', label: 'HD2' },
  { id: 'HD3', label: 'HD3' },
  { id: 'HD4', label: 'HD4' },
  { id: 'HD5', label: 'HD5' },
  { id: 'G6', label: 'G6' },
  { id: 'G7', label: 'G7' },
  { id: 'G10', label: 'G10' },
  { id: 'G11', label: 'G11' },
  { id: 'G12', label: 'G12' },
  { id: 'FH', label: 'FH' },
  { id: 'Chauffeurs', label: 'Chauffeurs' },
  { id: 'DOP', label: 'DOP' },
  { id: 'Machinistes', label: 'Machinistes' },
  { id: 'Autres', label: 'Autres' },
  { id: 'TDA', label: 'TDA' },
  { id: 'Fixe', label: 'Fixe' }
];

const AddTechnician: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [group, setGroup] = useState<string>('');
  const { getCurrentGroupData, updateImportedGroupData } = useMissionOrder();

  const handleAddTechnician = () => {
    if (!name.trim() || !position.trim() || !group) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const currentData = getCurrentGroupData();
    const updatedData = { ...currentData };
    
    if (!updatedData[group]) {
      updatedData[group] = {};
    }
    
    updatedData[group][name.trim()] = position.trim();
    
    updateImportedGroupData(updatedData);
    
    setName('');
    setPosition('');
    setGroup('');
    setIsOpen(false);
    
    toast.success(`${name} ajouté à ${group}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" size="sm">
          <Plus className="h-4 w-4" />
          Ajouter technicien
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un technicien</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="technician-name">Nom :</Label>
            <Input
              id="technician-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du technicien"
            />
          </div>
          <div>
            <Label htmlFor="technician-position">Fonction :</Label>
            <Input
              id="technician-position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Fonction du technicien"
            />
          </div>
          <div>
            <Label htmlFor="technician-group">Groupe :</Label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger id="technician-group">
                <SelectValue placeholder="Sélectionner un groupe" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_GROUPS.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddTechnician}>
              Ajouter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTechnician;
