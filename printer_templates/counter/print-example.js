const escpos = require('escpos');
const device  = new escpos.Network('192.168.18.245');
const options = { encoding: "GB18030" /* default */ };
// encoding is optional
 
const printer = new escpos.Printer(device, options); 
 
escpos.Image.load(__dirname + 'tux.png', function(image){

  device.open(function(){

    printer
    .align('ct')
    .image(image, 's8')
    .image(image, 'd8')
    .image(image, 's24')
    .image(image, 'd24')
    
    .raster(image)
    .raster(image, 'dw')
    .raster(image, 'dh')
    .raster(image, 'dwdh')
    .cut();
  });
});