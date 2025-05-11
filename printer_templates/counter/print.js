

const escpos = require('escpos');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

escpos.Network = require('escpos-network');


// Set up printer
const PRINTER_IP_ADDRESS = '192.168.18.245';
const PRINTER_PORT = 9100;
const options = { encoding: "CP437" }; // Supported encoding

const device =  new escpos.Network(PRINTER_IP_ADDRESS);
const printer = new escpos.Printer(device,options);


const PRINTER_WIDTH = 570;
const canvasHeight = 100;
const canvas = createCanvas(PRINTER_WIDTH, canvasHeight);
const ctx = canvas.getContext('2d');

// DELIVERY section (increase height to 100px)
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, PRINTER_WIDTH, 60); // Increased from 40 to 100
ctx.fillStyle = '#FFFFFF';
ctx.font = 'bold 50px Arial';
ctx.textAlign = 'left';
ctx.textBaseline = 'middle';
ctx.fillText('DELIVERY', 10, 30); // Centered vertically in 100px

// Bottom section moved down below 100px
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 60, PRINTER_WIDTH, 40); // Start at y=100
ctx.fillStyle = '#000000';
ctx.font = '25px Arial';
ctx.fillText('Ready for driver by', 10, 80); // Adjusted Y position
ctx.font = 'bold 25px Arial';
ctx.fillText('Apr. 15, 10:14am', 260, 80);

// Border
ctx.strokeStyle = '#000000';
ctx.lineWidth = 3;
ctx.strokeRect(0, 0, PRINTER_WIDTH, canvasHeight);

// Save canvas to PNG file
const outputPath = path.join(__dirname, 'temp-delivered.png');
fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));




  device.open(function (error) {
    if (error) {
      console.error('Connection error:', error);
      return;
    }


 printer
    .tableCustom(
      [
        { text: "Left", align: "LEFT", width: 0.33, style: 'B' },
        { text: "Center", align: "CENTER", width: 0.33 },
        { text: "Right", align: "RIGHT", width: 0.33 }
      ]
    )
    .text("")
    .text("")
    .cut()
    .close();
    });
