import { Request, Response } from 'express'
import * as productService from '../services/product.service'

export async function create(req: Request, res: Response) {
  const parsed = productService.createProductSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { storeId } = res.locals.user
  const product = await productService.createProduct(storeId, parsed.data)
  res.status(201).json(product)
}

export async function list(req: Request, res: Response) {
  const { storeId } = res.locals.user
  const products = await productService.listProducts(storeId)
  res.json(products)
}

export async function update(req: Request, res: Response) {
  const parsed = productService.updateProductSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { storeId } = res.locals.user
  const product = await productService.updateProduct(req.params.id as string, storeId, parsed.data)
  res.json(product)
}

export async function remove(req: Request, res: Response) {
  const { storeId } = res.locals.user
  await productService.deleteProduct(req.params.id as string, storeId)
  res.status(204).send()
}

export async function registerMovement(req: Request, res: Response) {
  const parsed = productService.movementSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { storeId, userId } = res.locals.user
  const movement = await productService.registerMovement(
    req.params.id as string,
    storeId,
    userId,
    parsed.data
  )
  res.status(201).json(movement)
}

export async function movementHistory(req: Request, res: Response) {
  const { storeId } = res.locals.user
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20

  const result = await productService.getMovementHistory(
    req.params.id as string,
    storeId,
    page,
    limit
  )
  res.json(result)
}

export async function lowStockAlerts(req: Request, res: Response) {
  const { storeId } = res.locals.user
  const products = await productService.getLowStockAlerts(storeId)
  res.json(products)
}