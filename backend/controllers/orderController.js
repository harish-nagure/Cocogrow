import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Ingredient from '../models/Ingredient.js';
import CustomMix from '../models/CustomMix.js';
import { config } from '../config.js';
const round=n=>Number(Number(n).toFixed(2)), FREE=999, DELIVERY=79;
function validAddress(a={}){return ['name','phone','line','city','state','pincode'].every(k=>String(a[k]||'').trim());}
export async function createOrder(req,res,next){
 if(!Array.isArray(req.body.items)||!req.body.items.length)return res.status(400).json({message:'At least one order item is required.'});
 if(!validAddress(req.body.shippingAddress))return res.status(400).json({message:'Complete shipping address is required.'});
 const method=req.body.paymentMethod||'COD'; if(!['COD','ONLINE'].includes(method))return res.status(400).json({message:'Invalid payment method.'});
 let session=null;
 const work=async()=>{
  const items=[];let subtotal=0;
  for(const requested of req.body.items){
   const quantity=Number(requested.quantity);if(!Number.isInteger(quantity)||quantity<1)throw new Error('Each item must have a valid quantity.');
   if(requested.type==='product'){
    const product=await Product.findOne({_id:requested.productId,active:{$ne:false}}).session(session);if(!product)throw new Error('Product not found.');if(product.stock<quantity)throw new Error(`${product.name} does not have enough stock.`);const price=round(product.price);items.push({type:'product',productId:product._id,name:product.name,quantity,price});subtotal+=price*quantity;
   }else if(requested.type==='custom-mix'){
    const mix=await CustomMix.findOne({_id:requested.customMixId,status:'ACTIVE'}).session(session);if(!mix)throw new Error('Custom mix was not found or has already been ordered.');
    for(const ing of mix.ingredients){const need=Number(ing.quantityKg)*quantity;const ok=await Ingredient.findOne({_id:ing.ingredientId,active:true,stockQuantity:{$gte:need}}).session(session);if(!ok)throw new Error(`Insufficient stock for ${ing.name}.`);}
    const price=round(mix.totalPrice);items.push({type:'custom-mix',customMixId:mix._id,name:`${mix.plantName} Growing Mix`,quantity,price,quantityKg:mix.quantityKg,plantId:mix.plantId,plantName:mix.plantName,scientificName:mix.scientificName,environment:mix.environment,category:mix.category,ingredients:mix.ingredients.map(i=>({ingredientId:i.ingredientId,name:i.name,percentage:i.percentage,quantityKg:i.quantityKg})),formulationType:mix.formulationType,disclaimer:mix.disclaimer});subtotal+=price*quantity;
   }else throw new Error('Unsupported order item type.');
  }
  subtotal=round(subtotal);const shipping=subtotal>=FREE?0:DELIVERY,total=round(subtotal+shipping);
  const [order]=await Order.create([{userId:req.user._id,items,subtotal,shipping,total,shippingAddress:req.body.shippingAddress,paymentMethod:method,paymentStatus:'PENDING',status:'PENDING'}],session?{session}:{});
  for(const item of items){
   if(item.type==='product'){
    const updated=await Product.findOneAndUpdate({_id:item.productId,active:{$ne:false},stock:{$gte:item.quantity}},{$inc:{stock:-item.quantity}},{new:true,...(session?{session}:{})});if(!updated)throw new Error(`Stock changed while ordering ${item.name}. Please try again.`);
   }else{
    for(const ing of item.ingredients){const need=Number(ing.quantityKg)*item.quantity;const updated=await Ingredient.findOneAndUpdate({_id:ing.ingredientId,active:true,stockQuantity:{$gte:need}},{$inc:{stockQuantity:-need}},{new:true,...(session?{session}:{})});if(!updated)throw new Error(`Stock changed while ordering ${ing.name}. Please try again.`);}
    const updatedMix=await CustomMix.findOneAndUpdate({_id:item.customMixId,status:'ACTIVE'},{$set:{status:'ORDERED'}},{new:true,...(session?{session}:{})});if(!updatedMix)throw new Error('Custom mix was already ordered.');
   }
  }
  return {id:order._id,subtotal,shipping,total,status:order.status,paymentMethod:order.paymentMethod};
 };
 try{
  let response;
  if(config.transactions){session=await mongoose.startSession();await session.withTransaction(async()=>{response=await work();});}
  else response=await work();
  res.status(201).json({success:true,message:'Order placed successfully.',order:response});
 }catch(e){if(e.message?.includes('Transaction numbers are only allowed')){e.status=503;e.message='MongoDB transactions are unavailable. Set MONGO_TRANSACTIONS=false for a local development database or use MongoDB Atlas.';}next(e);}finally{if(session)await session.endSession();}
}
export async function getMyOrders(req,res,next){try{res.json(await Order.find({userId:req.user._id}).sort({createdAt:-1}));}catch(e){next(e);}}
export async function getMyOrderById(req,res,next){try{const o=await Order.findOne({_id:req.params.id,userId:req.user._id});if(!o)return res.status(404).json({message:'Order not found.'});res.json(o);}catch(e){next(e);}}
