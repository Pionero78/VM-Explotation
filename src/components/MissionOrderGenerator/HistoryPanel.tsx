import { useMissionOrder } from "@/context/MissionOrderContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/utils/formatDate";
import { X } from "lucide-react";
import { toast } from "sonner";

const HistoryPanel: React.FC = () => {
  const {
    historyOM,
    historyList,
    deleteHistoryEntry,
    loadHistoryEntry,
    clearHistory,
    settings,
  } = useMissionOrder();

  const historyItemStyle = {
    fontFamily: settings.historyFontFamily,
    fontSize: `${settings.historyFontSize}px`,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="om" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="om">Ordre de Mission</TabsTrigger>
            <TabsTrigger value="list">Liste</TabsTrigger>
          </TabsList>

          <TabsContent value="om">
            {historyOM.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Aucun historique d'ordre de mission
              </p>
            ) : (
              <div className="space-y-3">
                {historyOM.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-sm border relative"
                    style={historyItemStyle}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => deleteHistoryEntry("OM", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="font-bold">{entry.group}</div>
                    <div>Événement: {entry.motif}</div>
                    <div>Date: {formatDate(entry.date)}</div>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        onClick={() => loadHistoryEntry("OM", index)}
                      >
                        Rappeler
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="list">
            {historyList.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Aucun historique de liste
              </p>
            ) : (
              <div className="space-y-3">
                {historyList.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-sm border relative"
                    style={historyItemStyle}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => deleteHistoryEntry("List", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="font-bold">{entry.group}</div>
                    <div>Événement: {entry.motif}</div>
                    <div>Date: {formatDate(entry.date)}</div>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        onClick={() => loadHistoryEntry("List", index)}
                      >
                        Rappeler
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {(historyOM.length > 0 || historyList.length > 0) && (
        <CardFooter>
          <Button
            variant="destructive"
            className="w-full"
            onClick={clearHistory}
          >
            Effacer tout l'historique
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default HistoryPanel;
