import express, { Application } from 'express'
import morgan from 'morgan'

import { router } from './routes'
import { logger } from './utils/logger'

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
app.use(morganMiddleware)

app.use('/api', router)

app.listen(3000)
