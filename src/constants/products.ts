export const PRODUCT_CATEGORIES = ['CALZADO'] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const TARGET_GENDERS = [
  { value: 'NINIAS', label: 'Calzado para niñas' },
  { value: 'NINIOS', label: 'Calzado para niños' },
  { value: 'HOMBRES', label: 'Calzado para hombres' },
  { value: 'MUJERES', label: 'Calzado para mujeres' },
  { value: 'UNISEX', label: 'Calzado unisex' },
] as const;

export type TargetGender = (typeof TARGET_GENDERS)[number]['value'];

export const isTargetGender = (value: string): value is TargetGender =>
  TARGET_GENDERS.some((targetGender) => targetGender.value === value);
