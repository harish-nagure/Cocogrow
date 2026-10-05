import { Link } from "react-router-dom";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
export default function Cart() {
  const {
    cart,
    subtotal,
    shipping,
    total,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useApp();
  return (
    <section className="section cartPage">
      <div className="pageTitle">
        <span className="eyebrow">YOUR CART</span>
        <h1>Ready to grow?</h1>
      </div>
      {!cart.length ? (
        <div className="empty">
          <span>🌱</span>
          <h2>Your cart is waiting.</h2>
          <p>Add a product or build a custom mix.</p>
          <Link className="btn primary" to="/shop">
            Explore shop
          </Link>
        </div>
      ) : (
        <div className="cartLayout">
          <div>
            {cart.map((x, i) => {
              const id =
                x.cartItemId || `${x.type || "product"}-${x.productId || i}`;
              return (
                <article className="cartItem" key={id}>
                  {x.image ? (
                    <img src={x.image} alt={x.name} />
                  ) : (
                    <div className="cartImagePlaceholder">🌱</div>
                  )}
                  <div className="cartInfo">
                    <span className="eyebrow">
                      {x.type === "custom-mix"
                        ? "CUSTOM MIX"
                        : x.category || "COCOGROW"}
                    </span>
                    <h3>{x.name}</h3>
                    {x.type === "custom-mix" && (
                      <div className="customMixMeta">
                        <span>{x.plantName}</span>
                        <span>{x.environment}</span>
                        <span>{x.quantityKg} KG</span>
                      </div>
                    )}
                    <div className="cartControls">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(id)}
                      >
                        <Minus size={15} />
                      </button>
                      <span>{x.quantity}</span>
                      <button
                        type="button"
                        onClick={() => increaseQuantity(id)}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                  <strong>
                    ₹
                    {(Number(x.price || 0) * Number(x.quantity || 1)).toFixed(
                      2,
                    )}
                  </strong>
                  <button
                    type="button"
                    className="trash"
                    onClick={() => removeFromCart(id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </article>
              );
            })}
          </div>
          <aside className="summary">
            <h3>Order summary</h3>
            <div>
              <span>Subtotal</span>
              <b>₹{subtotal.toFixed(2)}</b>
            </div>
            <div>
              <span>Delivery</span>
              <b>₹{shipping.toFixed(2)}</b>
            </div>
            <hr />
            <div className="summaryTotal">
              <span>Total</span>
              <strong>₹{total.toFixed(2)}</strong>
            </div>
            <Link className="btn primary full" to="/checkout">
              Checkout <ArrowRight size={18} />
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
