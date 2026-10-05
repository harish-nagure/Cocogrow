import Plant from '../models/Plant.js';
import MixRule from '../models/MixRule.js';
import CustomMix from '../models/CustomMix.js';
const ENVIRONMENTS = ['Indoor', 'Outdoor', 'Balcony', 'Terrace/Garden'];
const round = (n, d = 2) => Number(Number(n).toFixed(d));
export async function getEnvironments(req, res) { res.json(ENVIRONMENTS); }
export async function getCategories(req, res, next) { try { res.json((await Plant.distinct('category', { active: true })).filter(Boolean).sort()); } catch (e) { next(e); } }
export async function getPlants(req, res, next) { try { const f = { active: true }; if (req.query.category) f.category = req.query.category; if (req.query.environment) f.environment = req.query.environment; res.json(await Plant.find(f).sort({ name: 1 })); } catch (e) { next(e); } }
async function bestRule(plantId, environment, category) {
    const rules = await MixRule.find({ plantId, active: true }).populate('ingredients.ingredientId');
    return rules.find(r => r.environment === environment && r.category === category) ||
        rules.find(r => r.environment === environment && !r.category) ||
        rules.find(r => !r.environment && r.category === category) ||
        rules.find(r => !r.environment && !r.category);
}
export async function calculateMix(req, res, next) {
    try {
        const { plantId, quantityKg, environment, category } = req.body, quantity = Number(quantityKg);
        if (!plantId || !quantity || quantity <= 0) return res.status(400).json({ message: 'Plant and positive quantity are required.' });
        if (!environment || !category) return res.status(400).json({ message: 'Environment and category are required.' });
        if (!ENVIRONMENTS.includes(environment)) return res.status(400).json({ message: 'Invalid growing environment.' });
        const plant = await Plant.findOne({ _id: plantId, active: true });
        if (!plant) return res.status(404).json({ message: 'Plant not found.' });
        if (plant.environment?.length && !plant.environment.includes(environment)) return res.status(400).json({ message: `${plant.name} is not listed for ${environment} growing.` });
        const rule = await bestRule(plantId, environment, category);
        if (!rule) return res.status(404).json({ message: 'No active mix rule is available for this plant and selection.' });
        const pct = rule.ingredients.reduce((s, x) => s + Number(x.percentage || 0), 0);
        if (Math.abs(pct - 100) > .001) return res.status(400).json({ message: 'Selected mix rule is invalid. Percentages must total 100%.' });
        const ingredients = rule.ingredients.map(x => { if (!x.ingredientId) throw new Error('Mix rule contains an invalid ingredient.'); const q = quantity * Number(x.percentage) / 100; return { ingredientId: x.ingredientId._id, name: x.ingredientId.name, percentage: Number(x.percentage), quantityKg: round(q, 3), pricePerKg: round(x.ingredientId.pricePerKg || 0), cost: round(q * (x.ingredientId.pricePerKg || 0)) }; });
        const ingredientCost = round(ingredients.reduce((s, x) => s + x.cost, 0));
        const processing = round(quantity * 12), packaging = 25, profitMargin = round((ingredientCost + processing + packaging) * .25);
        const totalPrice = round(ingredientCost + processing + packaging + profitMargin);
        const disclaimer = 'Demonstration formulation. Validate commercial formulations with a qualified horticultural professional.';
        const customMix = await CustomMix.create({ plantId: plant._id, plantName: plant.name, scientificName: plant.scientificName, environment, category, quantityKg: quantity, ingredients, ingredientCost, processing, packaging, profitMargin, totalPrice, formulationType: 'DEMONSTRATION', disclaimer, status: 'ACTIVE' });
        res.status(201).json({ success: true, customMixId: customMix._id, plant: { _id: plant._id, name: plant.name, scientificName: plant.scientificName, image: plant.image }, environment, category, quantityKg: quantity, ingredients, ingredientCost, processing, packaging, profitMargin, totalPrice, formulationType: customMix.formulationType, disclaimer });
    } catch (e) { next(e); }
}
