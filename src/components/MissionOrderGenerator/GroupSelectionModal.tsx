import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/ResizableMovableDialog";
import { useMissionOrder } from "@/context/MissionOrderContext";
import { GroupType } from "@/types";
import { Users } from "lucide-react";
import { getEmploymentForName } from "@/data/groupData";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
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
import { Trash2 } from "lucide-react";

interface GroupSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroupSelectionModal: React.FC<GroupSelectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentGroupId,
    toggleNameSelection,
    getCurrentGroupData,
    getSortedGroupNames,
    updateCustomGroupOrder,
    settings,
    updateImportedGroupData,
  } = useMissionOrder();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [technicianToDelete, setTechnicianToDelete] = useState<string | null>(
    null,
  );

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

  const handleDeleteTechnician = (name: string) => {
    setTechnicianToDelete(name);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteTechnician = () => {
    if (technicianToDelete) {
      const currentData = getCurrentGroupData();
      const updatedData = { ...currentData };

      // Remove the technician from the group
      if (
        updatedData[currentGroupId] &&
        updatedData[currentGroupId][technicianToDelete]
      ) {
        delete updatedData[currentGroupId][technicianToDelete];
        updateImportedGroupData(updatedData);
        toast.success(`Technicien ${technicianToDelete} supprimé avec succès`);
      }
    }
    setDeleteConfirmOpen(false);
    setTechnicianToDelete(null);
  };

  const parseFullName = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      const lastName = parts[0].toUpperCase();
      const firstName = parts.slice(1).join(" ").toUpperCase();
      return { lastName, firstName };
    }
    return { lastName: fullName.toUpperCase(), firstName: "" };
  };

  // Styles basés sur les paramètres
  const formStyle = {
    fontFamily: settings.formFontFamily,
    fontSize: `${settings.formFontSize}px`,
    fontWeight: settings.formBoldEnabled ? "bold" : "normal",
  };

  const rowSpacing = {
    marginBottom: `${settings.formVerticalSpacing || 8}px`,
  };

  const columnSpacing = {
    marginRight: `${settings.formHorizontalSpacing || 16}px`,
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border border-gray-200 flex flex-col">
        <DialogHeader className="border-b border-gray-200 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center justify-between text-xl font-bold text-gray-800">
            <div className="flex items-center gap-3">
              <span>Sélection {currentGroupId}</span>
              <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
                {sortedNames.length} techniciens
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={`modal-droppable-${currentGroupId}`}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={snapshot.isDraggingOver ? "bg-blue-50" : ""}
                >
                  {sortedNames.map((name, index) => {
                    const employment = getEmploymentForName(
                      name,
                      currentGroupData,
                    ).toUpperCase();
                    const { lastName, firstName } = parseFullName(name);

                    return (
                      <Draggable
                        key={name}
                        draggableId={`modal-${name}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center py-2 px-3 ${
                              snapshot.isDragging
                                ? "bg-blue-100 shadow-lg"
                                : "hover:bg-gray-50 cursor-grab"
                            }`}
                            style={{
                              userSelect: "none",
                              ...provided.draggableProps.style,
                              ...formStyle,
                              ...rowSpacing,
                            }}
                          >
                            <div className="flex-1 flex items-center">
                              <div className="w-8 text-center font-bold">
                                {index + 1}.
                              </div>
                              <div className="flex-1 flex">
                                <div className="w-1/3" style={columnSpacing}>
                                  {lastName}
                                </div>
                                <div className="w-1/3" style={columnSpacing}>
                                  {firstName}
                                </div>
                                <div className="w-1/3">{employment}</div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleNameSelection(name, currentGroupId);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Sélectionner
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTechnician(name);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200 flex-shrink-0">
          <div className="text-sm text-gray-600">
            💡 <strong>Astuce :</strong> Glissez-déposez pour réorganiser les
            techniciens
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

        <AlertDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmation de suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Voulez-vous vraiment supprimer le technicien &quot;
                {technicianToDelete}&quot; ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteTechnician}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSelectionModal;
