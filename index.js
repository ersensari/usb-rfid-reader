const { SerialPort } = require('serialport');

// RFID serial port settings
const port = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: 'none',
});

// When the RFID connected
port.on('open', () => {
    //port.write('SET ANTENNAS -2 \r\n');
    port.write('SET INVENTORY 1 \r\n');
    setInterval(() => {
        port.write('GET TAGLIST\r\n');
    }, 1000);
    // read data from rfid
    port.on('data', (data) => {
        const text = Buffer.from(data).toString()
        const regex = /^(?:\s+1\s+)([0-9A-F]{24})\b/gm;
        let group2;
        while ((group2 = regex.exec(text)) !== null) {
            console.log(`${group2[1]}`);
        }
    });
});

// connection error callback
port.on('error', (error) => {
    console.error('An error occurred while connecting:', error.message);
});

port.close();
