import { useState } from 'react';
import type { ReactEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import { formatCurrency } from '../../utils/helpers';
import EmptyCart from './EmptyCart';
import Loader from '../loader/Loader';
import './Cart.scss';

const Cart = () => {
  const navigate = useNavigate();
  const [actionError, setActionError] = useState<string | null>(null);
  const {
    cartItems,
    totalUnits,
    grandTotal,
    loading,
    syncNotice,
    clearSyncNotice,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const handleCartAction = (action: () => Promise<void>) => {
    setActionError(null);
    void action().catch((error: unknown) => {
      setActionError(error instanceof Error ? error.message : 'No se pudo actualizar el carrito.');
    });
  };

  const handleImageError: ReactEventHandler<HTMLImageElement> = (event) => {
    event.currentTarget.style.opacity = '0.3';
  };

  if (loading) return <Loader />;

  return (
    <div className="cart-page">
      <div className="container">
        {syncNotice && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            {syncNotice}
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar aviso"
              onClick={clearSyncNotice}
            />
          </div>
        )}
        {actionError && (
          <div className="alert alert-danger" role="alert">
            {actionError}
          </div>
        )}
        {cartItems.length === 0 ? <EmptyCart /> : (
          <>
            <h1 className="cart-title">Tu carrito</h1>
            <p className="cart-subtitle">
              {totalUnits} {totalUnits === 1 ? 'producto' : 'productos'} seleccionados
            </p>

            <div className="row">
              <div className="col-12 col-lg-8">
                {cartItems.map((item) => {
                  const outOfStock = item.currentAvailableStock <= 0;

                  return (
                    <div
                      className={`cart-item${outOfStock ? ' cart-item--out-of-stock' : ''}`}
                      key={item.variantId}
                    >
                      <img
                        className="cart-item__image"
                        src={item.primaryImageUrl ?? undefined}
                        alt={item.productTitle}
                        onError={handleImageError}
                      />

                      <div className="cart-item__info">
                        <div className="cart-item__name">{item.productTitle}</div>
                        <div className="cart-item__variant">{item.attributesDescription}</div>
                        <div className="cart-item__sku">SKU: {item.variantSku}</div>
                        <div className="cart-item__price">
                          Precio unitario: {formatCurrency(item.unitPrice)}
                        </div>
                        {outOfStock && (
                          <div className="cart-item__stock-warning">Sin stock disponible</div>
                        )}
                        {item.wasAdjusted && (
                          <div className="cart-item__stock-warning">
                            La cantidad se ajustó al stock disponible.
                          </div>
                        )}
                      </div>

                      <div className="cart-item__controls">
                        <div className="cart-item__qty">
                          <button
                            aria-label="Reducir cantidad"
                            disabled={item.quantity <= 1 || outOfStock}
                            onClick={() => handleCartAction(
                              () => updateQuantity(item.variantId, item.quantity - 1),
                            )}
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            aria-label="Aumentar cantidad"
                            disabled={item.quantity >= item.currentAvailableStock || outOfStock}
                            onClick={() => handleCartAction(
                              () => updateQuantity(item.variantId, item.quantity + 1),
                            )}
                          >
                            +
                          </button>
                        </div>

                        <div className="cart-item__subtotal">
                          {outOfStock ? '—' : formatCurrency(item.subtotal)}
                        </div>

                        <button
                          className="cart-item__remove"
                          aria-label={`Eliminar ${item.productTitle} (Variante ${item.variantId}) del carrito`}
                          onClick={() => handleCartAction(() => removeItem(item.variantId))}
                          title="Eliminar del carrito"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="col-12 col-lg-4">
                <div className="cart-summary">
                  <div className="cart-summary__title">Resumen del pedido</div>

                  {cartItems.map((item) => (
                    <div className="cart-summary__row" key={item.variantId}>
                      <span>{item.productTitle} × {item.quantity}</span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}

                  <div className="cart-summary__row cart-summary__row--total">
                    <span>Total</span>
                    <span className="cart-summary__total-value">{formatCurrency(grandTotal)}</span>
                  </div>

                  <button
                    className="btn-checkout"
                    disabled={cartItems.some((item) => item.quantity > item.currentAvailableStock)}
                    onClick={() => navigate('/checkout', { state: { cartItems } })}
                  >
                    Iniciar compra
                  </button>

                  <button className="btn-clear" onClick={() => handleCartAction(clearCart)}>
                    Vaciar carrito
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
