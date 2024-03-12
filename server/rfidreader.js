const dayjs = require('dayjs');
const { SerialPort } = require('serialport');
const { createClient } = require('redis')
class RFIDReader {
    constructor() {
        this.rClient = createClient({ url: 'redis://127.0.0.1:6379' })
        this.rClient.connect().then(x => {
            console.log('Redis Client Connected');
        })
        this.rClient.on('error', () => { throw new Error('Redis Client has not been connected') })
        this.EPCs = []
        // RFID serial port settings
        this.port = new SerialPort({
            path: '/dev/ttyUSB0',
            baudRate: 115200,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
            flowControl: 'none',
            autoOpen: false
        });

    }

    async getActiveEpcs() {
        const keys = await this.rClient.keys('*')
        return await Promise.all(keys.map(async (k) => JSON.parse(await this.rClient.get(k))))
    }

    open() {
        if (!this.port.isOpen && !this.port.opening) {
            this.port.on('open', () => {
                this.port.on('data', async (data) => {
                    const text = Buffer.from(data).toString()
                    const regex = /^(?:\s+1\s+)([0-9A-F]{24})\b/gm;
                    let group2;
                    const tagList = []
                    while ((group2 = regex.exec(text)) !== null) {

                        if (!group2[1] || group2[1].length === 0) continue
                        const epc = group2[1]
                        tagList.push(epc)

                        const rEpc = JSON.parse(await this.rClient.get(epc))
                        const expireAt = 10 // seconds
                        if (rEpc) {
                            const _epc = rEpc
                            _epc.lastSeen = new Date()
                            this.rClient.set(epc, JSON.stringify(_epc), { EX: expireAt })
                        } else {
                            this.rClient.set(epc, JSON.stringify({ epc, firstSeen: new Date(), lastSeen: new Date() }), { EX: expireAt })
                        }

                        if (this.EPCs.some(x => x?.epc === epc)) {
                            this.EPCs = this.EPCs.map(x => {
                                if (x?.epc === epc)
                                    return { epc: x.epc, firstSeen: x.firstSeen, lastSeen: new Date() }
                                else
                                    return x
                            })
                            continue
                        }
                        this.EPCs.push({ epc, firstSeen: new Date(), lastSeen: new Date() })
                    }

                    if (tagList.length > 0)
                        this.EPCs = this.EPCs.map(x => {
                            if (!tagList.includes(x.epc) && Math.abs(dayjs(new Date()).diff(x.lastSeen, 'seconds')) > 15)
                                return null
                            return x
                        }).filter(x => x)

                })
            })
            // connection error callback
            this.port.on('error', (error) => {
                console.error('An error occurred while connecting:', error.message);
            });
            // read data from rfid
            this.port.open((err) => {
                if (err) {
                    return console.log('Error opening port: ', err.message)
                }
                this.port.write(Buffer.from('SET ANTENNAS -2 \r\n'));
                this.port.write(Buffer.from('SET INVENTORY 1 \r\n'));


                setInterval(() => {
                    if (!this.port.write(Buffer.from('GET TAGLIST \r\n')))
                        throw new Error('Reader disconnected')
                }, 1000);

            })
        }
    }

    close() {
        this.port.close()
    }
}

exports.RFIDReader = RFIDReader