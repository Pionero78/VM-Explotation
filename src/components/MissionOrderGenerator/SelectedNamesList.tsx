import React from "react";
import { useMissionOrder } from "@/context/MissionOrderContext";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";
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
    settings,
  } = useMissionOrder();

  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

  const currentGroupData = getCurrentGroupData();

  // Use original order directly
  const orderedSelectedNames = selectedNames;

  const eclairageGroups = ["G6", "G7", "G8", "G9", "G10", "G11", "G12"];

  // Groups that can be freely reordered together (no section headers)
  const freeReorderGroups = [
    "HD1",
    "HD2",
    "HD3",
    "HD4",
    "HD5",
    "DOP",
    "Autres",
    "Machinistes",
  ];

  // Separate members into free reorder and sectioned groups
  const freeReorderMembers = [];
  const eclairageMembers = [];
  const fhMembers = [];
  const chauffeursMembers = [];
  const tdaMembers = [];
  const fixeMembers = [];

  // Maintain original order while separating into groups
  orderedSelectedNames.forEach((member) => {
    if (freeReorderGroups.includes(member.group)) {
      freeReorderMembers.push(member);
    } else if (eclairageGroups.includes(member.group)) {
      eclairageMembers.push(member);
    } else if (member.group === "FH") {
      fhMembers.push(member);
    } else if (member.group === "Chauffeurs") {
      chauffeursMembers.push(member);
    } else if (member.group === "TDA") {
      tdaMembers.push(member);
    } else if (member.group === "Fixe") {
      fixeMembers.push(member);
    }
  });

  // Fonction pour analyser le nom complet
  const parseFullName = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      const lastName = parts[0].toUpperCase();
      const firstName = parts.slice(1).join(" ").toUpperCase();
      return { lastName, firstName };
    }
    return { lastName: fullName.toUpperCase(), firstName: "" };
  };

  // Gestion du drag end avec react-beautiful-dnd - Allow full reordering
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

  // Interface-specific calibration styles
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

  const SectionHeader = ({ title }: { title: string }) => (
    <div
      className="bg-black text-white py-2 px-4 font-bold text-center mb-2"
      style={{
        ...formStyle,
        height: `${settings.interfaceSectionHeaderHeight || 32}px`,
        fontSize: `${settings.interfaceSectionTitleSize || 14}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {title}
    </div>
  );

  const TechnicianRow = ({
    item,
    globalIndex,
    isDragging,
  }: {
    item: any;
    globalIndex: number;
    isDragging?: boolean;
  }) => {
    const { lastName, firstName } = parseFullName(item.name);
    const employment = getEmploymentForName(
      item.name,
      currentGroupData,
    ).toUpperCase();

    return (
      <div
        className={`flex items-center py-1 px-2 ${isDragging ? "bg-blue-100" : "hover:bg-gray-50"} cursor-grab`}
        style={{ ...formStyle, ...rowSpacing }}
      >
        <div className="flex-1 flex items-center">
          <div className="w-8 text-center font-bold">{globalIndex + 1}.</div>
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

  const renderMembers = (
    members: any[],
    startIndex: number,
    droppableId: string = "selected-names",
  ) =>
    members.map((member, index) => {
      const globalIndex = startIndex + index;
      return (
        <Draggable
          key={`${droppableId}-${member.name}`}
          draggableId={`${droppableId}-${member.name}`}
          index={globalIndex}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={{
                userSelect: "none",
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
    });

  if (orderedSelectedNames.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12 bg-white rounded border border-gray-200">
        <div className="text-4xl mb-4">👥</div>
        <div className="text-lg font-medium mb-2">
          Aucun technicien sélectionné
        </div>
        <div className="text-sm">
          Sélectionnez des techniciens dans les groupes ci-dessus
        </div>
      </div>
    );
  }

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
          <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vider la liste
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmation</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir vider toute la liste ? Cette action
                  est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearList}
                  className="bg-red-600 hover:bg-red-700"
                >
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
                className={snapshot.isDraggingOver ? "bg-blue-50" : ""}
              >
                {/* Free reorder section - HD1-HD5, DOP, Autres, Machinistes without headers */}
                {freeReorderMembers.length > 0 && (
                  <>{renderMembers(freeReorderMembers, 0, "free-reorder")}</>
                )}

                {/* Sectioned groups with headers - these cannot be reordered with free reorder section */}
                {eclairageMembers.length > 0 && (
                  <div className="mt-4">
                    <SectionHeader title="ÉCLAIRAGE" />
                    <div className="border-l-4 border-gray-300 pl-2">
                      {eclairageMembers.map((member, index) => {
                        const globalIndex = freeReorderMembers.length + index;
                        const { lastName, firstName } = parseFullName(
                          member.name,
                        );
                        const employment = getEmploymentForName(
                          member.name,
                          currentGroupData,
                        ).toUpperCase();

                        return (
                          <div
                            key={member.name}
                            className="flex items-center py-1 px-2 hover:bg-gray-50"
                            style={{ ...formStyle, ...rowSpacing }}
                          >
                            <div className="flex-1 flex items-center">
                              <div className="w-8 text-center font-bold">
                                {globalIndex + 1}.
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
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromSelection(member.name)}
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 ml-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {fhMembers.length > 0 && (
                  <div className="mt-4">
                    <SectionHeader title="TRANSMISSION" />
                    <div className="border-l-4 border-gray-300 pl-2">
                      {fhMembers.map((member, index) => {
                        const globalIndex =
                          freeReorderMembers.length +
                          eclairageMembers.length +
                          index;
                        const { lastName, firstName } = parseFullName(
                          member.name,
                        );
                        const employment = getEmploymentForName(
                          member.name,
                          currentGroupData,
                        ).toUpperCase();

                        return (
                          <div
                            key={member.name}
                            className="flex items-center py-1 px-2 hover:bg-gray-50"
                            style={{ ...formStyle, ...rowSpacing }}
                          >
                            <div className="flex-1 flex items-center">
                              <div className="w-8 text-center font-bold">
                                {globalIndex + 1}.
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
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromSelection(member.name)}
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 ml-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {chauffeursMembers.length > 0 && (
                  <div className="mt-4">
                    <SectionHeader title="CHAUFFEURS" />
                    <div className="border-l-4 border-gray-300 pl-2">
                      {chauffeursMembers.map((member, index) => {
                        const globalIndex =
                          freeReorderMembers.length +
                          eclairageMembers.length +
                          fhMembers.length +
                          index;
                        const { lastName, firstName } = parseFullName(
                          member.name,
                        );
                        const employment = getEmploymentForName(
                          member.name,
                          currentGroupData,
                        ).toUpperCase();

                        return (
                          <div
                            key={member.name}
                            className="flex items-center py-1 px-2 hover:bg-gray-50"
                            style={{ ...formStyle, ...rowSpacing }}
                          >
                            <div className="flex-1 flex items-center">
                              <div className="w-8 text-center font-bold">
                                {globalIndex + 1}.
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
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromSelection(member.name)}
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 ml-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tdaMembers.length > 0 && (
                  <div className="mt-4">
                    <SectionHeader title="TDA" />
                    <div className="border-l-4 border-gray-300 pl-2">
                      {tdaMembers.map((member, index) => {
                        const globalIndex =
                          freeReorderMembers.length +
                          eclairageMembers.length +
                          fhMembers.length +
                          chauffeursMembers.length +
                          index;
                        const { lastName, firstName } = parseFullName(
                          member.name,
                        );
                        const employment = getEmploymentForName(
                          member.name,
                          currentGroupData,
                        ).toUpperCase();

                        return (
                          <div
                            key={member.name}
                            className="flex items-center py-1 px-2 hover:bg-gray-50"
                            style={{ ...formStyle, ...rowSpacing }}
                          >
                            <div className="flex-1 flex items-center">
                              <div className="w-8 text-center font-bold">
                                {globalIndex + 1}.
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
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromSelection(member.name)}
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 ml-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {fixeMembers.length > 0 && (
                  <div className="mt-4">
                    <SectionHeader title="FIXE" />
                    <div className="border-l-4 border-gray-300 pl-2">
                      {fixeMembers.map((member, index) => {
                        const globalIndex =
                          freeReorderMembers.length +
                          eclairageMembers.length +
                          fhMembers.length +
                          chauffeursMembers.length +
                          tdaMembers.length +
                          index;
                        const { lastName, firstName } = parseFullName(
                          member.name,
                        );
                        const employment = getEmploymentForName(
                          member.name,
                          currentGroupData,
                        ).toUpperCase();

                        return (
                          <div
                            key={member.name}
                            className="flex items-center py-1 px-2 hover:bg-gray-50"
                            style={{ ...formStyle, ...rowSpacing }}
                          >
                            <div className="flex-1 flex items-center">
                              <div className="w-8 text-center font-bold">
                                {globalIndex + 1}.
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
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromSelection(member.name)}
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 ml-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
