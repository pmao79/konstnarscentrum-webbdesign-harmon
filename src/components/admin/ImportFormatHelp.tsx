
import React from 'react';

interface ImportFormatHelpProps {
  columnMapping: "swedish" | "english";
}

export const ImportFormatHelp: React.FC<ImportFormatHelpProps> = ({ columnMapping }) => {
  return (
    <div className="border-t pt-4 text-sm">
      <h4 className="font-medium mb-2">Importformat</h4>
      {columnMapping === "swedish" ? (
        <>
          <p className="text-muted-foreground mb-2">
            Din Excel-fil följer detta format:
          </p>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>Artikelnummer (obligatorisk)</li>
            <li>Benämning (obligatorisk)</li>
            <li>Förp (används som lagerstatus)</li>
            <li>Enhet</li>
            <li>Cirkapris (obligatorisk)</li>
            <li>EAN</li>
            <li>Kod</li>
            <li>Varumärke (används som kategori/leverantör)</li>
            <li>Övrigt (används som beskrivning)</li>
          </ul>
        </>
      ) : (
        <>
          <p className="text-muted-foreground mb-2">
            Excelfilens första rad måste innehålla följande kolumner:
          </p>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>Article Number (obligatorisk)</li>
            <li>Product Name (obligatorisk)</li>
            <li>Description</li>
            <li>Price (obligatorisk)</li>
            <li>Stock Status</li>
            <li>Category</li>
            <li>Image URL</li>
            <li>Supplier</li>
          </ul>
        </>
      )}
    </div>
  );
};
