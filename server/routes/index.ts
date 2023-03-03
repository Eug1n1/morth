import { Router } from 'express'

import { router as mediaRouter } from './mediaRouter'
import { router as tagRouter } from './tagRouter'
import { router as folderRouter } from './folderRouter'

export const router = Router()

router.use('/tags', tagRouter)
router.use('/media', mediaRouter)
router.use('/folders', folderRouter)
