import { Router, Request, Response } from 'express'

export let router: Router = Router()


router.get('/auth', (req: Request, res: Response) => {
    res.json({
        'auth': 'ok'
    })
})

router.post('/login', (req: Request, res: Response) => {
    res.json({
        'login': 'ok'
    })
})

router.post('/registation', (req: Request, res: Response) => {
    res.json({
        'registation': 'ok'
    })
})

