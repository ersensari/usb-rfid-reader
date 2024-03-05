const express = require('express')
const cors = require('cors')
const { resolve } = require('node:path')
const cluster = require('node:cluster')
const { cpus } = require('node:os')
const totalCPUs = cpus().length
const { RFIDReader } = require('./rfidreader')
const dayjs = require('dayjs')

const WebSocket = require('ws')

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0


if (cluster.isPrimary) {
    console.log(`Number of CPUs is ${totalCPUs}`)
    console.log(`Master ${process.pid} is running`)

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

    const app = express() // create express app
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
        const tags = epcs.filter(x => dayjs(x.lastSeen).diff(x.firstSeen, 'minutes') <= 1)
        return tags
    }

    app.get('/api/epcs', async (req, res, next) => {
        const epcs = await getEpcs()
        res.json(calculateTags(epcs)).status(200)
    })


    const wss = new WebSocket.WebSocketServer({ noServer: true });

    wss.on('connection', (ws) => {
        ws.on('error', console.error);
        ws.on('message', (data) => {
            console.log('received: %s', data);
        });

        setInterval(() => {
            wss.clients.forEach(async (client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    const epcs = await getEpcs()
                    client.send(calculateTags(epcs));
                }
            });
        }, 1000);
    });

    app.on('upgrade', (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req)
        })
    })

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
