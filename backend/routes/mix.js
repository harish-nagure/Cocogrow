import express from 'express';
import {getEnvironments,getCategories,getPlants,calculateMix} from '../controllers/mixController.js';
const router=express.Router();
router.get('/environments',getEnvironments);
router.get('/categories',getCategories);
router.get('/plants',getPlants);
router.post('/calculate',calculateMix);
export default router;
