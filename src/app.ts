import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes'
import productRoutes from './routes/product.routes'
import { errorHandler } from './middlewares/error.middleware'

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173']

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))

app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRoutes)
app.use('/products', productRoutes)

app.use(errorHandler)

export default app