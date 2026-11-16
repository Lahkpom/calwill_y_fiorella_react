import type { PublicProductVariant } from '../../../types/products';

interface ColorSelectorProps {
  availableColors: PublicProductVariant[];
  selectedColorId: number | null;
  onSelectedColor: (colorId: number) => void;
}

const ColorSelector = ({
  availableColors,
  selectedColorId,
  onSelectedColor,
}: ColorSelectorProps) => {
  if (availableColors.length === 0) return null;

  const selectedColor = availableColors.find((variant) => variant.colorId === selectedColorId);

  return (
    <div className="selector-group product__selector">
      <p className="product__selector-label">
        Color: <strong>{selectedColor?.colorName ?? 'Seleccioná un color'}</strong>
      </p>
      <div className="my-2 d-flex flex-wrap" role="group" aria-label="Filtrar por color">
        {availableColors.map((variant) => (
          <button
            key={variant.colorId}
            type="button"
            className={`product__color-swatch${selectedColorId === variant.colorId ? ' active' : ''}${variant.stock === 0 ? ' out-of-stock' : ''}`}
            aria-label={`${variant.colorName}${variant.stock === 0 ? ', sin stock' : ''}`}
            aria-pressed={selectedColorId === variant.colorId}
            title={`${variant.colorName}${variant.stock === 0 ? ' - Sin stock' : ''}`}
            onClick={() => onSelectedColor(variant.colorId)}
            style={{ backgroundColor: variant.colorCode }}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;
