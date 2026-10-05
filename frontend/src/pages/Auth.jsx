import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api";
import { useApp } from "../context/AppContext";
export default function Auth({ mode = "login" }) {
  const login = mode === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "" }),
    [error, setError] = useState("");
  const { setUser } = useApp();
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post(`/auth/${login ? "login" : "register"}`, form);
      localStorage.setItem("cocogrow_token", r.data.token);
      setUser(r.data.user);
      nav("/");
    } catch (e) {
      setError(e.response?.data?.message || "Something went wrong");
    }
  };
  return (
    <section className="authPage">
      <div className="authCard">
        <div className="authVisual">
          <span>🌱</span>
          <h2>Grow something good.</h2>
          <p>Join CocoGrow and make your gardening journey more intentional.</p>
        </div>
        <form onSubmit={submit}>
          <span className="eyebrow">COCOGROW</span>
          <h1>{login ? "Welcome back" : "Create your account"}</h1>
          {!login && (
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn primary full">
            {login ? "Login" : "Register"}
          </button>
          <p className="switch">
            {login ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => nav(login ? "/register" : "/login")}
            >
              {login ? "Register" : "Login"}
            </button>
          </p>
        </form>
      </div>
    </section>
  );
}
