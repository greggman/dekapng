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
  }

  addRow(rowData: Uint8Array) {
    if (!this.rowsLeft) {
      throw new Error('too many rows');
    }
    --this.rowsLeft;

    // Write our row filter byte
    this.zlibWriter.writeUint8(0);

    rowData.forEach((data) => {
      this.zlibWriter.writeUint8(data);
    });
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


