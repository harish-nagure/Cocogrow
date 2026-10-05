import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, default: '' },
  description: { type: String, default: '' },
  pricePerKg: { type: Number, required: true, min: 0 },
  stockQuantity: { type: Number, default: 0, min: 0 },
  minimumStock: { type: Number, default: 0, min: 0 },
  unit: { type: String, default: 'kg' },
  waterRetention: String,
  drainage: String,
  active: { type: Boolean, default: true },
}, { timestamps: true });
schema.index({ active: 1, stockQuantity: 1 });
export default mongoose.model('Ingredient', schema);
