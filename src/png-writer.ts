import { BlobWriter } from './util/blob-writer';
import { writePreheader as writePreheader, length as PreheaderLength } from './chunks/pre-header';
import { writeIHDR as writeIHDR, IHDRLength as IHDRLength, PNGColorType } from './chunks/ihdr';
import { writeIEND as writeIEND, length as IENDLength } from './chunks/iend';
import { writeIDAT as writeIDAT, calculateIDATLength as calculateIDATLength, writeIDATConstant as writeIDATConstant } from './chunks/idat';
import { calculateZlibbedLength, ZlibWriter } from './util/zlib';


/**
 * Create a PngPong-suitable PNG ArrayBuffer from an existing RGBA array. Combine
 * this with PNGJS to transform an existing PNG image into something PngPong can use.
 *
 * @export
 * @param {number} width
 * @param {number} height
 * @returns
 */
export class PNGRGBAWriter {

  private walker: BlobWriter;
  private zlibWriter: ZlibWriter;
  private rowsLeft: number;
  private xOffset: number = 0;
  private width: number;

  constructor(width: number, height: number) {
    const walker = new BlobWriter();
    writePreheader(walker);
    writeIHDR(walker, {
        width: width,
        height: height,
        colorType: PNGColorType.RGBA,
        bitDepth: 8,
        compressionMethod: 0,
        filter: 0,
        interface: 0
    });

    // We need to account for a row filter pixel in our chunk length
    const dataSize = width * height * 4 + height;

    // Zlibbed data will take up more space than the raw data
    walker.writeUint32(calculateZlibbedLength(dataSize));

    walker.startCRC();
    walker.writeString("IDAT");

    const zlibWriter = new ZlibWriter(walker, dataSize);

    this.walker = walker;
    this.zlibWriter = zlibWriter;
    this.rowsLeft = height;
    this.width = width;
  }

  addPixels(data: Uint8Array, byteOffset: number, numPixels: number) {
    if (!this.rowsLeft) {
      throw new Error('too many rows');
    }

    for(let i = 0; i < numPixels; ++i) {
      if (this.xOffset === 0) {
        // Write our row filter byte
        this.zlibWriter.writeUint8(0);
      }
      const offset = byteOffset + i * 4;
      this.zlibWriter.writeUint8(data[offset + 0]);
      this.zlibWriter.writeUint8(data[offset + 1]);
      this.zlibWriter.writeUint8(data[offset + 2]);
      this.zlibWriter.writeUint8(data[offset + 3]);

      ++this.xOffset;
      if (this.xOffset === this.width) {
        this.xOffset = 0;
        --this.rowsLeft;
      }
    }
  }

  addRow(rowData: Uint8Array) {
    this.addPixels(rowData, 0, rowData.length / 4);
  }

  finishAndGetBlob() {
    if (this.rowsLeft) {
      throw new Error(`${this.rowsLeft} rows left`);
    }

    this.zlibWriter.end();
    this.walker.writeCRC();

    writeIEND(this.walker);
    return this.walker.getBlob('image/png');
  }
}


