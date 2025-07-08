import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { LogOut, User } from "lucide-react";

import GroupsPanel from "./GroupsPanel";
import GroupSelectionModal from "./GroupSelectionModal";
import SelectedNamesList from "./SelectedNamesList";
import MissionOrderForm from "./MissionOrderForm";
import SettingsPanel from "./SettingsPanel";
import HistoryPanel from "./HistoryPanel";
import PrintPanel from "./PrintPanel";
import ImportPanel from "./ImportPanel";
import PresetSlots from "./PresetSlots";
import AddTechnician from "./AddTechnician";
import { useMissionOrder } from "@/context/MissionOrderContext";
// import { useAuth } from "@/context/AuthContext"; // Commented out for external deployment compatibility
import { GroupType } from "@/types";

const Layout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("interface");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [isImportAuthenticated, setIsImportAuthenticated] =
    useState<boolean>(false);
  const { setCurrentGroupId, getCurrentGroupData } = useMissionOrder();
  const { toast } = useToast();
  // const { signOut, user } = useAuth(); // Commented out for external deployment compatibility
  const user = null; // Fallback for external deployments
  const signOut = async () => {}; // Fallback function

  const correctPassword = "@Pioneer1430";

  // Calculer le nombre total de personnel
  const getTotalPersonnel = () => {
    const currentData = getCurrentGroupData();
    return Object.values(currentData).reduce(
      (total, group) => total + Object.keys(group).length,
      0,
    );
  };

  const handleOpenModal = (groupId: GroupType) => {
    setCurrentGroupId(groupId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleTabChange = (value: string) => {
    if (value === "import" && !isImportAuthenticated) {
      setShowPasswordDialog(true);
      return;
    }
    setActiveTab(value);
  };

  const handlePasswordSubmit = () => {
    if (password === correctPassword) {
      setIsImportAuthenticated(true);
      setShowPasswordDialog(false);
      setActiveTab("import");
      setPassword("");
      toast({
        title: "Accès autorisé",
        description: "Vous pouvez maintenant accéder à l'importation Excel.",
      });
    } else {
      toast({
        title: "Mot de passe incorrect",
        description: "Veuillez entrer le mot de passe correct.",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              OM & Lists Generator
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 hover:border-red-400 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </Button>
              </>
            )}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-6 mb-6 bg-white border border-gray-200 h-12">
            <TabsTrigger
              value="interface"
              className="text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Interface
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Paramètres
            </TabsTrigger>
            <TabsTrigger
              value="print"
              className="text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Impression
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Historique
            </TabsTrigger>
            <TabsTrigger
              value="import"
              className="text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Importer Excel
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              À propos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interface">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Sélection d'équipes
                    </h2>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        Personnel total : {getTotalPersonnel()}
                      </span>
                      <AddTechnician />
                    </div>
                  </div>
                  <GroupsPanel onOpenModal={handleOpenModal} />
                </div>

                <div className="mb-6">
                  <SelectedNamesList />
                </div>

                <MissionOrderForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <SettingsPanel />
            </div>
          </TabsContent>

          <TabsContent value="about">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-gray-800">
                      À propos
                    </h1>
                    <p className="text-lg text-gray-600">
                      Informations sur l'application
                    </p>
                  </div>
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center">
                      <CardTitle className="text-2xl flex items-center justify-center gap-2">
                        📦 OM & LISTS GENERATOR
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                              🧾 Version
                            </span>
                            <span className="font-semibold text-lg">v2.0</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                              👨‍💻 Développé par
                            </span>
                            <span className="font-semibold">KETILA Aissa</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border">
                          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            📘 Description
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            Générateur avancé d'ordres de mission et de listes
                            techniques basé sur l'importation Excel, avec
                            gestion modulaire des techniciens, calibrage
                            d'affichage, impression personnalisée, et
                            exportation Excel.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="print">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <PrintPanel />
            </div>
          </TabsContent>

          <TabsContent value="import">
            {isImportAuthenticated && (
              <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
                <ImportPanel />
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <HistoryPanel />
            </div>
          </TabsContent>
        </Tabs>

        <GroupSelectionModal isOpen={modalOpen} onClose={handleCloseModal} />

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                Accès sécurisé requis
              </DialogTitle>
              <DialogDescription>
                Veuillez entrer le mot de passe pour accéder à la fonctionnalité
                d'importation Excel.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handlePasswordSubmit()
                  }
                  placeholder="Entrez le mot de passe"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordDialog(false)}
                >
                  Annuler
                </Button>
                <Button onClick={handlePasswordSubmit}>Confirmer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Layout;
