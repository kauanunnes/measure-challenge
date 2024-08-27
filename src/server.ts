import dotenv from 'dotenv'
import express, {Request, Response} from 'express'
import measureRoutes from './routes/measureRoutes'

dotenv.config()

const app = express()

const port = 3434

app.use('/api', measureRoutes)

app.get('/', (req: Request, res: Response) => {
  res.send("Started server...")
})

app.listen(port, () => {
  console.log(`Server running at http:localhost:${port}`)
})
