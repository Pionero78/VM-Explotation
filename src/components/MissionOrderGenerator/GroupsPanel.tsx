import { Button } from "@/components/ui/button";
import { useMissionOrder } from "@/context/MissionOrderContext";
import { GroupType } from "@/types";

interface GroupsPanelProps {
  onOpenModal: (id: GroupType) => void;
}

const GROUPS: { id: GroupType; label: string; color: string }[] = [
  {
    id: "HD1",
    label: "HD1",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "HD2",
    label: "HD2",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "HD3",
    label: "HD3",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "HD4",
    label: "HD4",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "HD5",
    label: "HD5",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "G6",
    label: "G6",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "G7",
    label: "G7",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "G10",
    label: "G10",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "G11",
    label: "G11",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "G12",
    label: "G12",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  { id: "FH", label: "FH", color: "bg-pink-100 text-pink-800 border-pink-200" },
  {
    id: "Chauffeurs",
    label: "Chauffeurs",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  {
    id: "DOP",
    label: "DOP",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    id: "Machinistes",
    label: "Machinistes",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  {
    id: "Autres",
    label: "Autres",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  {
    id: "TDA",
    label: "TDA",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "Fixe",
    label: "Fixe",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
];

const GroupsPanel: React.FC<GroupsPanelProps> = ({ onOpenModal }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {GROUPS.map((group) => (
        <Button
          key={group.id}
          className={`${group.color} hover:opacity-80 border font-medium`}
          onClick={() => onOpenModal(group.id)}
          variant="outline"
          size="sm"
        >
          {group.label}
        </Button>
      ))}
    </div>
  );
};

export default GroupsPanel;
