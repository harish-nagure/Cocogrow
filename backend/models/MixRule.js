import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 name:{type:String,required:true}, plantId:{type:mongoose.Schema.Types.ObjectId,ref:'Plant',required:true},
 environment:{type:String,default:null}, category:{type:String,default:null},
 ingredients:[{ingredientId:{type:mongoose.Schema.Types.ObjectId,ref:'Ingredient',required:true},percentage:{type:Number,required:true,min:0}}],
 active:{type:Boolean,default:true}, notes:String
},{timestamps:true});
schema.pre('validate',function(next){const total=this.ingredients.reduce((s,x)=>s+Number(x.percentage||0),0);if(Math.abs(total-100)>.001)return next(new Error('Mix rule percentages must total 100%.'));next();});
schema.index({plantId:1,active:1,environment:1,category:1});
export default mongoose.model('MixRule',schema);
