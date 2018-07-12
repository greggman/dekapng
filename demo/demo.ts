// Really simple demo that generates a tiny png

import { PNGRGBAWriter } from "../src";

const saveData = (function() {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";
  return function saveData(blob, fileName) {
     const url = window.URL.createObjectURL(blob);
     a.href = url;
     a.download = fileName;
     a.click();
  };
}());

// example of writing an RGBA png
{
  const pixels = new Uint8Array([
    0xFF, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x00, 0xFF, 0xFF, 0xFF, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0xFF,
    0xFF, 0xFF, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x00, 0xFF,
    0xFF, 0x00, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0xFF, 0xFF,
    0xFF, 0x00, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0xFF, 0xFF, 0x00, 0xFF, 0x00, 0x00, 0x00, 0xFF,
  ]);
  const width = 4;
  const height = 4;
  const lineSize = width * 4;
  const pngRGBAWriter = new PNGRGBAWriter(width, height);
  for (let y = 0; y < height; ++y) {
    const row = new Uint8Array(pixels.buffer, y * lineSize, lineSize);
    pngRGBAWriter.addRow(row);
  }
  const blob = pngRGBAWriter.finishAndGetBlob();
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.src = url;
  img.style.width = `${width * 16}px`;
  document.body.appendChild(img);
  saveData(blob, "gen.png");
}



