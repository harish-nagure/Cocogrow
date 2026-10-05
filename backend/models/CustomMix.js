import mongoose from 'mongoose';
const ingredientSchema=new mongoose.Schema({
 ingredientId:{type:mongoose.Schema.Types.ObjectId,ref:'Ingredient',required:true},
 name:{type:String,required:true}, percentage:{type:Number,required:true,min:0},
 quantityKg:{type:Number,required:true,min:0}, pricePerKg:{type:Number,required:true,min:0},
 cost:{type:Number,required:true,min:0}
},{_id:false});
const schema=new mongoose.Schema({
 plantId:{type:mongoose.Schema.Types.ObjectId,ref:'Plant',required:true},
 plantName:{type:String,required:true}, scientificName:String,
 environment:{type:String,required:true}, category:{type:String,required:true},
 quantityKg:{type:Number,required:true,min:.1}, ingredients:{type:[ingredientSchema],required:true,
  validate:{validator:a=>Math.abs(a.reduce((s,x)=>s+Number(x.percentage||0),0)-100)<=.001,message:'Percentages must total 100%.'}},
 ingredientCost:{type:Number,required:true,min:0}, processing:{type:Number,required:true,min:0},
 packaging:{type:Number,required:true,min:0}, profitMargin:{type:Number,required:true,min:0},
 totalPrice:{type:Number,required:true,min:0},
 formulationType:{type:String,enum:['DEMONSTRATION','VALIDATED'],default:'DEMONSTRATION'},
 disclaimer:{type:String,required:true},
 status:{type:String,enum:['ACTIVE','ORDERED','CANCELLED'],default:'ACTIVE',index:true}
},{timestamps:true});
schema.index({plantId:1,status:1}); schema.index({createdAt:-1});
export default mongoose.model('CustomMix',schema);
