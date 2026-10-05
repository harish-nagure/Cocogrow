import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config.js';

function token(user) { return jwt.sign({ id: user._id }, config.jwt, { expiresIn: '7d' }); }
function userPayload(user) { return { id: user._id, name: user.name, email: user.email, phone: user.phone || '', address: user.address || {}, role: user.role, active: user.active }; }

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) return res.status(400).json({ message: 'Name, valid email and password of at least 6 characters are required.' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: 'Email already registered.' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: token(user), user: userPayload(user) });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ message: 'Invalid credentials.' });
    if (!user.active) return res.status(403).json({ message: 'This account is inactive. Contact CocoGrow support.' });
    res.json({ token: token(user), user: userPayload(user) });
  } catch (e) { next(e); }
}

export function me(req, res) { res.json(userPayload(req.user)); }

export async function updateMe(req, res, next) {
  try {
    const allowed = ['name', 'phone', 'address'];
    const updates = {};
    for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];
    if (updates.name !== undefined && !String(updates.name).trim()) return res.status(400).json({ message: 'Name cannot be empty.' });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    res.json(userPayload(user));
  } catch (e) { next(e); }
}
