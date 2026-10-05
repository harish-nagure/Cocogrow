import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useApp } from "../context/AppContext";
export default function Checkout() {
  const { cart, clearCart, user, subtotal, shipping, total } = useApp(),
    nav = useNavigate();
  const [address, setAddress] = useState({
    name: user?.name || "",
    phone: "",
    line: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD"),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState(false),
    [orderId, setOrderId] = useState("");
  const orderItems = useMemo(
    () =>
      cart.map((x) =>
        x.type === "custom-mix"
          ? {
              type: "custom-mix",
              customMixId: x.customMixId,
              quantity: Number(x.quantity || 1),
            }
          : {
              type: "product",
              productId: x.productId,
              quantity: Number(x.quantity || 1),
            },
      ),
    [cart],
  );
  const update = (field, value) =>
    setAddress((a) => ({ ...a, [field]: value }));
  const submit = async (e) => {
    e.preventDefault();
    if (!user) {
      nav("/login");
      return;
    }
    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const r = await api.post("/orders", {
        items: orderItems,
        shippingAddress: address,
        paymentMethod,
      });
      setOrderId(r.data.order.id);
      clearCart();
      setDone(true);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Unable to place your order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  if (done)
    return (
      <div className="success">
        <div>✓</div>
        <h1>Order placed.</h1>
        <p>
          Your CocoGrow order is on its way to becoming part of your garden.
        </p>
        {orderId && <small>Order #{orderId.slice(-7).toUpperCase()}</small>}
        <button className="btn primary" onClick={() => nav("/orders")}>
          View orders
        </button>
      </div>
    );
  if (!cart.length)
    return (
      <section className="section">
        <div className="empty">
          <span>🛒</span>
          <h2>Your cart is empty.</h2>
          <button className="btn primary" onClick={() => nav("/shop")}>
            Continue shopping
          </button>
        </div>
      </section>
    );
  return (
    <section className="section checkout">
      <div className="pageTitle">
        <span className="eyebrow">CHECKOUT</span>
        <h1>Almost growing time.</h1>
      </div>
      <div className="checkoutGrid">
        <form onSubmit={submit}>
          <div className="formSection">
            <h3>Delivery address</h3>
            <div className="two">
              <label>
                Name
                <input
                  required
                  value={address.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </label>
              <label>
                Phone
                <input
                  required
                  value={address.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </label>
            </div>
            <label>
              Address
              <input
                required
                value={address.line}
                onChange={(e) => update("line", e.target.value)}
              />
            </label>
            <div className="two">
              <label>
                City
                <input
                  required
                  value={address.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </label>
              <label>
                State
                <input
                  required
                  value={address.state}
                  onChange={(e) => update("state", e.target.value)}
                />
              </label>
            </div>
            <label>
              PIN code
              <input
                required
                inputMode="numeric"
                value={address.pincode}
                onChange={(e) => update("pincode", e.target.value)}
              />
            </label>
          </div>
          <div className="formSection">
            <h3>Payment</h3>
            <button
              type="button"
              className={`paymentOption ${paymentMethod === "COD" ? "selected" : ""}`}
              onClick={() => setPaymentMethod("COD")}
            >
              Cash on Delivery{" "}
              <span>{paymentMethod === "COD" ? "●" : "○"}</span>
            </button>
            <button
              type="button"
              className={`paymentOption ${paymentMethod === "ONLINE" ? "selected" : ""}`}
              onClick={() => setPaymentMethod("ONLINE")}
            >
              Online Payment{" "}
              <span>{paymentMethod === "ONLINE" ? "●" : "○"}</span>
            </button>
            <small className="muted">
              Online gateway integration can be connected separately; the
              current flow stores payment status as pending.
            </small>
          </div>
          {error && <div className="error">{error}</div>}
          <button className="btn primary full" disabled={loading}>
            {loading
              ? "Placing order..."
              : `Place order · ₹${total.toFixed(2)}`}
          </button>
        </form>
        <aside className="summary">
          <h3>Summary</h3>
          {cart.map((x, i) => (
            <div key={x.cartItemId || `${x.type}-${i}`}>
              <span>
                {x.name} × {x.quantity}
              </span>
              <b>
                ₹{(Number(x.price || 0) * Number(x.quantity || 1)).toFixed(2)}
              </b>
            </div>
          ))}
          <hr />
          <div>
            <span>Subtotal</span>
            <b>₹{subtotal.toFixed(2)}</b>
          </div>
          <div>
            <span>Delivery</span>
            <b>₹{shipping.toFixed(2)}</b>
          </div>
          <div className="summaryTotal">
            <span>Total</span>
            <strong>₹{total.toFixed(2)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
