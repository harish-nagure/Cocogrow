import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, UserCircle, Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { cart, user, logout } = useApp();
  const nav = useNavigate();
  return (
    <header className="nav">
      <Link className="brand" to="/">
        <span className="brandIcon">
          <Leaf size={20} />
        </span>
        Coco<span>Grow</span>
      </Link>
      <nav className={open ? "mobileOpen" : ""}>
        <Link to="/shop">Shop</Link>
        <Link to="/plants">Plants</Link>
        <Link className="smartLink" to="/smart-mix">
          ✦ Smart Mix
        </Link>
        <Link to="/about">About</Link>
        {user?.role === "ADMIN" && <Link to="/admin">Admin</Link>}
      </nav>
      <div className="navActions">
        <Link to="/cart" className="iconBtn">
          <ShoppingCart size={20} />
          <b>{cart.length}</b>
        </Link>
        {user ? (
          <div className="navUser"><Link to="/profile" className="avatar"><UserCircle size={22} /></Link><button className="logoutMini" onClick={() => { logout(); nav("/"); }}>Logout</button></div>
        ) : (
          <Link to="/login" className="loginBtn">
            Login
          </Link>
        )}
        <button className="menuBtn" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
