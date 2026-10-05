import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:String,scientificName:String,category:String,environment:[String],description:String,image:String,waterRequirement:String,sunlightRequirement:String,drainageRequirement:String,nutrientRequirement:String,phRange:String,careInstructions:String,active:{type:Boolean,default:true}});
export default mongoose.model('Plant',schema);
