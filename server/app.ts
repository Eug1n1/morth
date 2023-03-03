import express, { Application } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import path from 'path'

import { router } from './routes'
import { logger } from './utils/logger'

const PORT = process.env.PORT || 3000

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }
);

const app: Application = express()

app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, 'static')))
app.use(morganMiddleware)

app.use('/api', router)

app.listen(PORT, () => {
    logger.info(`http://localhost:${PORT}`)
})
