import mongoose from 'mongoose';
const ingredient = new mongoose.Schema({
  ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  name: { type: String, required: true }, percentage: { type: Number, required: true }, quantityKg: { type: Number, required: true }
}, { _id: false });
const item = new mongoose.Schema({
  type: { type: String, enum: ['product', 'custom-mix'], required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  customMixId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomMix' },
  name: { type: String, required: true }, quantity: { type: Number, required: true, min: 1 }, price: { type: Number, required: true, min: 0 },
  quantityKg: Number, plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant' }, plantName: String, scientificName: String,
  environment: String, category: String, ingredients: [ingredient], formulationType: String, disclaimer: String
}, { _id: false });
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [item], required: true, validate: { validator: a => a.length > 0, message: 'Order must contain at least one item.' } },
  subtotal: { type: Number, required: true, min: 0 }, shipping: { type: Number, required: true, min: 0 }, total: { type: Number, required: true, min: 0 },
  shippingAddress: { name: String, phone: String, line: String, city: String, state: String, pincode: String },
  paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], default: 'PENDING' },
  adminNote: { type: String, default: '' },
}, { timestamps: true });
schema.index({ userId: 1, createdAt: -1 });
schema.index({ status: 1, createdAt: -1 });
export default mongoose.model('Order', schema);
