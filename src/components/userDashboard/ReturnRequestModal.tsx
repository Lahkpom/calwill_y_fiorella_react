import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createReturnForOrder } from '../../services/saleReturnService';
import type { SaleResponse } from '../../types/sale';
import type {
  ReturnReason,
  ReturnResolution,
  SaleReturnCreateRequest,
  SaleReturnItemRequest,
} from '../../types/saleReturn';
import './MyOrders.scss';

interface ReturnRequestModalProps {
  sale: SaleResponse;
  onClose: () => void;
  onSuccess: () => void;
}

const REASONS: { value: ReturnReason; label: string }[] = [
  { value: 'ARREPENTIMIENTO_LEGAL', label: 'Arrepentimiento legal' },
  { value: 'CAMBIO_TALLE', label: 'Cambio de talle' },
  { value: 'DEFECTO_FABRICACION', label: 'Defecto de fabricación' },
];

const RESOLUTIONS: { value: ReturnResolution; label: string }[] = [
  { value: 'REEMBOLSO_DINERO', label: 'Reembolso de dinero' },
  { value: 'CAMBIO_PRODUCTO', label: 'Cambio de producto' },
  { value: 'CREDITO_TIENDA', label: 'Crédito en tienda' },
];

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Ocurrió un error inesperado. Intentá nuevamente.';

const ReturnRequestModal = ({ sale, onClose, onSuccess }: ReturnRequestModalProps) => {
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>({});
  const [returnReason, setReturnReason] = useState<ReturnReason | ''>('');
  const [returnResolution, setReturnResolution] = useState<ReturnResolution | ''>('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, submitting]);

  const toggleItem = (saleItemId: number, checked: boolean, quantity: number) => {
    setSelectedItems((current) => {
      const next = { ...current };
      if (checked) next[saleItemId] = quantity;
      else delete next[saleItemId];
      return next;
    });
  };

  const setItemQuantity = (saleItemId: number, quantity: number) => {
    setSelectedItems((current) => ({ ...current, [saleItemId]: quantity }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const items: SaleReturnItemRequest[] = Object.entries(selectedItems).map(([saleItemId, quantity]) => ({
      saleItemId: Number(saleItemId),
      quantity,
    }));

    if (items.length === 0) {
      setError('Seleccioná al menos un producto para solicitar la devolución.');
      return;
    }
    if (!returnReason || !returnResolution || !customerNotes.trim()) {
      setError('Completá el motivo, la resolución y la explicación de la solicitud.');
      return;
    }

    const payload: SaleReturnCreateRequest = {
      returnReason,
      returnResolution,
      customerNotes: customerNotes.trim(),
      items,
    };
    setSubmitting(true);
    setError(null);
    try {
      await createReturnForOrder(sale.saleId, payload);
      onSuccess();
      onClose();
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="my-orders__modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        className="my-orders__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="return-request-title"
      >
        <header className="my-orders__modal-header">
          <div>
            <p className="my-orders__eyebrow mb-1">Orden #{sale.saleId.slice(-8).toUpperCase()}</p>
            <h2 className="my-orders__modal-title" id="return-request-title">Solicitar devolución</h2>
          </div>
          <button type="button" className="my-orders__icon-button" onClick={onClose} aria-label="Cerrar solicitud">
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="my-orders__modal-body">
            {error && <div className="my-orders__alert my-orders__alert--error" role="alert">{error}</div>}

            <fieldset className="my-orders__form-section">
              <legend className="my-orders__section-title">Productos a devolver</legend>
              <div className="my-orders__return-items">
                {sale.items.map((item) => {
                  const quantity = selectedItems[item.saleItemId];
                  const checked = quantity !== undefined;
                  return (
                    <div className="my-orders__return-item" key={item.saleItemId}>
                      <label className="my-orders__check-label">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => toggleItem(item.saleItemId, event.target.checked, 1)}
                        />
                        <span>
                          <strong>{item.productName}</strong>
                          <small>
                            {[item.variantSize, item.colorName].filter(Boolean).join(' · ') || 'Variante no especificada'}
                            {' · '}Compraste {item.quantity}
                          </small>
                        </span>
                      </label>
                      {checked && (
                        <label className="my-orders__quantity-field">
                          Cantidad
                          <input
                            type="number"
                            min={1}
                            max={item.quantity}
                            value={quantity}
                            onChange={(event) => setItemQuantity(
                              item.saleItemId,
                              Math.min(item.quantity, Math.max(1, Number(event.target.value) || 1)),
                            )}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </fieldset>

            <div className="my-orders__form-section">
              <label className="my-orders__field">
                Motivo de la devolución
                <select
                  required
                  value={returnReason}
                  onChange={(event) => setReturnReason(event.target.value as ReturnReason | '')}
                >
                  <option value="">Seleccioná un motivo</option>
                  {REASONS.map(({ value, label }) => <option value={value} key={value}>{label}</option>)}
                </select>
              </label>
              <label className="my-orders__field">
                Resolución deseada
                <select
                  required
                  value={returnResolution}
                  onChange={(event) => setReturnResolution(event.target.value as ReturnResolution | '')}
                >
                  <option value="">Seleccioná una resolución</option>
                  {RESOLUTIONS.map(({ value, label }) => <option value={value} key={value}>{label}</option>)}
                </select>
              </label>
              <label className="my-orders__field">
                Contanos qué pasó
                <textarea
                  required
                  maxLength={1000}
                  rows={4}
                  value={customerNotes}
                  onChange={(event) => setCustomerNotes(event.target.value)}
                  placeholder="Describí el motivo de tu solicitud"
                />
                <small className="my-orders__muted">{customerNotes.length}/1000 caracteres</small>
              </label>
            </div>
          </div>

          <footer className="my-orders__modal-footer">
            <button type="button" className="my-orders__button my-orders__button--secondary" onClick={onClose} disabled={submitting}>
              Volver
            </button>
            <button type="submit" className="my-orders__button my-orders__button--primary" disabled={submitting}>
              {submitting ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};

export default ReturnRequestModal;
