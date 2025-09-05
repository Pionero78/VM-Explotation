import { useMissionOrder } from "@/context/MissionOrderContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getEmploymentForName } from "@/data/groupData";
import { formatDate } from "@/utils/formatDate";
import { Printer, FileSpreadsheet, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { Person } from "@/types";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

const PrintPanel: React.FC = () => {
  const {
    selectedNames,
    formData,
    settings,
    addToHistory,
    getCurrentGroupData,
    getVisualOrderFromModal,
  } = useMissionOrder();

  const currentGroupData = getCurrentGroupData();

  // ✅ NO MORE SORTING - Use original order directly
  const orderedSelectedNames = selectedNames;

  const hdGroups = ["HD1", "HD2", "HD3", "HD4", "HD5"];
  const eclairageGroups = ["G6", "G7", "G8", "G9", "G10", "G11", "G12"];

  const hdMembers = orderedSelectedNames.filter((m) =>
    hdGroups.includes(m.group),
  );
  const dopMembers = orderedSelectedNames.filter((m) => m.group === "DOP");
  const autresMembers = orderedSelectedNames.filter(
    (m) => m.group === "Autres",
  );
  const machinistesMembers = orderedSelectedNames.filter(
    (m) => m.group === "Machinistes",
  );
  const eclairageMembers = orderedSelectedNames.filter((m) =>
    eclairageGroups.includes(m.group),
  );
  const fhMembers = orderedSelectedNames.filter((m) => m.group === "FH");
  const chauffeursMembers = orderedSelectedNames.filter(
    (m) => m.group === "Chauffeurs",
  );
  const tdaMembers = orderedSelectedNames.filter((m) => m.group === "TDA");
  const fixeMembers = orderedSelectedNames.filter((m) => m.group === "Fixe");

  const [showPartialPrintDialog, setShowPartialPrintDialog] =
    React.useState(false);
  const [selectedForPrint, setSelectedForPrint] = React.useState<string[]>([]);

  const printMultipleOrders = () => {
    if (selectedNames.length === 0) {
      toast.error("Aucun technicien sélectionné", {
        description:
          "Veuillez sélectionner au moins un technicien pour imprimer un ordre de mission.",
      });
      return;
    }

    // Obtenir les paramètres de mise en page
    const nomTop = settings.nomTop;
    const nomLeft = settings.nomLeft;
    const fieldSpacing = settings.fieldSpacing;
    const fontFamily = settings.fontFamily;
    const fontSize = settings.fontSize;
    const signatairePosTop = settings.signatairePosTop;
    const signatairePosLeft = settings.signatairePosLeft;
    const datePosTop = settings.datePosTop;
    const datePosLeft = settings.datePosLeft;
    const fontWeight = settings.omBoldEnabled ? "bold" : "normal";

    let printContent = "";
    orderedSelectedNames.forEach((item) => {
      // Créer le texte du transport avec matricule si nécessaire
      const transportText =
        formData.transport === "Véhicule personnel" && formData.matricule
          ? `${formData.transport} (${formData.matricule})`
          : formData.transport;

      printContent += `
        <div class="print-area">
          <div class="print-content">
            <div class="field-position" style="top: ${nomTop}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${item.name}</div>
            <div class="field-position" style="top: ${parseInt(String(nomTop)) + parseInt(String(fieldSpacing))}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${getEmploymentForName(item.name, currentGroupData)}</div>
            <div class="field-position" style="top: ${parseInt(String(nomTop)) + 2 * parseInt(String(fieldSpacing))}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${formData.residence}</div>
            <div class="field-position" style="top: ${parseInt(String(nomTop)) + 3 * parseInt(String(fieldSpacing))}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${formData.destination}</div>
            <div class="field-position" style="top: ${parseInt(String(nomTop)) + 4 * parseInt(String(fieldSpacing))}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${formData.motif}</div>
            <div class="field-position" style="top: ${parseInt(String(nomTop)) + 5 * parseInt(String(fieldSpacing))}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${transportText}</div>
            <div class="field-position" style="top: ${parseInt(String(nomTop)) + 6 * parseInt(String(fieldSpacing))}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${formData.dateDepart ? formatDate(formData.dateDepart) : ""}</div>
            <div class="field-position" style="top: ${parseInt(String(nomTop)) + 7 * parseInt(String(fieldSpacing))}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${formData.dateRetour ? formatDate(formData.dateRetour) : ""}</div>
            <div class="field-position" style="top: ${signatairePosTop}mm; left: ${signatairePosLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${formData.signataire || ""}</div>
            <div class="field-position" style="top: ${datePosTop}mm; left: ${datePosLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${formData.date ? formatDate(formData.date) : ""}</div>
          </div>
        </div>
      `;
    });

    addToHistory("OM");

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ordres de Mission</title>
            <style>
              @media print {
                body { margin: 0; padding: 0; }
                .print-area { width: 210mm; height: 297mm; position: relative; page-break-after: always; }
                .print-content { position: absolute; width: 100%; height: 100%; }
                .field-position { position: absolute; }
                @page {
                  margin: 0;
                  size: A4;
                }
                @page :first {
                  margin-top: 0;
                }
                @page :left {
                  margin-left: 0;
                }
                @page :right {
                  margin-right: 0;
                }
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      toast.error("Impossible d'ouvrir la fenêtre d'impression", {
        description: "Veuillez autoriser les fenêtres popup pour ce site.",
      });
    }
  };

  const handlePartialPrint = () => {
    if (selectedNames.length === 0) {
      toast.error("Aucun technicien sélectionné", {
        description:
          "Veuillez sélectionner au moins un technicien pour imprimer un ordre de mission.",
      });
      return;
    }

    setSelectedForPrint([]);
    setShowPartialPrintDialog(true);
  };

  const printSelectedOrders = () => {
    if (selectedForPrint.length === 0) {
      toast.error("Aucun technicien sélectionné pour l'impression", {
        description: "Veuillez sélectionner au moins un technicien.",
      });
      return;
    }

    const selectedMembers = orderedSelectedNames.filter((member) =>
      selectedForPrint.includes(member.name),
    );

    // Obtenir les paramètres de mise en page
    const nomTop = settings.nomTop;
    const nomLeft = settings.nomLeft;
    const fieldSpacing = settings.fieldSpacing;
    const fontFamily = settings.fontFamily;
    const fontSize = settings.fontSize;
    const signatairePosTop = settings.signatairePosTop;
    const signatairePosLeft = settings.signatairePosLeft;
    const datePosTop = settings.datePosTop;
    const datePosLeft = settings.datePosLeft;
    const fontWeight = settings.omBoldEnabled ? "bold" : "normal";

    let printContent = "";
    selectedMembers.forEach((item) => {
      // Créer le texte du transport avec matricule si nécessaire
      const transportText =
        formData.transport === "Véhicule personnel" && formData.matricule
          ? `${formData.transport} (${formData.matricule})`
          : formData.transport;

      printContent += `
        <div class="print-area">
          <div class="print-content">
            <div class="field-position" style="top: ${nomTop}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${item.name}</div>
            <div class="field-position" style="top: ${parseInt(String(nomTop)) + parseInt(String(fieldSpacing))}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${getEmploymentForName(item.name, currentGroupData)}</div>
            <div class="field-position" style="top: ${parseInt(String(nomTop)) + 2 * parseInt(String(fieldSpacing))}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${formData.residence}</div>
            <div class="field-position" style="top: ${parseInt(String(nomTop)) + 3 * parseInt(String(fieldSpacing))}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${formData.destination}</div>
            <div class="field-position" style="top: ${parseInt(String(nomTop)) + 4 * parseInt(String(fieldSpacing))}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${formData.motif}</div>
            <div class="field-position" style="top: ${parseInt(String(nomTop)) + 5 * parseInt(String(fieldSpacing))}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${transportText}</div>
            <div class="field-position" style="top: ${parseInt(String(nomTop)) + 6 * parseInt(String(fieldSpacing))}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${formData.dateDepart ? formatDate(formData.dateDepart) : ""}</div>
            <div class="field-position" style="top: ${parseInt(String(nomTop)) + 7 * parseInt(String(fieldSpacing))}mm; left: ${nomLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${formData.dateRetour ? formatDate(formData.dateRetour) : ""}</div>
            <div class="field-position" style="top: ${signatairePosTop}mm; left: ${signatairePosLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${formData.signataire || ""}</div>
            <div class="field-position" style="top: ${datePosTop}mm; left: ${datePosLeft}mm; font-family: ${fontFamily}; font-size: ${fontSize}pt; font-weight: ${fontWeight}">${formData.date ? formatDate(formData.date) : ""}</div>
          </div>
        </div>
      `;
    });

    addToHistory("OM");

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ordres de Mission Sélectionnés</title>
            <style>
              @media print {
                body { margin: 0; padding: 0; }
                .print-area { width: 210mm; height: 297mm; position: relative; page-break-after: always; }
                .print-content { position: absolute; width: 100%; height: 100%; }
                .field-position { position: absolute; }
                @page {
                  margin: 0;
                  size: A4;
                }
                @page :first {
                  margin-top: 0;
                }
                @page :left {
                  margin-left: 0;
                }
                @page :right {
                  margin-right: 0;
                }
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      toast.error("Impossible d'ouvrir la fenêtre d'impression", {
        description: "Veuillez autoriser les fenêtres popup pour ce site.",
      });
    }

    setShowPartialPrintDialog(false);
  };

  const toggleSelectAll = () => {
    if (selectedForPrint.length === orderedSelectedNames.length) {
      setSelectedForPrint([]);
    } else {
      setSelectedForPrint(orderedSelectedNames.map((member) => member.name));
    }
  };

  const toggleMemberSelection = (memberName: string) => {
    setSelectedForPrint((prev) =>
      prev.includes(memberName)
        ? prev.filter((name) => name !== memberName)
        : [...prev, memberName],
    );
  };

  const exportListToExcel = () => {
    if (selectedNames.length === 0) {
      toast.error("Aucun technicien sélectionné", {
        description:
          "Veuillez sélectionner au moins un technicien pour exporter une liste.",
      });
      return;
    }

    // Fonction pour extraire nom et prénom
    const parseFullName = (fullName: string) => {
      const parts = fullName.trim().split(" ");
      if (parts.length >= 2) {
        const lastName = parts[0];
        const firstName = parts.slice(1).join(" ");
        return { lastName, firstName };
      }
      return { lastName: fullName, firstName: "" };
    };

    // Créer les données Excel
    const excelData: any[] = [];

    // En-tête du document
    excelData.push(["LISTE DES TECHNICIENS POUR LA RETRANSMISSION DE"]);
    excelData.push([""]); // Ligne vide
    excelData.push(["ÉVÉNEMENT :", formData.motif || "ACTIVITÉ OFFICIELLE"]);
    excelData.push(["LIEU :", formData.destination || "AÉROPORT D'ALGER"]);
    excelData.push([
      "DATE :",
      `DU ${formData.dateDepart ? formatDate(formData.dateDepart) : ""} AU ${formData.dateRetour ? formatDate(formData.dateRetour) : ""}`,
    ]);
    excelData.push([""]); // Ligne vide

    // Fonction pour ajouter les membres à Excel
    const addMembersToExcel = (members: any[]) => {
      members.forEach((item) => {
        const { lastName, firstName } = parseFullName(item.name);
        const employment = getEmploymentForName(item.name, currentGroupData);
        excelData.push([
          lastName.toUpperCase(),
          firstName.toUpperCase(),
          employment,
        ]);
      });
    };

    // Bloc 1 : HD1–HD5 + DOP + Autres + Machinistes (sans bandeaux)
    addMembersToExcel(hdMembers);
    addMembersToExcel(dopMembers);
    addMembersToExcel(autresMembers);
    addMembersToExcel(machinistesMembers);

    // Bloc 2 : ÉCLAIRAGE
    if (eclairageMembers.length > 0) {
      excelData.push(["ÉCLAIRAGE"]);
      addMembersToExcel(eclairageMembers);
    }

    // Bloc 3 : FH = TRANSMISSION
    if (fhMembers.length > 0) {
      excelData.push(["TRANSMISSION"]);
      addMembersToExcel(fhMembers);
    }

    // Bloc 4 : CHAUFFEURS
    if (chauffeursMembers.length > 0) {
      excelData.push(["CHAUFFEURS"]);
      addMembersToExcel(chauffeursMembers);
    }

    // Bloc 5 : TDA
    if (tdaMembers.length > 0) {
      excelData.push(["TDA"]);
      addMembersToExcel(tdaMembers);
    }

    // Bloc 6 : FIXE
    if (fixeMembers.length > 0) {
      excelData.push(["FIXE"]);
      addMembersToExcel(fixeMembers);
    }

    // Créer le workbook et la worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Ajouter la worksheet au workbook
    XLSX.utils.book_append_sheet(wb, ws, "Liste Imprimable");

    // Télécharger le fichier
    XLSX.writeFile(wb, "liste_imprimable.xlsx");

    toast.success("Liste exportée avec succès", {
      description: "Le fichier liste_imprimable.xlsx a été téléchargé.",
    });
  };

  const printList = () => {
    if (selectedNames.length === 0) {
      toast.error("Aucun technicien sélectionné", {
        description:
          "Veuillez sélectionner au moins un technicien pour imprimer une liste.",
      });
      return;
    }

    // ✅ Get dynamic section header settings from settings - FIXED
    const fontFamily = settings.listFontFamily;
    const fontSize = settings.listFontSize;
    const marginTop = settings.listMarginTop;
    const marginLeft = settings.listMarginLeft;
    const fontWeight = settings.listBoldEnabled ? "bold" : "normal";
    const columnSpacing = settings.listColumnGap || 24;
    const sectionHeaderHeight = settings.listSectionHeaderHeight || 32;
    const sectionTitleSize = settings.listSectionTitleSize || 14;
    const rowSpacing = settings.listRowSpacing || 6;
    const titleVerticalPosition = settings.listTitleVerticalPosition || 20;

    // Fonction pour extraire nom et prénom
    const parseFullName = (fullName: string) => {
      const parts = fullName.trim().split(" ");
      if (parts.length >= 2) {
        const lastName = parts[0];
        const firstName = parts.slice(1).join(" ");
        return { lastName, firstName };
      }
      return { lastName: fullName, firstName: "" };
    };

    // En-tête du document avec titre séparé
    let content = `
      <div class="title-section">
        <div class="title">LISTE DES TECHNICIENS POUR LA RETRANSMISSION DE</div>
      </div>
      <div class="header-section">
        <div class="info-row">
          <span class="label">ÉVÉNEMENT :</span>
          <span class="value">${formData.motif || "ACTIVITÉ OFFICIELLE"}</span>
        </div>
        <div class="info-row">
          <span class="label">LIEU :</span>
          <span class="value">${formData.destination || "AÉROPORT D'ALGER"}</span>
        </div>
        <div class="info-row">
          <span class="label">DATE :</span>
          <span class="value">DU ${formData.dateDepart ? formatDate(formData.dateDepart) : ""} AU ${formData.dateRetour ? formatDate(formData.dateRetour) : ""}</span>
        </div>
      </div>
    `;

    // ✅ Bloc 1 : HD1–HD5 + DOP + Autres + Machinistes (sans bandeaux)
    const renderMembersToHTML = (members: any[]) => {
      return members
        .map((item) => {
          const { lastName, firstName } = parseFullName(item.name);
          const employment = getEmploymentForName(item.name, currentGroupData);

          return `
          <div class="technician-row">
            <div class="col-name">${lastName}</div>
            <div class="col-firstname">${firstName.toUpperCase()}</div>
            <div class="col-position">${employment}</div>
          </div>
        `;
        })
        .join("");
    };

    content += renderMembersToHTML(hdMembers);
    content += renderMembersToHTML(dopMembers);
    content += renderMembersToHTML(autresMembers);
    content += renderMembersToHTML(machinistesMembers);

    // ✅ Bloc 2 : ÉCLAIRAGE
    if (eclairageMembers.length > 0) {
      content += `<div class="section-header">ÉCLAIRAGE</div>`;
      content += renderMembersToHTML(eclairageMembers);
    }

    // ✅ Bloc 3 : FH = TRANSMISSION
    if (fhMembers.length > 0) {
      content += `<div class="section-header">TRANSMISSION</div>`;
      content += renderMembersToHTML(fhMembers);
    }

    // ✅ Bloc 4 : CHAUFFEURS
    if (chauffeursMembers.length > 0) {
      content += `<div class="section-header">CHAUFFEURS</div>`;
      content += renderMembersToHTML(chauffeursMembers);
    }

    // ✅ Bloc 5 : TDA
    if (tdaMembers.length > 0) {
      content += `<div class="section-header">TDA</div>`;
      content += renderMembersToHTML(tdaMembers);
    }

    // ✅ Bloc 6 : FIXE
    if (fixeMembers.length > 0) {
      content += `<div class="section-header">FIXE</div>`;
      content += renderMembersToHTML(fixeMembers);
    }

    addToHistory("List");

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Liste des Techniciens</title>
            <style>
              body {
                font-family: ${fontFamily};
                font-size: ${fontSize}pt;
                margin: 0;
                padding: ${marginTop}mm ${marginLeft}mm;
                font-weight: ${fontWeight};
                color: #000;
              }
              
              .title-section {
                margin-bottom: ${titleVerticalPosition}px;
              }
              
              .title {
                font-weight: bold;
                font-size: ${fontSize + 2}pt;
                text-align: center;
                text-decoration: underline;
              }
              
              .header-section {
                margin-top: ${titleVerticalPosition}px;
                margin-bottom: 8px;
                border-bottom: 2px solid #000;
                padding-bottom: 5px;
              }
              
              .info-row {
                display: flex;
                margin: 0;
                margin-bottom: 2px;
                font-weight: bold;
              }
              
              .label {
                width: 120px;
                flex-shrink: 0;
              }
              
              .value {
                flex: 1;
              }
              
              .section-header {
                background-color: #000 !important;
                color: #fff !important;
                padding: ${sectionHeaderHeight === 0 ? "0" : "2px 8px"};
                font-weight: bold;
                font-size: ${sectionTitleSize}px;
                height: ${sectionHeaderHeight === 0 ? "12px" : sectionHeaderHeight + "px"};
                line-height: ${sectionHeaderHeight === 0 ? "12px" : sectionHeaderHeight + "px"};
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                margin: 2px 0 1px 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                box-shadow: none !important;
              }
              
              .technician-row {
                display: flex;
                padding: ${rowSpacing}px 0;
                font-weight: bold;
                margin: 0;
              }
              
              .col-name {
                width: 30%;
                padding-right: ${columnSpacing}px;
                flex-shrink: 0;
              }
              
              .col-firstname {
                width: 30%;
                padding-right: ${columnSpacing}px;
                flex-shrink: 0;
              }
              
              .col-position {
                width: 40%;
                flex: 1;
              }
              

              
              @media print {
                body { 
                  margin: 0;
                  padding: ${marginTop}mm ${marginLeft}mm;
                }
                
                .section-header {
                  background-color: #000 !important;
                  color: #fff !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  height: ${sectionHeaderHeight === 0 ? "12px" : sectionHeaderHeight + "px"};
                  line-height: ${sectionHeaderHeight === 0 ? "12px" : sectionHeaderHeight + "px"};
                  font-size: ${sectionTitleSize}px;
                  padding: ${sectionHeaderHeight === 0 ? "0" : "2px 8px"};
                  margin: 2px 0 1px 0;
                }
                
                .technician-row {
                  padding: ${rowSpacing}px 0;
                  margin: 0;
                }
                
                @page {
                  margin: 0;
                  size: A4;
                }
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      toast.error("Impossible d'ouvrir la fenêtre d'impression", {
        description: "Veuillez autoriser les fenêtres popup pour ce site.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imprimer</CardTitle>
        <CardDescription>Générez et imprimez les documents</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Mission Orders Group */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Ordres de Mission
          </h3>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              className="flex items-center gap-3 px-6 py-3 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white border-0"
              onClick={printMultipleOrders}
            >
              <Printer className="h-5 w-5" />
              Imprimer OM
            </Button>
            <Button
              className="flex items-center gap-3 px-6 py-3 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
              onClick={handlePartialPrint}
            >
              <CheckSquare className="h-5 w-5" />
              Imprimer des OM sélectionnés
            </Button>
          </div>
        </div>

        {/* Lists Group */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Listes
          </h3>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              className="flex items-center gap-3 px-6 py-3 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 bg-green-600 hover:bg-green-700 text-white border-0"
              onClick={printList}
            >
              <Printer className="h-5 w-5" />
              Imprimer la liste
            </Button>
            <Button
              className="flex items-center gap-3 px-6 py-3 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
              onClick={exportListToExcel}
            >
              <FileSpreadsheet className="h-5 w-5" />
              Exporter la liste imprimable (Excel)
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog
        open={showPartialPrintDialog}
        onOpenChange={setShowPartialPrintDialog}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sélectionner les techniciens à imprimer</DialogTitle>
            <DialogDescription>
              Choisissez les techniciens pour lesquels vous souhaitez imprimer
              les ordres de mission.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedForPrint.length} / {orderedSelectedNames.length}{" "}
                sélectionnés
              </span>
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                {selectedForPrint.length === orderedSelectedNames.length
                  ? "Tout désélectionner"
                  : "Tout sélectionner"}
              </Button>
            </div>

            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {orderedSelectedNames.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                >
                  <Checkbox
                    id={`member-${member.name}`}
                    checked={selectedForPrint.includes(member.name)}
                    onCheckedChange={() => toggleMemberSelection(member.name)}
                  />
                  <label
                    htmlFor={`member-${member.name}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    <span className="font-medium">{member.name}</span>
                    <span className="text-gray-500 ml-2">({member.group})</span>
                    <span className="text-gray-400 ml-2 text-xs">
                      {getEmploymentForName(member.name, currentGroupData)}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPartialPrintDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={printSelectedOrders}
              disabled={selectedForPrint.length === 0}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimer {selectedForPrint.length} OM
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PrintPanel;
