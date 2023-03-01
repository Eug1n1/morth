import { Router } from 'express'

import { router as mediaRouter } from './mediaRouter'
import { router as tagRouter } from './tagRouter'

export let router = Router()

router.use('/tags', tagRouter)
router.use('/media', mediaRouter)
