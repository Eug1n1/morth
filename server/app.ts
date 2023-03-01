import express, { Application } from 'express'
import morgan from 'morgan'

import { router } from './routes'

const app: Application = express()

app.use(express.json())
app.use(morgan('dev'))

app.use('/api', router)

app.listen(3000)
