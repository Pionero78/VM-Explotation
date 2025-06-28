
import React from 'react';
import { useMissionOrder } from "@/context/MissionOrderContext";
import { Button } from "@/components/ui/button";
import { X, Trash2, Download, Upload } from "lucide-react";
import { getEmploymentForName } from "@/data/groupData";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
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

// ✅ Updated SelectedNamesList component with structured display order
// 1. Technicians assigned to HD1–HD5, DOP, Autres, Machinistes (in order, without headers)
// 2. G6–G12 grouped under 'ÉCLAIRAGE'
// 3. FH under 'TRANSMISSION'
// 4. Chauffeurs under 'CHAUFFEURS'
// 5. TDA under 'TDA'
// 6. Fixe under 'FIXE'

const SelectedNamesList: React.FC = () => {
  const { 
    selectedNames,
    removeFromSelection, 
    reorderSelectedNames,
    getCurrentGroupData,
    clearSelectedNames,
    settings
  } = useMissionOrder();
  
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  
  const currentGroupData = getCurrentGroupData();

  // ✅ NO MORE SORTING - Use original order directly
  const orderedSelectedNames = selectedNames;

  const hdGroups = ["HD1", "HD2", "HD3", "HD4", "HD5"];
  const eclairageGroups = ["G6", "G7", "G8", "G9", "G10", "G11", "G12"];

  const hdMembers = orderedSelectedNames.filter(m => hdGroups.includes(m.group));
  const dopMembers = orderedSelectedNames.filter(m => m.group === "DOP");
  const autresMembers = orderedSelectedNames.filter(m => m.group === "Autres");
  const machinistesMembers = orderedSelectedNames.filter(m => m.group === "Machinistes");
  const eclairageMembers = orderedSelectedNames.filter(m => eclairageGroups.includes(m.group));
  const fhMembers = orderedSelectedNames.filter(m => m.group === "FH");
  const chauffeursMembers = orderedSelectedNames.filter(m => m.group === "Chauffeurs");
  const tdaMembers = orderedSelectedNames.filter(m => m.group === "TDA");
  const fixeMembers = orderedSelectedNames.filter(m => m.group === "Fixe");

  // Fonction pour analyser le nom complet
  const parseFullName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      const lastName = parts[0].toUpperCase();
      const firstName = parts.slice(1).join(' ').toUpperCase();
      return { lastName, firstName };
    }
    return { lastName: fullName.toUpperCase(), firstName: '' };
  };

  // Gestion du drag end avec react-beautiful-dnd
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = [...orderedSelectedNames];
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);
    
    reorderSelectedNames(items);
    toast.success("Ordre mis à jour avec succès");
  };

  const handleClearList = () => {
    clearSelectedNames();
    setIsConfirmOpen(false);
  };

  const exportDisposition = () => {
    const disposition = {
      selectedNames: orderedSelectedNames,
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(disposition, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `disposition_liste_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Disposition de la liste exportée");
  };

  const importDisposition = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.selectedNames) {
          reorderSelectedNames(imported.selectedNames);
          toast.success("Disposition importée avec succès");
        } else {
          toast.error("Fichier de disposition invalide");
        }
      } catch (error) {
        toast.error("Erreur lors de l'importation");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Interface-specific calibration styles
  const formStyle = {
    fontFamily: settings.formFontFamily,
    fontSize: `${settings.formFontSize}px`,
    fontWeight: settings.formBoldEnabled ? 'bold' : 'normal',
  };

  const rowSpacing = {
    marginBottom: `${settings.interfaceRowSpacing || 6}px`,
  };

  const columnSpacing = {
    marginRight: `${settings.interfaceColumnGap || 24}px`,
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div 
      className="bg-black text-white py-2 px-4 font-bold text-center mb-2" 
      style={{
        ...formStyle,
        height: `${settings.interfaceSectionHeaderHeight || 32}px`,
        fontSize: `${settings.interfaceSectionTitleSize || 14}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {title}
    </div>
  );

  const TechnicianRow = ({ item, globalIndex, isDragging }: { item: any, globalIndex: number, isDragging?: boolean }) => {
    const { lastName, firstName } = parseFullName(item.name);
    const employment = getEmploymentForName(item.name, currentGroupData).toUpperCase();
    
    return (
      <div 
        className={`flex items-center py-1 px-2 ${isDragging ? 'bg-blue-100' : 'hover:bg-gray-50'} cursor-grab`}
        style={{ ...formStyle, ...rowSpacing }}
      >
        <div className="flex-1 flex items-center">
          <div className="w-8 text-center font-bold">{globalIndex + 1}.</div>
          <div className="flex-1 flex">
            <div className="w-1/3" style={columnSpacing}>{lastName}</div>
            <div className="w-1/3" style={columnSpacing}>{firstName}</div>
            <div className="w-1/3">{employment}</div>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            removeFromSelection(item.name);
          }}
          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 ml-2"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  const renderMembers = (members: any[], startIndex: number) => (
    members.map((member, index) => {
      const globalIndex = startIndex + index;
      return (
        <Draggable key={member.name} draggableId={`member-${member.name}`} index={globalIndex}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={{
                userSelect: 'none',
                ...provided.draggableProps.style,
              }}
            >
              <TechnicianRow 
                item={member} 
                globalIndex={globalIndex} 
                isDragging={snapshot.isDragging}
              />
            </div>
          )}
        </Draggable>
      );
    })
  );

  if (orderedSelectedNames.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12 bg-white rounded border border-gray-200">
        <div className="text-4xl mb-4">👥</div>
        <div className="text-lg font-medium mb-2">Aucun technicien sélectionné</div>
        <div className="text-sm">Sélectionnez des techniciens dans les groupes ci-dessus</div>
      </div>
    );
  }

  // Calculate start indices for each group
  let currentIndex = 0;
  const hdStartIndex = currentIndex;
  currentIndex += hdMembers.length;
  const dopStartIndex = currentIndex;
  currentIndex += dopMembers.length;
  const autresStartIndex = currentIndex;
  currentIndex += autresMembers.length;
  const machinistesStartIndex = currentIndex;
  currentIndex += machinistesMembers.length;
  const eclairageStartIndex = currentIndex;
  currentIndex += eclairageMembers.length;
  const fhStartIndex = currentIndex;
  currentIndex += fhMembers.length;
  const chauffeursStartIndex = currentIndex;
  currentIndex += chauffeursMembers.length;
  const tdaStartIndex = currentIndex;
  currentIndex += tdaMembers.length;
  const fixeStartIndex = currentIndex;

  return (
    <div className="bg-white rounded border border-gray-200">
      {/* Header avec contrôles */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="bg-black text-white px-3 py-1 rounded text-sm font-bold">
            Total : {orderedSelectedNames.length}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Export/Import */}
          <Button
            size="sm"
            variant="outline"
            onClick={exportDisposition}
            className="flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            Export
          </Button>
          
          <input
            type="file"
            accept=".json"
            onChange={importDisposition}
            style={{ display: 'none' }}
            id="import-list-disposition"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => document.getElementById('import-list-disposition')?.click()}
            className="flex items-center gap-1"
          >
            <Upload className="h-3 w-3" />
            Import
          </Button>

          <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Vider la liste
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmation</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir vider toute la liste ? Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearList} className="bg-red-600 hover:bg-red-700">
                  Vider la liste
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="p-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="selected-names">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={snapshot.isDraggingOver ? 'bg-blue-50' : ''}
              >
                {/* Bloc 1 : HD1–HD5 + DOP + Autres + Machinistes (sans bandeaux) */}
                {renderMembers(hdMembers, hdStartIndex)}
                {renderMembers(dopMembers, dopStartIndex)}
                {renderMembers(autresMembers, autresStartIndex)}
                {renderMembers(machinistesMembers, machinistesStartIndex)}

                {/* Bloc 2 : ÉCLAIRAGE */}
                {eclairageMembers.length > 0 && (
                  <>
                    <SectionHeader title="ÉCLAIRAGE" />
                    {renderMembers(eclairageMembers, eclairageStartIndex)}
                  </>
                )}

                {/* Bloc 3 : FH = TRANSMISSION */}
                {fhMembers.length > 0 && (
                  <>
                    <SectionHeader title="TRANSMISSION" />
                    {renderMembers(fhMembers, fhStartIndex)}
                  </>
                )}

                {/* Bloc 4 : CHAUFFEURS */}
                {chauffeursMembers.length > 0 && (
                  <>
                    <SectionHeader title="CHAUFFEURS" />
                    {renderMembers(chauffeursMembers, chauffeursStartIndex)}
                  </>
                )}

                {/* Bloc 5 : TDA */}
                {tdaMembers.length > 0 && (
                  <>
                    <SectionHeader title="TDA" />
                    {renderMembers(tdaMembers, tdaStartIndex)}
                  </>
                )}

                {/* Bloc 6 : FIXE */}
                {fixeMembers.length > 0 && (
                  <>
                    <SectionHeader title="FIXE" />
                    {renderMembers(fixeMembers, fixeStartIndex)}
                  </>
                )}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default SelectedNamesList;
