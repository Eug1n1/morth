import { Router, Request, Response } from 'express'

export let router: Router = Router()

router.get('/', (req: Request, res: Response) => {
    res.json({
        tags: 'all',
    })
})

router.get('/:uuid', (req: Request, res: Response) => {
    res.json({
        uuid: req.params.uuid,
    })
})

router.post('/', (req: Request, res: Response) => {
    res.json(req.body)
})

