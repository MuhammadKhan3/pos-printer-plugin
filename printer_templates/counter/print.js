const escpos = require('escpos');
const ping = require('ping');

const PRINTER_IP = '192.168.123.100';
const PRINTER_PORT = 9100;

// Register a custom command to eliminate top margin completely
escpos.Printer.prototype.noTopMargin = function() {
  // Set print area - eliminate top margin
  this.buffer.write(Buffer.from([0x1B, 0x4C])); // ESC L - Enter page mode
  this.buffer.write(Buffer.from([0x1B, 0x57, 0x00, 0x00, 0x00, 0x00, 0x72, 0x02, 0x00, 0x02])); // ESC W - Set print area in page mode
  
  // Set absolute print position to top-most position
  this.buffer.write(Buffer.from([0x1B, 0x24, 0x00, 0x00])); // ESC $ - Set absolute print position to 0
  
  // Set line spacing to 0
  this.buffer.write(Buffer.from([0x1B, 0x33, 0x00])); // ESC 3 0 - set line spacing to minimum
  return this;
};

ping.sys.probe(PRINTER_IP, function(isAlive) {
  if (!isAlive) {
    return console.error(`Printer at ${PRINTER_IP} is not reachable.`);
  }

  const device = new escpos.Network(PRINTER_IP, PRINTER_PORT);
  const printer = new escpos.Printer(device);

  device.open(function(error) {
    if (error) return console.error('Error:', error);

    // Direct approach without any printer initialization
    const buffer = Buffer.from([
      // Set absolute vertical position to 0
      0x1B, 0x4A, 0x00,         // ESC J 0 - Feed 0 dots
      0x1D, 0x56, 0x00          // GS V 0 - Set cut position to current position
    ]);
    device.write(buffer);
    
    printer
     .hardwareInitialize()  // Reset printer to default settings
      .lineSpace(0)         // Eliminate line spacing
      .position(0)    
      .encode('GB18030')
      .text('*** RECEIPT SAMPLE ***')
      .drawLine()
      .align('lt')
      .text('Item 1       $10.00')
      .text('Item 2       $15.00')
      .drawLine()
      .align('rt')
      .text('Total: $25.00')
      .cut()
      .close();
  });
});