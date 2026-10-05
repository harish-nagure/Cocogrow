import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  name: String,
  phone: String,
  line: String,
  city: String,
  state: String,
  pincode: String,
}, { _id: false });

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: addressSchema, default: () => ({}) },
  active: { type: Boolean, default: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
}, { timestamps: true });

export default mongoose.model('User', schema);
