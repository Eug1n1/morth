import { Router, Request, Response } from 'express'
import MediaController from '../controllers/mediaController'

export const router = Router()

const mediaController = new MediaController()
router.get('/', mediaController.getAll)

router.get('/:uuid', mediaController.getOne)

router.get('/file/:uuid', mediaController.getMedia)

router.post('/', (req: Request, res: Response) => {
    res.json({
        file: req.query.file,
    })
})

