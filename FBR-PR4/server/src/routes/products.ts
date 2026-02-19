import {Router} from 'express'
import { addProduct, changeProduct, deleteProduct, getAllProducts, getProductById } from '../controllers/products';

const router = Router();

router.get('/products', getAllProducts)
router.get('/products/:id', getProductById);
router.post('/products', addProduct);
router.put('/products/:id', changeProduct);
router.delete('/products/:id', deleteProduct)

export default router;