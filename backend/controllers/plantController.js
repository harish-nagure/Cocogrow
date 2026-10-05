import Plant from '../models/Plant.js';
export async function getPlants(req,res,next){try{res.json(await Plant.find({active:true}).sort({name:1}));}catch(e){next(e);}}
export async function getPlantById(req,res,next){try{const p=await Plant.findOne({_id:req.params.id,active:true});if(!p)return res.status(404).json({message:'Plant not found.'});res.json(p);}catch(e){next(e);}}
