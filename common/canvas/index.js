const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

function generateCanvas(order_data) {
  const PRINTER_WIDTH = 570;
  let canvas = null;
  let ctx = null;
  console.log(order_data.instructions.orderTypeLabel.trim().toLowerCase());
  // DELIVERY section (increase height to 100px)
  const orderTypeHorizontalPosition = 10;
  if (order_data.instructions.orderTypeLabel.toLowerCase() === "pickup") {
    const canvasHeight = 100;
    canvas = createCanvas(PRINTER_WIDTH, canvasHeight);
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, PRINTER_WIDTH, 60); // Increased from 40 to 100
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "CENTER";
    ctx.textBaseline = "middle";
    ctx.fillText(
      order_data.instructions.orderTypeLabel.toUpperCase(),
      orderTypeHorizontalPosition,
      30
    ); // Centered vertically in 100px
    if (order_data.customer_name) {
      // Bottom section moved down below 100px
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 60, PRINTER_WIDTH, 40); // Start at y=100
      ctx.fillStyle = "#000000";
      ctx.font = "500 25px Arial";
      ctx.fillText(order_data.customer_name, orderTypeHorizontalPosition, 80);
    }
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, PRINTER_WIDTH, canvasHeight);
  } else if (
    order_data.instructions.orderTypeLabel.toLowerCase() === "eat in"
  ) {
    const canvasHeight = 130;
    canvas = createCanvas(PRINTER_WIDTH, canvasHeight);
    ctx = canvas.getContext("2d");

    if (order_data.fireLine != undefined && order_data.fireLine == true) {
      fire_line = "FIRE -> ";
    } else {
      fire_line = "";
    }

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, PRINTER_WIDTH, 60); // Increased from 40 to 100
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "CENTER";
    ctx.textBaseline = "middle";
    ctx.fillText(
      order_data.instructions.orderTypeLabel.toUpperCase(),
      orderTypeHorizontalPosition,
      30
    ); // Centered vertically in 100px
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 60, PRINTER_WIDTH, 40);
    ctx.fillStyle = "#000000";
    ctx.font = "500 30px Arial";
    ctx.fillText(fire_line + "Table  " + order_data.table_name, orderTypeHorizontalPosition, 80);

    // Customer name section
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 120, PRINTER_WIDTH, 40);
    ctx.fillStyle = "#000000";
    ctx.font = "500 25px Arial";

    ctx.fillText(order_data.customer_name, orderTypeHorizontalPosition, 110);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, PRINTER_WIDTH, canvasHeight);
  } else if (
    order_data.instructions.orderTypeLabel.trim().toLowerCase() == "delivery"
  ) {
    const canvasHeight = 310;
    canvas = createCanvas(PRINTER_WIDTH, canvasHeight);
    ctx = canvas.getContext("2d");

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, PRINTER_WIDTH, 60); // Increased from 40 to 100
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "LEFT";
    ctx.textBaseline = "middle";
    ctx.fillText(
      order_data.instructions.orderTypeLabel.toUpperCase(),
      orderTypeHorizontalPosition,
      30
    ); // Centered vertically in 100px

    const addressLines = order_data.payment_info.address
      .split("\n")
      .filter((line) => line.trim() !== "");

    const boxX = 0;
    const boxY = 60;
    const lineHeight = 30;
    const boxHeight = (addressLines.length+2) * lineHeight;
    const boxWidth = PRINTER_WIDTH;

    // Draw bordered box
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight+10);

    // Print each line
    ctx.fillStyle = "#000000";
    ctx.font = "500 25px Arial";
    ctx.textAlign = "CENTER";
    ctx.textBaseline = "top";

    let y = boxY;
    ctx.fillText(order_data.customer_name,10, y);
    y=y+lineHeight
    for (const line of addressLines) {
      ctx.fillText(line.trim(),10, y);
      y += lineHeight;
    }
    ctx.fillText(order_data.customer_phone,10, y);
    y=y+lineHeight
  }

  // Border

  // Save canvas to PNG file
  const outputPath = path.join(__dirname, "labels", "orderTypes-canvas.png");
  fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));
  // Load image and print with image mode 'THRESHOLD' to ensure proper rendering
}

function generatePosReceipt(order_data) {
  const PRINTER_WIDTH = 570;
  const canvasHeight = 100;
  const canvas = createCanvas(PRINTER_WIDTH, canvasHeight);
  const ctx = canvas.getContext("2d");

  // DELIVERY section (increase height to 100px)
  const orderTypeHorizontalPosition = PRINTER_WIDTH / 2 - 100;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, PRINTER_WIDTH, 70); // Increased from 40 to 100
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 50px Arial";
  ctx.textAlign = "CENTER";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "Chk " + order_data.pos_receipt_number,
    orderTypeHorizontalPosition,
    40
  ); // Centered vertically in 100px

  // Save canvas to PNG file
  const outputPath = path.join(__dirname, "labels", "pos-receipt-no.png");
  fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));
  // Load image and print with image mode 'THRESHOLD' to ensure proper rendering
}

module.exports = { generateCanvas, generatePosReceipt };
