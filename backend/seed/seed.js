import mongoose from 'mongoose'; import bcrypt from 'bcryptjs'; import {config} from '../config.js'; import User from '../models/User.js'; import Product from '../models/Product.js'; import Plant from '../models/Plant.js'; import Ingredient from '../models/Ingredient.js'; import MixRule from '../models/MixRule.js'; import CustomMix from '../models/CustomMix.js';
await mongoose.connect(config.mongo);
await Promise.all([User.deleteMany(),Product.deleteMany(),Plant.deleteMany(),Ingredient.deleteMany(),MixRule.deleteMany(),CustomMix.deleteMany()]);
await User.create({name:'CocoGrow Admin',email:'admin@cocogrow.com',password:await bcrypt.hash('Admin@123',10),role:'ADMIN'});
const ingredients=await Ingredient.insertMany([
{name:'Cocopeat',category:'Base',pricePerKg:45,stockQuantity:250,minimumStock:40,waterRetention:'High',drainage:'Medium'},
{name:'Compost',category:'Organic',pricePerKg:55,stockQuantity:150,minimumStock:30,waterRetention:'Medium',drainage:'Medium'},
{name:'Perlite',category:'Aeration',pricePerKg:120,stockQuantity:80,minimumStock:15,waterRetention:'Low',drainage:'High'},
{name:'Vermicompost',category:'Organic',pricePerKg:70,stockQuantity:120,minimumStock:20,waterRetention:'Medium',drainage:'Medium'},
{name:'Neem Cake',category:'Organic',pricePerKg:90,stockQuantity:100,minimumStock:20}
]);
const plants=await Plant.insertMany([
{name:'Rose',scientificName:'Rosa',category:'Flowering',environment:['Outdoor','Balcony','Terrace/Garden'],description:'Flowering garden plant.',image:'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=800&q=80',waterRequirement:'Medium',sunlightRequirement:'Bright',drainageRequirement:'High',phRange:'6.0–7.0',careInstructions:'Water when topsoil begins to dry.'},
{name:'Peace Lily',scientificName:'Spathiphyllum',category:'Foliage',environment:['Indoor'],description:'Elegant low-light foliage plant.',image:'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?auto=format&fit=crop&w=800&q=80',waterRequirement:'Medium',sunlightRequirement:'Indirect',drainageRequirement:'High',phRange:'5.8–6.5',careInstructions:'Keep evenly moist and avoid direct sun.'},
{name:'Aloe Vera',scientificName:'Aloe barbadensis',category:'Succulent',environment:['Indoor','Balcony','Terrace/Garden'],description:'Low-maintenance succulent.',image:'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80',waterRequirement:'Low',sunlightRequirement:'Bright',drainageRequirement:'Very High',phRange:'6.0–7.5',careInstructions:'Allow medium to dry between watering.'},
{name:'Basil',scientificName:'Ocimum basilicum',category:'Herb',environment:['Outdoor','Balcony','Terrace/Garden'],description:'Aromatic culinary herb.',image:'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?auto=format&fit=crop&w=800&q=80',waterRequirement:'Medium',sunlightRequirement:'Bright',drainageRequirement:'High',phRange:'6.0–7.5',careInstructions:'Pinch tips regularly for bushier growth.'}
]);
for(const p of plants) await MixRule.create({name:`${p.name} Demonstration Mix`,plantId:p._id,environment:'',category:'',ingredients:[{ingredientId:ingredients[0]._id,percentage:50},{ingredientId:ingredients[1]._id,percentage:25},{ingredientId:ingredients[2]._id,percentage:15},{ingredientId:ingredients[3]._id,percentage:10}],notes:'Demonstration formula; validate commercially.'});
await Product.insertMany([
{name:'Premium Cocopeat Block',slug:'premium-cocopeat',category:'Cocopeat',description:'Clean, sustainable cocopeat for everyday gardening.',price:299,stock:120,image:'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=900&q=80',featured:true},
{name:'Organic Garden Compost',slug:'organic-compost',category:'Organic',description:'Rich organic compost for soil health.',price:249,stock:80,image:'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=80',featured:true},
{name:'Perlite Aeration Pack',slug:'perlite-pack',category:'Aeration',description:'Lightweight mineral amendment for drainage.',price:349,stock:60,image:'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80',featured:true},
{name:'CocoGrow Starter Kit',slug:'starter-kit',category:'Kits',description:'A practical starter bundle for new gardeners.',price:699,stock:45,image:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',featured:true}
]);
console.log('Seed complete. Admin: admin@cocogrow.com / Admin@123'); await mongoose.disconnect();
