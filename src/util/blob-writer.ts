import { ArrayBufferWalker } from './arraybuffer-walker';
import { crc32 } from './crc';
import { adler32_buf } from './adler';

// yes, I know. Crap!
export class BlobWriter extends ArrayBufferWalker {

  private blobs: Blob[] = [];
  private blob: Blob;
  private crcOffset?: number;
  private crc?: number;
  private adlerOffset?: number;
  private adler?: number;

  constructor(chunkSize = 1024 * 1024 * 16) {
    super(chunkSize)
  }
  writeUint32(value, littleEndian = false) {
    this.flushIfNoSpace(4);
    super.writeUint32(value, littleEndian);
  }

  writeUint16(value, littleEndian = false) {
    this.flushIfNoSpace(2);
    super.writeUint16(value, littleEndian);
  }

  writeUint8(value) {
    this.flushIfNoSpace(1);
    super.writeUint8(value);

  }

  writeString(value) {
    for (let i = 0, n = value.length; i < n; i++) {
      this.writeUint8(value.charCodeAt(i));
    }
  }

  startCRC() {
    if (this.crcOffset !== undefined) {
      throw new Error("CRC already started")
    }
    this.crc = undefined;
    this.crcOffset = this.offset;
  }

  writeCRC() {
    if (this.crcOffset === undefined) {
        throw new Error("CRC has not been started, cannot write");
    }

    const crc = crc32(this.array, this.crcOffset, this.offset - this.crcOffset, this.crc);
    this.crcOffset = undefined;
    this.writeUint32(crc);
  }

  startAdler() {
    if (this.adlerOffset !== undefined) {
      throw new Error("Adler already started")
    }
    this.adlerOffset = this.offset;
  }

  pauseAdler() {
    if (this.adlerOffset === undefined) {
        throw new Error("Adler has not been started, cannot pause");
    }
    this.adler = adler32_buf(this.array, this.adlerOffset, this.offset - this.adlerOffset, this.adler);
    this.adlerOffset = undefined;
  }

  // total hack!
  writeAdler(walker: ArrayBufferWalker) {
    if (this.adlerOffset === undefined && this.adler === undefined) {
        throw new Error("Adler has not been started, cannot pause");
    }

    if (this.adlerOffset === undefined) {
        walker.writeUint32(this.adler);
        this.adler = undefined;
        return;
    }

    const adler = adler32_buf(this.array, this.adlerOffset, this.offset - this.adlerOffset, this.adler);

    this.adlerOffset = undefined;
    this.adler = undefined;
    walker.writeUint32(adler);
  }

  flushIfNoSpace(spaceNeeded) {
    if (this.offset + spaceNeeded > this.array.length) {
      this.flush();
    }
  }

  flush() {
    if (this.offset) {
      if (this.crcOffset !== undefined) {
        this.crc = crc32(this.array, this.crcOffset, this.offset - this.crcOffset, this.crc);
        this.crcOffset = 0;
      }

      if (this.adlerOffset !== undefined) {
        this.adler = adler32_buf(this.array, this.adlerOffset, this.offset - this.adlerOffset, this.adler);
        this.adlerOffset = 0;
      }

      const data = new Uint8Array(this.array.buffer, 0, this.offset);
      const blob = new Blob([data]);
      this.blobs.push(blob);
      this.offset = 0;
    }
  }

  getBlob(type: string) {
    if (!this.blob) {
      this.flush();
      this.blob = new Blob(this.blobs, {type});
      this.blobs = [];
      this.array = new Uint8Array(0);
    }
    return this.blob;
  }
}



