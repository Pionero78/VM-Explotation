
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { useMissionOrder } from '@/context/MissionOrderContext';
import { GroupType } from '@/types';
import { Users, Download, Upload } from 'lucide-react';
import { getEmploymentForName } from '@/data/groupData';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { toast } from 'sonner';

interface GroupSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroupSelectionModal: React.FC<GroupSelectionModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentGroupId, 
    toggleNameSelection, 
    getCurrentGroupData, 
    getSortedGroupNames,
    updateCustomGroupOrder,
    settings
  } = useMissionOrder();
  
  const sortedNames = getSortedGroupNames(currentGroupId);
  const currentGroupData = getCurrentGroupData();
  
  // Gestion du drag end avec react-beautiful-dnd
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newOrder = Array.from(sortedNames);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    
    updateCustomGroupOrder(currentGroupId, newOrder);
    toast.success("Ordre mis à jour avec succès");
  };

  const selectAllGroup = () => {
    const currentData = getCurrentGroupData();
    const groupData = currentData[currentGroupId] || {};
    for (const nom in groupData) {
      toggleNameSelection(nom, currentGroupId);
    }
    onClose();
  };

  const exportDisposition = () => {
    const disposition = {
      groupId: currentGroupId,
      order: sortedNames,
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(disposition, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `disposition_${currentGroupId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Disposition exportée avec succès");
  };

  const importDisposition = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.groupId === currentGroupId && imported.order) {
          updateCustomGroupOrder(currentGroupId, imported.order);
          toast.success("Disposition importée avec succès");
        } else {
          toast.error("Fichier incompatible avec ce groupe");
        }
      } catch (error) {
        toast.error("Erreur lors de l'importation");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const parseFullName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      const lastName = parts[0].toUpperCase();
      const firstName = parts.slice(1).join(' ').toUpperCase();
      return { lastName, firstName };
    }
    return { lastName: fullName.toUpperCase(), firstName: '' };
  };

  // Styles basés sur les paramètres
  const formStyle = {
    fontFamily: settings.formFontFamily,
    fontSize: `${settings.formFontSize}px`,
    fontWeight: settings.formBoldEnabled ? 'bold' : 'normal',
  };

  const rowSpacing = {
    marginBottom: `${settings.formVerticalSpacing || 8}px`,
  };

  const columnSpacing = {
    marginRight: `${settings.formHorizontalSpacing || 16}px`,
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden bg-white border border-gray-200">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="flex items-center justify-between text-xl font-bold text-gray-800">
            <div className="flex items-center gap-3">
              <span>Sélection {currentGroupId}</span>
              <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
                {sortedNames.length} techniciens
              </div>
            </div>
            <div className="flex items-center gap-3">
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
                id="import-disposition"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => document.getElementById('import-disposition')?.click()}
                className="flex items-center gap-1"
              >
                <Upload className="h-3 w-3" />
                Import
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={`modal-droppable-${currentGroupId}`}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={snapshot.isDraggingOver ? 'bg-blue-50' : ''}
                >
                  {sortedNames.map((name, index) => {
                    const employment = getEmploymentForName(name, currentGroupData).toUpperCase();
                    const { lastName, firstName } = parseFullName(name);
                    
                    return (
                      <Draggable key={name} draggableId={`modal-${name}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center py-2 px-3 ${
                              snapshot.isDragging 
                                ? 'bg-blue-100 shadow-lg' 
                                : 'hover:bg-gray-50 cursor-grab'
                            }`}
                            style={{
                              userSelect: 'none',
                              ...provided.draggableProps.style,
                              ...formStyle,
                              ...rowSpacing
                            }}
                          >
                            <div className="flex-1 flex items-center">
                              <div className="w-8 text-center font-bold">{index + 1}.</div>
                              <div className="flex-1 flex">
                                <div className="w-1/3" style={columnSpacing}>{lastName}</div>
                                <div className="w-1/3" style={columnSpacing}>{firstName}</div>
                                <div className="w-1/3">{employment}</div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleNameSelection(name, currentGroupId);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white ml-2"
                            >
                              Sélectionner
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            💡 <strong>Astuce :</strong> Glissez-déposez pour réorganiser les techniciens
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} asChild>
              <DialogClose>Fermer</DialogClose>
            </Button>
            <Button 
              onClick={selectAllGroup}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Sélectionner toute l'équipe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSelectionModal;
