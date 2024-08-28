import express, {Request, Response} from 'express'
import measureRoutes from './routes/measureRoutes'
import formidable from 'express-formidable'
import path from 'path'
import filesRoutes from './routes/fileRoutes'

const app = express()

const port = 80

app.use(express.json({limit: '50mb'}))

app.use('/api', measureRoutes, filesRoutes)

app.use('/files', express.static(path.join(__dirname, 'temp')));

app.post('/', async (req: Request, res: Response) => {
  res.send("Running server")
})

app.listen(port, () => {
  console.log(`Server running at http:localhost:${port}`)
})
