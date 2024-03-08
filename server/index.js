const express = require('express')
const expressWs = require('express-ws')
const cors = require('cors')
const { resolve } = require('node:path')
const cluster = require('node:cluster')
const { cpus } = require('node:os')
const totalCPUs = 1//cpus().length
const { RFIDReader } = require('./rfidreader')
const dayjs = require('dayjs')
const productInfo = require('./productInfo.js')

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0


if (cluster.isPrimary) {
    console.log(`Number of CPUs is ${totalCPUs}`)
    console.log(`Master ${process.pid} is running`)
    productInfo.init().then(() => {
        console.log('Product info loaded');
    })

    const rfidReader = new RFIDReader()
    // Fork workers.
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork()
    }

    cluster.on('message', (worker, msg, handle) => {
        if (msg.topic && msg.topic === 'OPENREADER') {
            rfidReader.open()
        }

        if (msg.topic && msg.topic === 'GETEPCs') {
            worker.send({
                topic: 'GETEPCs',
                epcs: rfidReader.EPCs
            });
        }
    })

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`)
        console.log("Let's fork another worker!")
        if (rfidReader.port.isOpen)
            rfidReader.close()
        cluster.fork()
    })

} else {

    process.send({ topic: 'OPENREADER' })

    const corsOptions = {
        origin: '*',
        credentials: true, //access-control-allow-credentials:true
        optionSuccessStatus: 200,
    }

    const wss = expressWs(express())
    const app = wss.app

    app.use(cors(corsOptions))
    app.use(express.urlencoded({ extended: true }))
    app.use(express.json({ limit: '5mb' })) // parse requests of content-type - application/json
    app.use(
        express.static(resolve(__dirname, 'client', 'dist'), {
            extensions: ['js'],
        })
    )

    app.get('*', (req, res, next) => {
        if (req.url.includes('ws') || req.url.includes('api')) return next()
        return res.sendFile(resolve(__dirname, 'client', 'dist', 'index.html'))
    })

    app.get('/api', (req, res) => {
        return res.send('RFID Reader API V1')
    })

    const getEpcs = async () => {
        return new Promise((resolve, reject) => {
            process.send({ topic: 'GETEPCs' })
            process.once('message', (msg) => {
                if (msg.topic && msg.topic === 'GETEPCs') {
                    resolve(msg.epcs)
                }
            });
        })
    }

    /**
     * 
     * @param {Array} epcs 
     */
    const calculateTags = (epcs) => {
        const tags = epcs.filter(x => Math.abs(dayjs(x.lastSeen).diff(x.firstSeen, 'minutes')) <= 1)
        return tags
    }

    app.get('/api/epcs', async (req, res, next) => {
        const epcs = await getEpcs()
        const calculatedEpcs = calculateTags(epcs)
        const products = await productInfo.getProducts(calculatedEpcs)
        
        res.json(products).status(200)
    })

    app.ws('/ws', function () { });

    setInterval(() => {
        wss.getWss('/ws').clients.forEach(async (client) => {
            const epcs = await getEpcs()
            const calculatedEpcs = calculateTags(epcs)
            const products = await productInfo.getProducts(calculatedEpcs)
            console.log(products);
            client.send(JSON.stringify(products));
        });
    }, 1000);

    // start express server on port 8080
    app.listen(8080, () => {
        console.log('http server started on port 8080')
    })
}

process.on('SIGTERM', () => {
    debug('SIGTERM signal received: closing server')
    server.close(() => {
        rfidReader.close()

        debug('Server closed')
    })
})
