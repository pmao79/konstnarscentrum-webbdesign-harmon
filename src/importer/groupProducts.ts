// Interface för en rå produkt från Excel
interface RawProduct {
  artikelnummer: string;
  namn: string;
  pris: number;
  ean: string;
  varumärke: string;
}

// Interface för en produktvariant
interface Variant {
  artikelnummer: string;
  namn: string;
  pris: number;
  ean: string;
}

// Interface för en grupperad produkt
interface GroupedProduct {
  huvudnamn: string;
  varumärke: string;
  beskrivning: string;
  varianter: Variant[];
}

/**
 * Hittar den gemensamma delen av två produktnamn
 * @param name1 Första produktnamnet
 * @param name2 Andra produktnamnet
 * @returns Den gemensamma delen av namnen
 */
function findCommonNamePart(name1: string, name2: string): string {
  const words1 = name1.split(' ');
  const words2 = name2.split(' ');
  let commonPart = '';

  for (let i = 0; i < Math.min(words1.length, words2.length); i++) {
    if (words1[i] === words2[i]) {
      commonPart += (commonPart ? ' ' : '') + words1[i];
    } else {
      break;
    }
  }

  return commonPart;
}

/**
 * Grupperar produkter baserat på gemensamma namn
 * @param rawProducts Lista av råa produkter från Excel
 * @returns Lista av grupperade produkter
 */
export function groupProducts(rawProducts: RawProduct[]): GroupedProduct[] {
  // Skapa en kopia av produkterna för att inte modifiera originaldatan
  const products = [...rawProducts];
  const groupedProducts: GroupedProduct[] = [];

  while (products.length > 0) {
    const currentProduct = products[0];
    let commonName = currentProduct.namn;
    let group: RawProduct[] = [currentProduct];
    
    // Hitta produkter som delar samma namnprefix
    for (let i = 1; i < products.length; i++) {
      const nextProduct = products[i];
      const newCommonName = findCommonNamePart(commonName, nextProduct.namn);
      
      // Om den gemensamma delen är tillräckligt lång för att vara meningsfull
      if (newCommonName.length >= 3 && newCommonName.length < commonName.length) {
        commonName = newCommonName;
        group.push(nextProduct);
        products.splice(i, 1);
        i--; // Justera index efter borttagning
      }
    }

    // Skapa en grupperad produkt
    const groupedProduct: GroupedProduct = {
      huvudnamn: commonName.trim(),
      varumärke: currentProduct.varumärke,
      beskrivning: '',
      varianter: group.map(product => ({
        artikelnummer: product.artikelnummer,
        namn: product.namn.replace(commonName, '').trim(),
        pris: product.pris,
        ean: product.ean
      }))
    };

    groupedProducts.push(groupedProduct);
    products.shift(); // Ta bort den första produkten som redan är grupperad
  }

  return groupedProducts;
}

// Exempel på användning:
/*
const rawProducts: RawProduct[] = [
  {
    artikelnummer: "2520103",
    namn: "Barnfärg Temperapuck 57x19mm Blå 6-p",
    pris: 49,
    ean: "1234567890123",
    varumärke: "Leverantör A"
  },
  {
    artikelnummer: "2520104",
    namn: "Barnfärg Temperapuck 57x19mm Ljusblå 6-p",
    pris: 49,
    ean: "1234567890124",
    varumärke: "Leverantör A"
  }
];

const grouped = groupProducts(rawProducts);
console.log(grouped);
*/ 