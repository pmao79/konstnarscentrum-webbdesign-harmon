
export const extractMasterProductInfo = (productName: string, similarProducts: any[]) => {
  if (!productName || similarProducts.length === 0) return null;

  // Split products into words and find common prefix
  const words = similarProducts.map(p => p.name.split(' '));
  const minLength = Math.min(...words.map(w => w.length));
  
  let commonPrefix = [];
  for (let i = 0; i < minLength; i++) {
    const word = words[0][i];
    if (words.every(w => w[i] === word)) {
      commonPrefix.push(word);
    } else {
      break;
    }
  }

  // If we have a common prefix, use it as the master product name
  if (commonPrefix.length > 0) {
    const masterName = commonPrefix.join(' ');
    const variantName = productName.slice(masterName.length).trim();
    return {
      masterName,
      variantName
    };
  }

  return null;
};

export const groupProductsByMaster = (products: any[]) => {
  const groups = new Map();

  products.forEach(product => {
    const similarProducts = products.filter(p => 
      p.name.toLowerCase().startsWith(product.name.split(' ').slice(0, 3).join(' ').toLowerCase())
    );

    const masterInfo = extractMasterProductInfo(product.name, similarProducts);
    if (masterInfo) {
      const { masterName } = masterInfo;
      if (!groups.has(masterName)) {
        groups.set(masterName, []);
      }
      groups.get(masterName).push(product);
    }
  });

  return Array.from(groups.entries()).map(([masterName, variants]) => ({
    masterName,
    variants
  }));
};
