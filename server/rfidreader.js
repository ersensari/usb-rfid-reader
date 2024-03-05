const dayjs = require('dayjs');
const { SerialPort } = require('serialport');

class RFIDReader {
    constructor() {
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


    open() {
        if (!this.port.isOpen && !this.port.opening) {
            this.port.on('open', () => {
                this.port.on('data', (data) => {
                    const text = Buffer.from(data).toString()
                    const regex = /^(?:\s+1\s+)([0-9A-F]{24})\b/gm;
                    let group2;
                    const tagList = []
                    while ((group2 = regex.exec(text)) !== null) {

                        if (!group2[1] || group2[1].length === 0) continue
                        const epc = group2[1]
                        tagList.push(epc)
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
                            if (!tagList.includes(x.epc) && dayjs(new Date()).diff(x.lastSeen, 'minutes') > 1)
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