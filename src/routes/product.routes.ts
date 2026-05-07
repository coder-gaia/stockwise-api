import { Router } from 'express'
import { authenticate, requireOwner } from '../middlewares/auth.middleware'
import * as productController from '../controllers/product.controller'

const router = Router()

router.use(authenticate)

router.get('/alerts', productController.lowStockAlerts)
router.get('/', productController.list)
router.post('/', requireOwner, productController.create)
router.put('/:id', requireOwner, productController.update)
router.delete('/:id', requireOwner, productController.remove)

router.post('/:id/movements', productController.registerMovement)
router.get('/:id/movements', productController.movementHistory)

export default router