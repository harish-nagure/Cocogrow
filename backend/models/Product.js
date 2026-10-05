import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  image: { type: String, default: '' },
  rating: { type: Number, default: 4.8, min: 0, max: 5 },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
}, { timestamps: true });
schema.index({ category: 1, active: 1 });
schema.index({ name: 'text', description: 'text' });
export default mongoose.model('Product', schema);
