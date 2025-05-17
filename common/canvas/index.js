const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');


function generateCanvas (order_data){
    const PRINTER_WIDTH = 570;
    const canvasHeight = 100;
    const canvas = createCanvas(PRINTER_WIDTH, canvasHeight);
    const ctx = canvas.getContext('2d');

    // DELIVERY section (increase height to 100px)
    const orderTypeHorizontalPosition=((PRINTER_WIDTH/2)-100)
    if (order_data.instructions.orderTypeLabel) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, PRINTER_WIDTH, 60); // Increased from 40 to 100
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'CENTER';
        ctx.textBaseline = 'middle';
        ctx.fillText(order_data.instructions.orderTypeLabel.toUpperCase(),orderTypeHorizontalPosition , 30); // Centered vertically in 100px
    }else{
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, PRINTER_WIDTH, 60); // Increased from 40 to 100
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'CENTER';
        ctx.textBaseline = 'middle';
        ctx.fillText(order_data.instruction.Type.toUpperCase(),orderTypeHorizontalPosition, 30); // Centered vertically in 100px
        
    }

    if (order_data.customer_name) {
        // Bottom section moved down below 100px
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 60, PRINTER_WIDTH, 40); // Start at y=100
        ctx.fillStyle = '#000000';
        ctx.font = '100 25px Arial';
        ctx.font = 'bold 25px Arial';
        ctx.fillText(order_data.customer_name, 210, 80);
    }

    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, PRINTER_WIDTH, canvasHeight);

    // Save canvas to PNG file
    const outputPath = path.join(__dirname,'labels', 'orderTypes-canvas.png');    
    fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
    // Load image and print with image mode 'THRESHOLD' to ensure proper rendering
}



function generatePosReceipt (order_data){
    const PRINTER_WIDTH = 570;
    const canvasHeight = 100;
    const canvas = createCanvas(PRINTER_WIDTH, canvasHeight);
    const ctx = canvas.getContext('2d');

    // DELIVERY section (increase height to 100px)
    const orderTypeHorizontalPosition=((PRINTER_WIDTH/2)-100)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, PRINTER_WIDTH, 70); // Increased from 40 to 100
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'CENTER';
        ctx.textBaseline = 'middle';
        ctx.fillText("Chk " + order_data.pos_receipt_number,orderTypeHorizontalPosition , 40); // Centered vertically in 100px

        // Save canvas to PNG file
    const outputPath = path.join(__dirname,'labels', 'pos-receipt-no.png');    
    fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
    // Load image and print with image mode 'THRESHOLD' to ensure proper rendering
}

module.exports={generateCanvas,generatePosReceipt}
