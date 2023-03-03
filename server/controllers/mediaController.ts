import { Request, Response } from 'express'
import prisma from '../utils/db'

interface Type {
    type: string
}

type UuidParams = {
    uuid: string
}

export default class MediaController {
    public async getAll(
        req: Request<object, object, object, Type>,
        res: Response
    ) {
        const { type } = req.query

        if (type) {
            const media = await prisma.media.findMany({
                where: {
                    typeId: type,
                },
                select: {
                    uuid: true,
                    title: true,
                    type: true,
                },
            })

            res.json(media)

            return
        }

        res.json(
            await prisma.media.findMany({
                select: {
                    uuid: true,
                    title: true,
                    typeId: true,
                },
            })
        )
    }

    public async getOne(req: Request<UuidParams>, res: Response) {
        const { uuid } = req.params

        res.json(
            await prisma.media.findUnique({
                where: {
                    uuid: uuid,
                },
                select: {
                    uuid: true,
                    title: true,
                    typeId: true,
                    file: {
                        select: {
                            thumPath: true,
                        },
                    },
                },
            })
        )
    }

    public async getMedia(req: Request<UuidParams>, res: Response) {
        const { uuid } = req.params

        const media = await prisma.media.findUnique({
            where: {
                uuid: uuid,
            },
            select: {
                file: {
                    select: {
                        filePath: true,
                    },
                },
            },
        })

        if (media) {
            res.sendFile(media?.file.filePath)
        }
    }
}

// const path =
//     '/home/eug1n1/Downloads/Boulevard Depo x SP4K - Нонграта [jn7VU6_uq7g].mp4'

// const src = createReadStream(path)

// res.set('content-type', 'video/mpeg')
// res.set('accept-ranges', 'bytes')

// src.on('data', (chunk) => {
//     res.write(chunk)
// })

// src.on('end', () => {
//     res.end()
// })
