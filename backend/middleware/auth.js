import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config.js";
export async function protect(req, res, next) {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer "))
      return res.status(401).json({ message: "Authentication required." });
    const token = h.split(" ")[1],
      p = jwt.verify(token, config.jwt);
    req.user = await User.findById(p.id).select("-password");
    if (!req.user)
      return res.status(401).json({ message: "User account not found." });
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}
export function admin(req, res, next) {
  if (req.user?.role !== "ADMIN")
    return res.status(403).json({ message: "Admin access required." });
  next();
}
