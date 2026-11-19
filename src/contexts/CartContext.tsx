import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import * as cartService from '../services/cartService';
import type { CartItemResponse, CartItemStorageKey, CartResponse } from '../types/cart';

interface CartContextValue {
  cartItems: CartItemResponse[];
  totalUnits: number;
  grandTotal: number;
  loading: boolean;
  syncNotice: string | null;
  clearSyncNotice: () => void;
  addToCart: (variantId: number, quantity: number) => Promise<void>;
  updateQuantity: (variantId: number, newQuantity: number) => Promise<void>;
  removeItem: (variantId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = 'c&f_cart_keys';
const SYNC_NOTICE = 'Algunos productos se actualizaron o se retiraron del carrito por cambios de disponibilidad o stock.';

const toCartItemStorageKey = (value: unknown): CartItemStorageKey | null => {
  if (typeof value !== 'object' || value === null) return null;
  const item = value as Record<string, unknown>;
  const rawVariantId = item.variantId ?? item.id_variant;
  const variantId = typeof rawVariantId === 'string' || typeof rawVariantId === 'number'
    ? Number(rawVariantId)
    : Number.NaN;
  const quantity = typeof item.quantity === 'number' ? item.quantity : Number.NaN;

  if (
    !Number.isSafeInteger(variantId)
    || variantId <= 0
    || !Number.isSafeInteger(quantity)
    || quantity <= 0
    || quantity > 10000
  ) return null;

  return { variantId, quantity };
};

const readStoredCartKeys = (): CartItemStorageKey[] => {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  if (raw === null) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('El carrito anónimo guardado no es una lista.');
    }

    const validKeys = parsed
      .map(toCartItemStorageKey)
      .filter((item): item is CartItemStorageKey => item !== null);

    if (validKeys.length !== parsed.length) {
      console.error('Se descartaron elementos inválidos del carrito anónimo guardado.');
    }
    writeStoredCartKeys(validKeys);

    return validKeys;
  } catch (error) {
    console.error('No se pudo leer el carrito anónimo guardado; se reemplazará por uno vacío.', error);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
    return [];
  }
};

const writeStoredCartKeys = (items: CartItemStorageKey[]): void => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

const CartProvider = ({ children }: { children: ReactNode }) => {
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error('CartProvider must be used within an AuthProvider');

  const { user, isLoading: authLoading } = authContext;
  const userRef = useRef(user);
  const authLoadingRef = useRef(authLoading);
  const requestVersion = useRef(0);
  userRef.current = user;
  authLoadingRef.current = authLoading;

  const [cartItems, setCartItems] = useState<CartItemResponse[]>([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const applyCartResponse = useCallback((response: CartResponse) => {
    setCartItems(response.items);
    setTotalUnits(response.totalUnits);
    setGrandTotal(response.grandTotal);
  }, []);

  const syncVisitorCart = useCallback(async (
    items: CartItemStorageKey[],
    expectedVersion?: number,
  ) => {
    const response = await cartService.syncAnonymousCart(items);
    if (
      userRef.current !== null
      || authLoadingRef.current
      || (expectedVersion !== undefined && requestVersion.current !== expectedVersion)
    ) return;

    if (response.itemsPurged || response.itemsAdjusted) {
      writeStoredCartKeys(response.items.map(({ variantId, quantity }) => ({ variantId, quantity })));
      setSyncNotice(SYNC_NOTICE);
    } else {
      setSyncNotice(null);
    }

    applyCartResponse(response);
  }, [applyCartResponse]);

  useEffect(() => {
    const currentVersion = ++requestVersion.current;
    if (authLoading) {
      setLoading(true);
      return () => {
        requestVersion.current += 1;
      };
    }

    setLoading(true);
    setCartItems([]);
    setTotalUnits(0);
    setGrandTotal(0);
    setSyncNotice(null);

    const loadCart = async () => {
      try {
        if (user) {
          const response = await cartService.getMyCart();
          if (requestVersion.current === currentVersion && userRef.current !== null) {
            applyCartResponse(response);
          }
        } else {
          const storedKeys = readStoredCartKeys();
          await syncVisitorCart(storedKeys, currentVersion);
        }
      } catch (error) {
        if (requestVersion.current === currentVersion) {
          console.error('No se pudo cargar el carrito.', error);
        }
      } finally {
        if (requestVersion.current === currentVersion) {
          setLoading(false);
        }
      }
    };

    void loadCart();
    return () => {
      requestVersion.current += 1;
    };
  }, [applyCartResponse, authLoading, syncVisitorCart, user]);

  const clearSyncNotice = useCallback(() => setSyncNotice(null), []);

  const addToCart = useCallback(async (variantId: number, quantity: number) => {
    if (!Number.isSafeInteger(variantId) || variantId <= 0
      || !Number.isSafeInteger(quantity) || quantity <= 0 || quantity > 10000) {
      throw new Error('La variante debe ser positiva y la cantidad debe estar entre 1 y 10.000.');
    }

    setLoading(true);
    try {
      if (user) {
        const response = await cartService.addCartItem({ variantId, quantity });
        if (userRef.current?.id === user.id) {
          applyCartResponse(response);
          setSyncNotice(null);
        }
        return;
      }

      const storedKeys = readStoredCartKeys();
      const existing = storedKeys.find((item) => item.variantId === variantId);
      const updatedKeys = existing
        ? storedKeys.map((item) => item.variantId === variantId
          ? { ...item, quantity: item.quantity + quantity }
          : item)
        : [...storedKeys, { variantId, quantity }];
      if (updatedKeys.some((item) => item.quantity > 10000)) {
        throw new Error('La cantidad total de una variante no puede superar las 10.000 unidades.');
      }
      writeStoredCartKeys(updatedKeys);
      await syncVisitorCart(updatedKeys);
    } finally {
      setLoading(false);
    }
  }, [applyCartResponse, syncVisitorCart, user]);

  const updateQuantity = useCallback(async (variantId: number, newQuantity: number) => {
    if (!Number.isSafeInteger(newQuantity) || newQuantity <= 0) return;
    if (newQuantity > 10000) {
      throw new Error('La cantidad no puede superar las 10.000 unidades.');
    }

    setLoading(true);
    try {
      if (user) {
        const response = await cartService.updateCartItemQuantity(variantId, { quantity: newQuantity });
        if (userRef.current?.id === user.id) {
          applyCartResponse(response);
          setSyncNotice(null);
        }
        return;
      }

      const updatedKeys = readStoredCartKeys().map((item) => item.variantId === variantId
        ? { ...item, quantity: newQuantity }
        : item);
      writeStoredCartKeys(updatedKeys);
      await syncVisitorCart(updatedKeys);
    } finally {
      setLoading(false);
    }
  }, [applyCartResponse, syncVisitorCart, user]);

  const removeItem = useCallback(async (variantId: number) => {
    setLoading(true);
    try {
      if (user) {
        await cartService.removeCartItem(variantId);
        if (userRef.current?.id === user.id) {
          const remainingItems = cartItems.filter((item) => item.variantId !== variantId);
          setCartItems(remainingItems);
          setTotalUnits(remainingItems.reduce((total, item) => total + item.quantity, 0));
          setGrandTotal(remainingItems.reduce((total, item) => total + item.subtotal, 0));
          setSyncNotice(null);
        }
        return;
      }

      const updatedKeys = readStoredCartKeys().filter((item) => item.variantId !== variantId);
      writeStoredCartKeys(updatedKeys);
      await syncVisitorCart(updatedKeys);
    } finally {
      setLoading(false);
    }
  }, [cartItems, syncVisitorCart, user]);

  const clearCart = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        await cartService.clearMyCart();
        if (userRef.current?.id === user.id) {
          setCartItems([]);
          setTotalUnits(0);
          setGrandTotal(0);
          setSyncNotice(null);
        }
        return;
      }

      writeStoredCartKeys([]);
      await syncVisitorCart([]);
    } finally {
      setLoading(false);
    }
  }, [syncVisitorCart, user]);

  const value: CartContextValue = {
    cartItems,
    totalUnits,
    grandTotal,
    loading,
    syncNotice,
    clearSyncNotice,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export { CartContext, CartProvider };
