import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, FileText, List, FileSpreadsheet } from "lucide-react";

interface PrintMenuProps {
  onPrintOM?: () => void;
  onPrintSelectedOM?: () => void;
  onPrintList?: () => void;
  onExportExcel?: () => void;
}

const PrintMenu: React.FC<PrintMenuProps> = ({
  onPrintOM = () => {},
  onPrintSelectedOM = () => {},
  onPrintList = () => {},
  onExportExcel = () => {},
}) => {
  const buttons = [
    {
      id: "print-om",
      label: "Imprimer OM",
      icon: Printer,
      onClick: onPrintOM,
      glowColor: "cyan",
      hoverShadow: "shadow-cyan-500/50",
      textColor: "text-cyan-400",
      hoverTextColor: "hover:text-cyan-300",
    },
    {
      id: "print-selected",
      label: "Imprimer OM sélectionnés",
      icon: FileText,
      onClick: onPrintSelectedOM,
      glowColor: "fuchsia",
      hoverShadow: "shadow-fuchsia-500/50",
      textColor: "text-fuchsia-400",
      hoverTextColor: "hover:text-fuchsia-300",
    },
    {
      id: "print-list",
      label: "Imprimer la liste",
      icon: List,
      onClick: onPrintList,
      glowColor: "green",
      hoverShadow: "shadow-green-500/50",
      textColor: "text-green-400",
      hoverTextColor: "hover:text-green-300",
    },
    {
      id: "export-excel",
      label: "Exporter la liste en Excel",
      icon: FileSpreadsheet,
      onClick: onExportExcel,
      glowColor: "purple",
      hoverShadow: "shadow-purple-500/50",
      textColor: "text-purple-400",
      hoverTextColor: "hover:text-purple-300",
    },
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl"
      >
        <Card className="rounded-3xl bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-black/50 border-gray-700/50 shadow-2xl backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
              Menu d'Impression
            </CardTitle>
            <p className="text-sm text-gray-400 mt-2">
              Sélectionnez une option d'impression ou d'export
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {buttons.map((button) => {
                const IconComponent = button.icon;
                return (
                  <motion.div
                    key={button.id}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Button
                      onClick={button.onClick}
                      className={`
                        h-36 w-full rounded-3xl bg-black border border-gray-700/50
                        flex flex-col items-center justify-center gap-4
                        ${button.textColor} ${button.hoverTextColor}
                        hover:${button.hoverShadow} hover:shadow-2xl
                        transition-all duration-300 ease-in-out
                        hover:border-gray-600/50
                        group
                      `}
                      variant="outline"
                    >
                      <IconComponent className="h-8 w-8 group-hover:animate-pulse" />
                      <span className="text-lg font-bold text-center leading-tight">
                        {button.label}
                      </span>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PrintMenu;
