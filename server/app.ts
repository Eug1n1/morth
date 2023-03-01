import express, { Router, Request, Response } from 'express'
import { router } from './routes'

const app = express()

app.use(express.json())

app.use('/api', router)

app.listen(3000)
