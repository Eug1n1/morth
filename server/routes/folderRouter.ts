import { Router, Request, Response, query } from 'express'

export let router = Router()

router.get('/', (req: Request, res: Response) => {
    res.json({
        folders: 'all',
        search: req.query.search,
    })
})

router.get('/:uuid', (req: Request, res: Response) => {
    res.json({
        folder: req.params.uuid,
    })
})

router.post('/', (req: Request, res: Response) => {
    res.json({
        folder: 'added',
    })
})

router.put('/', (req: Request, res: Response) => {
    res.json({
        folder: 'altered',
    })
})
