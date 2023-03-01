import { Router, Request, Response, query } from 'express'

export let router = Router()

router.get('/', (req: Request, res: Response) => {
    if (req.query.type) {
        res.json({
            type: req.query.type 
        })

        return
    }

    res.json({
        media: 'all',
    })
})

router.get('/:uuid', (req: Request, res: Response) => {
    res.json({
        uuid: req.params.uuid,
    })
})

router.post('/', (req: Request, res: Response) => {
    res.json({
        file: req.query.file
    })    
})
