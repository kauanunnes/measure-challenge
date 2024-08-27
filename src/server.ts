import dotenv from 'dotenv'
import express, {Request, Response} from 'express'

dotenv.config()

const app = express()

const port = 3434

app.get('/', (req: Request, res: Response) => {
  res.send("Started server...")
})

app.listen(port, () => {
  console.log(`Server running at http:localhost:${port}`)
})
