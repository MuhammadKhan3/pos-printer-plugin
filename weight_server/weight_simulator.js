const SerialPort = require('serialport');

var com;

var read_str = '';

com = new SerialPort('COM1', {
baudRate: 9600,
databits: 7,
parity: 'even',
stopBits: 1
});



com.on('readable', function () {

    read_str = com.read().toString('ascii');

    console.log('Command: ' + read_str);
    
    read_str = read_str.replace(/(\r|\n|\r|\t|\s)/gm, "");

if (read_str == 'W') {

    // read_str = '00'+(Math.floor(Math.random() * 10) + 1) + '.';
    // read_str += (Math.floor(Math.random() * 99) + 1) + '00';

    read_str = '001.530';

    setTimeout(function(){
        com.write(read_str+' LB S20', function () {
            console.log('Weight: '+read_str+' LB S20');
        });
    }, 200);

    
    
}

});



