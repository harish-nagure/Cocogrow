import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";
const AppContext = createContext(null);
const CART_KEY = "cocogrow_cart",
  TOKEN_KEY = "cocogrow_token";
function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}
export function AppProvider({ children }) {
  const [user, setUser] = useState(null),
    [cart, setCart] = useState(readCart);
  useEffect(() => localStorage.setItem(CART_KEY, JSON.stringify(cart)), [cart]);
  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return;
    api
      .get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      });
  }, []);
  const addToCart = (item) =>
    setCart((c) => {
      if (item.type === "custom-mix")
        return [...c, { ...item, quantity: Number(item.quantity || 1) }];
      const i = c.findIndex(
        (x) => x.type !== "custom-mix" && x.productId === item.productId,
      );
      if (i < 0)
        return [...c, { ...item, quantity: Number(item.quantity || 1) }];
      return c.map((x, n) =>
        n === i
          ? {
              ...x,
              quantity: Number(x.quantity || 0) + Number(item.quantity || 1),
            }
          : x,
      );
    });
  const matches = (item, id) =>
    item.cartItemId === id || `product-${item.productId}` === id;
  const increaseQuantity = (id) =>
    setCart((c) =>
      c.map((x) =>
        matches(x, id) ? { ...x, quantity: Number(x.quantity || 1) + 1 } : x,
      ),
    );
  const decreaseQuantity = (id) =>
    setCart((c) =>
      c.map((x) =>
        matches(x, id)
          ? { ...x, quantity: Math.max(1, Number(x.quantity || 1) - 1) }
          : x,
      ),
    );
  const removeFromCart = (id) =>
    setCart((c) => c.filter((x) => !matches(x, id)));
  const updateCartQuantity = (id, q) =>
    setCart((c) =>
      c.map((x) =>
        matches(x, id) ? { ...x, quantity: Math.max(1, Number(q) || 1) } : x,
      ),
    );
  const clearCart = () => setCart([]);
  const subtotal = useMemo(
    () =>
      cart.reduce(
        (s, x) => s + Number(x.price || 0) * Number(x.quantity || 1),
        0,
      ),
    [cart],
  );
  const shipping = subtotal >= 999 ? 0 : 79,
    total = subtotal + shipping,
    itemCount = cart.reduce((s, x) => s + Number(x.quantity || 1), 0);
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setCart([]);
  };
  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        logout,
        cart,
        setCart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        subtotal,
        shipping,
        total,
        itemCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp must be used inside AppProvider.");
  return c;
}
