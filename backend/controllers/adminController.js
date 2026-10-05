import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Plant from '../models/Plant.js';
import Ingredient from '../models/Ingredient.js';
import MixRule from '../models/MixRule.js';

const id = (value) => /^[a-f\d]{24}$/i.test(String(value));
const cleanBody = (body, keys) => Object.fromEntries(keys.filter(k => body[k] !== undefined).map(k => [k, body[k]]));

export async function getStats(req, res, next) {
  try {
    const [salesAgg, todayAgg, monthlyAgg, lowStock, counts] = await Promise.all([
      Order.aggregate([{ $match: { status: { $ne: 'CANCELLED' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { status: { $ne: 'CANCELLED' }, createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { status: { $ne: 'CANCELLED' }, createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Ingredient.countDocuments({ active: true, $expr: { $lte: ['$stockQuantity', '$minimumStock'] } }),
      Promise.all([User.countDocuments(), Product.countDocuments({ active: { $ne: false } }), Plant.countDocuments({ active: { $ne: false } }), Ingredient.countDocuments({ active: { $ne: false } }), Order.countDocuments(), Order.countDocuments({ 'items.type': 'custom-mix' })])
    ]);
    const [users, products, plants, ingredients, orders, customMixOrders] = counts;
    const statuses = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    res.json({ sales: salesAgg[0]?.total || 0, todaySales: todayAgg[0]?.total || 0, monthlySales: monthlyAgg[0]?.total || 0, orders, users, products, plants, ingredients, customMixOrders, lowStockIngredients: lowStock, statuses });
  } catch (e) { next(e); }
}

export async function listProducts(req,res,next){try{res.json(await Product.find().sort({createdAt:-1}));}catch(e){next(e);}}
export async function createProduct(req,res,next){try{const p=await Product.create(req.body);res.status(201).json(p);}catch(e){next(e);}}
export async function getProduct(req,res,next){try{if(!id(req.params.id))return res.status(400).json({message:'Invalid product id.'});const p=await Product.findById(req.params.id);if(!p)return res.status(404).json({message:'Product not found.'});res.json(p);}catch(e){next(e);}}
export async function updateProduct(req,res,next){try{const p=await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!p)return res.status(404).json({message:'Product not found.'});res.json(p);}catch(e){next(e);}}
export async function deleteProduct(req,res,next){try{const p=await Product.findByIdAndUpdate(req.params.id,{active:false},{new:true});if(!p)return res.status(404).json({message:'Product not found.'});res.json({message:'Product deactivated.',product:p});}catch(e){next(e);}}

export async function listPlants(req,res,next){try{res.json(await Plant.find().sort({name:1}));}catch(e){next(e);}}
export async function createPlant(req,res,next){try{res.status(201).json(await Plant.create(req.body));}catch(e){next(e);}}
export async function getPlant(req,res,next){try{const p=await Plant.findById(req.params.id);if(!p)return res.status(404).json({message:'Plant not found.'});res.json(p);}catch(e){next(e);}}
export async function updatePlant(req,res,next){try{const p=await Plant.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!p)return res.status(404).json({message:'Plant not found.'});res.json(p);}catch(e){next(e);}}
export async function deletePlant(req,res,next){try{const p=await Plant.findByIdAndUpdate(req.params.id,{active:false},{new:true});if(!p)return res.status(404).json({message:'Plant not found.'});res.json(p);}catch(e){next(e);}}

export async function listIngredients(req,res,next){try{res.json(await Ingredient.find().sort({name:1}));}catch(e){next(e);}}
export async function createIngredient(req,res,next){try{res.status(201).json(await Ingredient.create(req.body));}catch(e){next(e);}}
export async function updateIngredient(req,res,next){try{const p=await Ingredient.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!p)return res.status(404).json({message:'Ingredient not found.'});res.json(p);}catch(e){next(e);}}
export async function deleteIngredient(req,res,next){try{const p=await Ingredient.findByIdAndUpdate(req.params.id,{active:false},{new:true});if(!p)return res.status(404).json({message:'Ingredient not found.'});res.json(p);}catch(e){next(e);}}

export async function listMixRules(req,res,next){try{res.json(await MixRule.find().populate('plantId','name category').populate('ingredients.ingredientId','name pricePerKg stockQuantity').sort({createdAt:-1}));}catch(e){next(e);}}
export async function createMixRule(req,res,next){try{if(!Array.isArray(req.body.ingredients)||Math.abs(req.body.ingredients.reduce((s,x)=>s+Number(x.percentage||0),0)-100)>.001)return res.status(400).json({message:'Mix rule percentages must total exactly 100%.'});res.status(201).json(await MixRule.create(req.body));}catch(e){next(e);}}
export async function updateMixRule(req,res,next){try{if(req.body.ingredients && Math.abs(req.body.ingredients.reduce((s,x)=>s+Number(x.percentage||0),0)-100)>.001)return res.status(400).json({message:'Mix rule percentages must total exactly 100%.'});const r=await MixRule.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!r)return res.status(404).json({message:'Mix rule not found.'});res.json(r);}catch(e){next(e);}}
export async function deleteMixRule(req,res,next){try{const r=await MixRule.findByIdAndUpdate(req.params.id,{active:false},{new:true});if(!r)return res.status(404).json({message:'Mix rule not found.'});res.json(r);}catch(e){next(e);}}

export async function inventory(req,res,next){try{res.json(await Ingredient.find().sort({stockQuantity:1,name:1}));}catch(e){next(e);}}
async function changeStock(req,res,next,deltaMode){try{const q=Number(req.body.quantity);if(!Number.isFinite(q)||q<=0)return res.status(400).json({message:'Quantity must be greater than zero.'});const ing=await Ingredient.findById(req.params.id);if(!ing)return res.status(404).json({message:'Ingredient not found.'});let nextStock=deltaMode==='set'?q:ing.stockQuantity+(deltaMode==='add'?q:-q);if(nextStock<0)return res.status(409).json({message:'Stock cannot become negative.'});ing.stockQuantity=nextStock;await ing.save();res.json(ing);}catch(e){next(e);}}
export const addStock=(req,res,next)=>changeStock(req,res,next,'add');
export const removeStock=(req,res,next)=>changeStock(req,res,next,'remove');
export const setStock=(req,res,next)=>changeStock(req,res,next,'set');

export async function listOrders(req,res,next){try{const filter={};if(req.query.status)filter.status=req.query.status;const orders=await Order.find(filter).populate('userId','name email phone').sort({createdAt:-1});res.json(orders);}catch(e){next(e);}}
export async function getOrder(req,res,next){try{const o=await Order.findById(req.params.id).populate('userId','name email phone');if(!o)return res.status(404).json({message:'Order not found.'});res.json(o);}catch(e){next(e);}}
export async function updateOrderStatus(req,res,next){try{const allowed=['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];if(!allowed.includes(req.body.status))return res.status(400).json({message:'Invalid order status.'});const o=await Order.findByIdAndUpdate(req.params.id,{status:req.body.status,adminNote:req.body.note||''},{new:true,runValidators:true}).populate('userId','name email phone');if(!o)return res.status(404).json({message:'Order not found.'});res.json(o);}catch(e){next(e);}}

export async function listUsers(req,res,next){try{const users=await User.find().select('-password').sort({createdAt:-1}).lean();const ids=users.map(u=>u._id);const counts=await Order.aggregate([{ $match:{userId:{$in:ids}}},{ $group:{_id:'$userId',orders:{$sum:1},spent:{$sum:'$total'}}}]);const map=new Map(counts.map(x=>[String(x._id),x]));res.json(users.map(u=>({...u,orders:map.get(String(u._id))?.orders||0,spent:map.get(String(u._id))?.spent||0})));}catch(e){next(e);}}
export async function getUser(req,res,next){try{const u=await User.findById(req.params.id).select('-password');if(!u)return res.status(404).json({message:'User not found.'});res.json(u);}catch(e){next(e);}}
export async function updateUserStatus(req,res,next){try{if(req.user._id.toString()===req.params.id)return res.status(400).json({message:'You cannot deactivate your own admin account.'});const u=await User.findByIdAndUpdate(req.params.id,{active:Boolean(req.body.active)},{new:true}).select('-password');if(!u)return res.status(404).json({message:'User not found.'});res.json(u);}catch(e){next(e);}}

export async function reportOverview(req,res,next){try{const [sales,orders,customers,customMixOrders]=await Promise.all([Order.aggregate([{ $match:{status:{$ne:'CANCELLED'}}},{ $group:{_id:null,total:{$sum:'$total'}}}]),Order.countDocuments(),User.countDocuments({role:'USER'}),Order.countDocuments({'items.type':'custom-mix'})]);res.json({sales:sales[0]?.total||0,orders,customers,customMixOrders});}catch(e){next(e);}}
export async function reportSales(req,res,next){try{const rows=await Order.aggregate([{ $match:{status:{$ne:'CANCELLED'}}},{ $group:{_id:{year:{$year:'$createdAt'},month:{$month:'$createdAt'}},sales:{$sum:'$total'},orders:{$sum:1}}},{ $sort:{'_id.year':1,'_id.month':1}}]);res.json(rows);}catch(e){next(e);}}
export async function reportOrders(req,res,next){try{res.json(await Order.aggregate([{ $group:{_id:'$status',count:{$sum:1}}},{ $sort:{count:-1}}]));}catch(e){next(e);}}
export async function reportCustomMixes(req,res,next){try{res.json(await Order.aggregate([{ $unwind:'$items'},{ $match:{'items.type':'custom-mix'}},{ $group:{_id:'$items.plantName',orders:{$sum:1},sales:{$sum:{$multiply:['$items.price','$items.quantity']}}}},{ $sort:{sales:-1}}]));}catch(e){next(e);}}
