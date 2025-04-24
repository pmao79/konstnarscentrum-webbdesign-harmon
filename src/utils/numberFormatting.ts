
export const cleanNumericValue = (value: any): number => {
  if (value === undefined || value === null) return 0;
  
  let strValue = String(value);
  strValue = strValue.replace(',', '.');
  strValue = strValue.replace(/[^\d.]/g, '');
  
  const numValue = parseFloat(strValue);
  return isNaN(numValue) ? 0 : numValue;
};
