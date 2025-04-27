// Group products functionality will be implemented here 

interface RawProduct {
  Artikelnummer: string;
  Benämning: string;
  Varumärke: string;
  Netto: number;
  EAN: string;
  Övrigt: string;
}

interface Variant {
  artikelnummer: string;
  namn: string;
  pris: number;
  ean: string;
}

interface GroupedProduct {
  huvudnamn: string;
  varumärke: string;
  beskrivning: string;
  varianter: Variant[];
}

export function groupProducts(products: RawProduct[]): GroupedProduct[] {
  const groups: { [key: string]: GroupedProduct } = {};

  products.forEach((product) => {
    // Ta bort färg och extra detaljer för att hitta huvudproduktnamn
    const huvudnamn = product.Benämning.split(' ')[0]; // Förenklad logik, kan förbättras senare

    if (!groups[huvudnamn]) {
      groups[huvudnamn] = {
        huvudnamn,
        varumärke: product.Varumärke,
        beskrivning: product.Övrigt,
        varianter: [],
      };
    }

    groups[huvudnamn].varianter.push({
      artikelnummer: product.Artikelnummer,
      namn: product.Benämning,
      pris: product.Netto,
      ean: product.EAN,
    });
  });

  return Object.values(groups);
} 