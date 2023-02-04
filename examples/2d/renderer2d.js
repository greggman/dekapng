export default class Renderer2D {
  constructor() {
    this.ctx = document.createElement("canvas").getContext("2d");
  }
  drawArea(width, height, chunkX, chunkY, chunkWidth, chunkHeight) {
    const ctx = this.ctx;

    ctx.canvas.width = chunkWidth;
    ctx.canvas.height = chunkHeight;

    ctx.save();

    ctx.translate(-chunkX, -chunkY);
    ctx.translate(width / 2, height / 2);

    const max = Math.sqrt(width * width + height * height) * 1.2;
    for (let radius = 2; radius < max; radius += 4) {
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(200, 100, radius, 0, Math.PI * 2, false);
      ctx.stroke();
    }

    ctx.restore();

    return ctx.getImageData(0, 0, chunkWidth, chunkHeight);
  }
}