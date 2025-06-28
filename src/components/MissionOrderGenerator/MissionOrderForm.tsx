
import { useMissionOrder } from "@/context/MissionOrderContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MissionOrderFormData } from "@/types";

const MissionOrderForm: React.FC = () => {
  const { formData, setFormData } = useMissionOrder();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof MissionOrderFormData, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [id]: value,
      // Réinitialiser le matricule si on ne sélectionne plus "Véhicule personnel"
      ...(id === 'transport' && value !== 'Véhicule personnel' ? { matricule: '' } : {})
    }));
  };

  const handleMatriculeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Garder seulement les chiffres
    
    // Formater automatiquement : 7 chiffres - 3 chiffres - 2 chiffres
    if (value.length > 7) {
      value = value.slice(0, 7) + '-' + value.slice(7);
    }
    if (value.length > 11) {
      value = value.slice(0, 11) + '-' + value.slice(11, 13);
    }
    
    setFormData(prev => ({ ...prev, matricule: value }));
  };

  // Options de signataire avec valeurs valides
  const signataireOptions = [
    { value: "none", label: "Sans signataire" },
    { value: "CHEF DE DÉPARTEMENT", label: "CHEF DE DÉPARTEMENT" },
    { value: "SOUS-DIRECTEUR", label: "SOUS-DIRECTEUR" },
    { value: "CHEF DE SECTION", label: "CHEF DE SECTION" }
  ].filter(option => option.value && option.value.trim() !== "");

  // Options de transport avec valeurs valides
  const transportOptions = [
    { value: "Véhicule de service", label: "Véhicule de service" },
    { value: "Véhicule personnel", label: "Véhicule personnel" },
    { value: "Train", label: "Train" },
    { value: "Avion", label: "Avion" },
    { value: "Autre", label: "Autre" }
  ].filter(option => option.value && option.value.trim() !== "");

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="residence">Résidence Administrative :</Label>
        <Input
          id="residence"
          value={formData.residence}
          readOnly
          className="bg-gray-100 text-sm"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="destination">Destination :</Label>
        <Input
          id="destination"
          value={formData.destination}
          onChange={handleChange}
          required
          className="text-sm"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="motif">Motif du déplacement :</Label>
        <Input
          id="motif"
          value={formData.motif}
          onChange={handleChange}
          required
          className="text-sm"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="transport">Moyen de Transport :</Label>
        {formData.transport === 'Véhicule personnel' ? (
          <div className="flex gap-2">
            <Select 
              value={formData.transport}
              onValueChange={(value) => handleSelectChange('transport', value)}
            >
              <SelectTrigger id="transport" className="text-sm w-1/3">
                <SelectValue placeholder="Sélectionner un moyen de transport" />
              </SelectTrigger>
              <SelectContent>
                {transportOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              id="matricule"
              placeholder="0000000-000-00"
              value={formData.matricule || ''}
              onChange={handleMatriculeChange}
              maxLength={15}
              className="text-sm flex-1"
            />
          </div>
        ) : (
          <Select 
            value={formData.transport}
            onValueChange={(value) => handleSelectChange('transport', value)}
          >
            <SelectTrigger id="transport" className="text-sm">
              <SelectValue placeholder="Sélectionner un moyen de transport" />
            </SelectTrigger>
            <SelectContent>
              {transportOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dateDepart">Date de Départ :</Label>
        <Input
          id="dateDepart"
          type="date"
          value={formData.dateDepart}
          onChange={handleChange}
          required
          className="text-sm"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dateRetour">Date de Retour :</Label>
        <Input
          id="dateRetour"
          type="date"
          value={formData.dateRetour}
          onChange={handleChange}
          required
          className="text-sm"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="signataire">Signataire :</Label>
        <Select 
          value={formData.signataire || "none"}
          onValueChange={(value) => handleSelectChange('signataire', value === "none" ? "" : value)}
        >
          <SelectTrigger id="signataire" className="text-sm">
            <SelectValue placeholder="Sélectionner un signataire" />
          </SelectTrigger>
          <SelectContent>
            {signataireOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="date">Date de l'ordre de mission :</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="text-sm"
        />
      </div>
    </div>
  );
};

export default MissionOrderForm;
