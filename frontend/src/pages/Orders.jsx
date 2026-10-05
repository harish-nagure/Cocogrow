import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
export default function Orders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    api
      .get("/orders")
      .then((r) => setOrders(r.data))
      .catch(() => {});
  }, []);
  return (
    <section className="section">
      <div className="pageTitle">
        <span className="eyebrow">MY ORDERS</span>
        <h1>Your growing history.</h1>
      </div>
      {orders.length ? (
        orders.map((o) => (
          <Link to={`/orders/${o._id}`} className="orderCard" key={o._id}>
            <div>
              <b>#{o._id.slice(-7).toUpperCase()}</b>
              <span>{new Date(o.createdAt).toLocaleDateString()}</span>
            </div>
            <strong>₹{o.total}</strong>
            <span className="status">{o.status}</span>
          </Link>
        ))
      ) : (
        <div className="empty">
          <span>📦</span>
          <h2>No orders yet.</h2>
          <Link className="btn primary" to="/shop">
            Start shopping
          </Link>
        </div>
      )}
    </section>
  );
}
