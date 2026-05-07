import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes'
import productRoutes from './routes/product.routes'
import { errorHandler } from './middlewares/error.middleware'

const app = express()

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRoutes)
app.use('/products', productRoutes)

app.use(errorHandler)

export default app