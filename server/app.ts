import express, {} from 'express'

const app = express()

app.get('/', (req, res) => {
    res.send('works')
})

app.listen(3000)
