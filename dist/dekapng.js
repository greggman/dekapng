(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["dekapng"] = factory();
	else
		root["dekapng"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Calculate the ADLER32 checksum of a section of a buffer. Code largely taken from:
 * https://github.com/SheetJS/js-adler32
 *
 * @export
 * @param {(Uint8Array | Uint8ClampedArray)} buf
 * @param {number} offset
 * @param {number} length
 * @param {number} [seed]
 * @returns
 */
function adler32_buf(buf, offset, length, seed) {
    var a = 1, b = 0, L = offset + length, M = 0;
    if (typeof seed === 'number') {
        a = seed & 0xFFFF;
        b = (seed >>> 16) & 0xFFFF;
    }
    for (var i = offset; i < L;) {
        M = Math.min(L - i, 3850) + i;
        for (; i < M; i++) {
            a += buf[i] & 0xFF;
            b += a;
        }
        a = (15 * (a >>> 16) + (a & 65535));
        b = (15 * (b >>> 16) + (b & 65535));
    }
    return ((b % 65521) << 16) | (a % 65521);
}
exports.adler32_buf = adler32_buf;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var crc_1 = __webpack_require__(2);
var adler_1 = __webpack_require__(0);
function swap16(val) {
    return ((val & 0xFF) << 8)
        | ((val >> 8) & 0xFF);
}
function swap32(val) {
    return ((val & 0xFF) << 24)
        | ((val & 0xFF00) << 8)
        | ((val >> 8) & 0xFF00)
        | ((val >> 24) & 0xFF);
}
/**
 * A class that "walks" through an ArrayBuffer, either reading or writing
 * values as it goes. Intended as a less performance-draining alternative
 * to a DataView.
 *
 * @export
 * @class ArrayBufferWalker
 */
var ArrayBufferWalker = /** @class */ (function () {
    /**
     * Creates an instance of ArrayBufferWalker.
     * @param {(ArrayBuffer | number)} bufferOrLength - either an existing ArrayBuffer
     * or the length of a new array you want to use.
     *
     * @memberof ArrayBufferWalker
     */
    function ArrayBufferWalker(bufferOrLength) {
        this.bufferOrLength = bufferOrLength;
        /**
         * The current index our walker is sat at. Can be modified.
         *
         * @memberof ArrayBufferWalker
         */
        this.offset = 0;
        if (bufferOrLength instanceof ArrayBuffer) {
            this.array = new Uint8Array(bufferOrLength);
        }
        else {
            this.array = new Uint8Array(bufferOrLength);
        }
    }
    ArrayBufferWalker.prototype.writeUint32 = function (value, littleEndian) {
        if (littleEndian === void 0) { littleEndian = false; }
        if (littleEndian) {
            value = swap32(value);
        }
        this.array[this.offset++] = (value >> 24) & 255;
        this.array[this.offset++] = (value >> 16) & 255;
        this.array[this.offset++] = (value >> 8) & 255;
        this.array[this.offset++] = value & 255;
    };
    ArrayBufferWalker.prototype.writeUint16 = function (value, littleEndian) {
        if (littleEndian === void 0) { littleEndian = false; }
        if (littleEndian) {
            value = swap16(value);
        }
        this.array[this.offset++] = (value >> 8) & 255;
        this.array[this.offset++] = value & 255;
    };
    ArrayBufferWalker.prototype.writeUint8 = function (value) {
        this.array[this.offset++] = value & 255;
    };
    ArrayBufferWalker.prototype.writeString = function (value) {
        for (var i = 0, n = value.length; i < n; i++) {
            this.array[this.offset++] = value.charCodeAt(i);
        }
    };
    ArrayBufferWalker.prototype.readUint32 = function (littleEndian) {
        if (littleEndian === void 0) { littleEndian = false; }
        var val = this.array[this.offset++] << 24;
        val += this.array[this.offset++] << 16;
        val += this.array[this.offset++] << 8;
        val += this.array[this.offset++] & 255;
        return littleEndian ? swap32(val) : val;
    };
    ArrayBufferWalker.prototype.readUint16 = function (littleEndian) {
        if (littleEndian === void 0) { littleEndian = false; }
        var val = this.array[this.offset++] << 8;
        val += this.array[this.offset++] & 255;
        return littleEndian ? swap16(val) : val;
    };
    ArrayBufferWalker.prototype.readUint8 = function () {
        return this.array[this.offset++] & 255;
    };
    ArrayBufferWalker.prototype.readString = function (length) {
        var result = "";
        var target = this.offset + length;
        while (this.offset < target) {
            result += String.fromCharCode(this.array[this.offset++]);
        }
        return result;
    };
    /**
     * Move around the array without writing or reading a value.
     *
     * @param {any} length
     *
     * @memberof ArrayBufferWalker
     */
    ArrayBufferWalker.prototype.skip = function (length) {
        this.offset += length;
    };
    ArrayBufferWalker.prototype.rewindUint32 = function () {
        this.offset -= 4;
    };
    ArrayBufferWalker.prototype.rewindString = function (length) {
        this.offset -= length;
    };
    /**
     * Mark the beginning of an area we want to calculate the CRC for.
     *
     * @memberof ArrayBufferWalker
     */
    ArrayBufferWalker.prototype.startCRC = function () {
        if (this.crcStartOffset) {
            throw new Error("CRC already started");
        }
        this.crcStartOffset = this.offset;
    };
    /**
     * After using .startCRC() to mark the start of a block, use this to mark the
     * end of the block and write the UInt32 CRC value.
     *
     * @memberof ArrayBufferWalker
     */
    ArrayBufferWalker.prototype.writeCRC = function () {
        if (this.crcStartOffset === undefined) {
            throw new Error("CRC has not been started, cannot write");
        }
        var crc = crc_1.crc32(this.array, this.crcStartOffset, this.offset - this.crcStartOffset);
        this.crcStartOffset = undefined;
        this.writeUint32(crc);
    };
    /**
     * Similar to .startCRC(), this marks the start of a block we want to calculate the
     * ADLER32 checksum of.
     *
     * @memberof ArrayBufferWalker
     */
    ArrayBufferWalker.prototype.startAdler = function () {
        if (this.adlerStartOffset) {
            throw new Error("Adler already started");
        }
        this.adlerStartOffset = this.offset;
    };
    /**
     * ADLER32 is used in our ZLib blocks, but can span across multiple blocks. So sometimes
     * we need to pause it in order to start a new block.
     *
     * @memberof ArrayBufferWalker
     */
    ArrayBufferWalker.prototype.pauseAdler = function () {
        if (this.adlerStartOffset === undefined) {
            throw new Error("Adler has not been started, cannot pause");
        }
        this.savedAdlerValue = adler_1.adler32_buf(this.array, this.adlerStartOffset, this.offset - this.adlerStartOffset, this.savedAdlerValue);
        this.adlerStartOffset = undefined;
    };
    /**
     * Similar to .writeCRC(), this marks the end of an ADLER32 checksummed block, and
     * writes the Uint32 checksum value to the ArrayBuffer.
     *
     * @returns
     *
     * @memberof ArrayBufferWalker
     */
    ArrayBufferWalker.prototype.writeAdler = function (walker) {
        if (this.adlerStartOffset === undefined && this.savedAdlerValue === undefined) {
            throw new Error("CRC has not been started, cannot write");
        }
        if (this.adlerStartOffset === undefined) {
            walker.writeUint32(this.savedAdlerValue);
            this.savedAdlerValue = undefined;
            return;
        }
        var adler = adler_1.adler32_buf(this.array, this.adlerStartOffset, this.offset - this.adlerStartOffset, this.savedAdlerValue);
        this.adlerStartOffset = undefined;
        walker.writeUint32(adler);
    };
    return ArrayBufferWalker;
}());
exports.ArrayBufferWalker = ArrayBufferWalker;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Generated by `./pycrc.py --algorithm=table-driven --model=crc-32 --generate=c`
var TABLE = new Int32Array([
    0x00000000, 0x77073096, 0xee0e612c, 0x990951ba,
    0x076dc419, 0x706af48f, 0xe963a535, 0x9e6495a3,
    0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988,
    0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91,
    0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de,
    0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7,
    0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec,
    0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5,
    0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172,
    0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b,
    0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940,
    0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59,
    0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116,
    0x21b4f4b5, 0x56b3c423, 0xcfba9599, 0xb8bda50f,
    0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924,
    0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d,
    0x76dc4190, 0x01db7106, 0x98d220bc, 0xefd5102a,
    0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433,
    0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818,
    0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01,
    0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e,
    0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457,
    0x65b0d9c6, 0x12b7e950, 0x8bbeb8ea, 0xfcb9887c,
    0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65,
    0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2,
    0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb,
    0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0,
    0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9,
    0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086,
    0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
    0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4,
    0x59b33d17, 0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad,
    0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a,
    0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683,
    0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8,
    0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1,
    0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe,
    0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7,
    0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc,
    0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5,
    0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252,
    0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b,
    0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60,
    0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79,
    0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236,
    0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f,
    0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04,
    0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d,
    0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a,
    0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713,
    0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38,
    0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21,
    0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e,
    0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777,
    0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c,
    0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45,
    0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2,
    0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db,
    0xaed16a4a, 0xd9d65adc, 0x40df0b66, 0x37d83bf0,
    0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
    0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6,
    0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf,
    0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94,
    0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d
]);
/**
 * Calculate the CRC value of a selected slice of an ArrayBuffer. Code from:
 * https://github.com/alexgorbatchev/node-crc/blob/master/src/crc32.js
 *
 * @export
 * @param {(Uint8Array | Uint8ClampedArray)} buf
 * @param {number} offset
 * @param {number} length
 * @param {number} [previous]
 * @returns {number}
 */
function crc32(buf, offset, length, previous) {
    var crc = previous === 0 ? 0 : ~~previous ^ -1;
    for (var index = offset; index < offset + length; index++) {
        var byte = buf[index];
        crc = TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return crc ^ -1;
}
exports.crc32 = crc32;
;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var arraybuffer_walker_1 = __webpack_require__(1);
var blob_writer_1 = __webpack_require__(8);
var pre_header_1 = __webpack_require__(6);
var ihdr_1 = __webpack_require__(5);
var iend_1 = __webpack_require__(4);
var zlib_1 = __webpack_require__(9);
var MAX_CHUNK_SIZE = Math.pow(2, 31) - 1;
var IDATChunker = /** @class */ (function (_super) {
    __extends(IDATChunker, _super);
    // note: this data size is actual compression bytes not pixel data
    // compression size > pixel data size
    function IDATChunker(walker, dataSize) {
        var _this = _super.call(this, 0) || this;
        _this.walker = walker;
        _this.bytesLeft = dataSize;
        _this.startChunk();
        return _this;
    }
    IDATChunker.prototype.startChunk = function () {
        var chunkSize = Math.min(MAX_CHUNK_SIZE, this.bytesLeft);
        this.bytesLeftInChunk = chunkSize;
        this.bytesLeft -= chunkSize;
        this.walker.writeUint32(chunkSize);
        this.walker.startCRC();
        this.walker.writeString("IDAT");
    };
    IDATChunker.prototype.endChunk = function () {
        this.walker.writeCRC();
    };
    IDATChunker.prototype.isFinished = function () {
        return this.bytesLeft === 0 && this.bytesLeftInChunk === 0;
    };
    IDATChunker.prototype.writeUint8 = function (v) {
        this.walker.writeUint8(v);
        --this.bytesLeftInChunk;
        if (this.bytesLeftInChunk === 0) {
            this.endChunk();
            if (this.bytesLeft) {
                this.startChunk();
            }
        }
    };
    IDATChunker.prototype.writeUint16 = function (v, littleEndian) {
        if (littleEndian === void 0) { littleEndian = false; }
        if (littleEndian) {
            this.writeUint8(v & 0xFF);
            this.writeUint8((v >> 8) & 0xFF);
        }
        else {
            this.writeUint8((v >> 8) & 0xFF);
            this.writeUint8(v & 0xFF);
        }
    };
    IDATChunker.prototype.writeUint32 = function (v, littleEndian) {
        if (littleEndian === void 0) { littleEndian = false; }
        if (littleEndian) {
            this.writeUint8(v & 0xFF);
            this.writeUint8((v >> 8) & 0xFF);
            this.writeUint8((v >> 16) & 0xFF);
            this.writeUint8((v >> 24) & 0xFF);
        }
        else {
            this.writeUint8((v >> 24) & 0xFF);
            this.writeUint8((v >> 16) & 0xFF);
            this.writeUint8((v >> 8) & 0xFF);
            this.writeUint8(v & 0xFF);
        }
    };
    IDATChunker.prototype.startAdler = function () {
        this.walker.startAdler();
    };
    IDATChunker.prototype.pauseAdler = function () {
        this.walker.pauseAdler();
    };
    // TOTAL HACK!
    IDATChunker.prototype.writeAdler = function (walker) {
        this.walker.writeAdler(this);
    };
    return IDATChunker;
}(arraybuffer_walker_1.ArrayBufferWalker));
/**
 * Create a PngPong-suitable PNG ArrayBuffer from an existing RGBA array. Combine
 * this with PNGJS to transform an existing PNG image into something PngPong can use.
 *
 * @export
 * @param {number} width
 * @param {number} height
 * @returns
 */
var PNGRGBAWriter = /** @class */ (function () {
    function PNGRGBAWriter(width, height) {
        this.xOffset = 0;
        var walker = new blob_writer_1.BlobWriter();
        pre_header_1.writePreheader(walker);
        ihdr_1.writeIHDR(walker, {
            width: width,
            height: height,
            colorType: ihdr_1.PNGColorType.RGBA,
            bitDepth: 8,
            compressionMethod: 0,
            filter: 0,
            interface: 0
        });
        // We need to account for a row filter pixel in our chunk length
        var dataSize = width * height * 4 + height;
        var chunker = new IDATChunker(walker, zlib_1.calculateZlibbedLength(dataSize));
        var zlibWriter = new zlib_1.ZlibWriter(chunker, dataSize);
        this.chunker = chunker;
        this.zlibWriter = zlibWriter;
        this.walker = walker;
        this.rowsLeft = height;
        this.width = width;
    }
    PNGRGBAWriter.prototype.addPixels = function (data, byteOffset, numPixels) {
        if (!this.rowsLeft) {
            throw new Error('too many rows');
        }
        for (var i = 0; i < numPixels; ++i) {
            if (this.xOffset === 0) {
                // Write our row filter byte
                this.zlibWriter.writeUint8(0);
            }
            var offset = byteOffset + i * 4;
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
    };
    PNGRGBAWriter.prototype.addRow = function (rowData) {
        this.addPixels(rowData, 0, rowData.length / 4);
    };
    PNGRGBAWriter.prototype.finishAndGetBlob = function () {
        if (this.rowsLeft) {
            throw new Error(this.rowsLeft + " rows left");
        }
        this.zlibWriter.end();
        if (!this.chunker.isFinished()) {
            throw new Error('bug!');
        }
        iend_1.writeIEND(this.walker);
        return this.walker.getBlob('image/png');
    };
    return PNGRGBAWriter;
}());
exports.PNGRGBAWriter = PNGRGBAWriter;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var identifier = "IEND";
/**
 * There is no actual content in an IEND chunk, just the identifier
 * and CRC.
 *
 * @export
 * @param {ArrayBufferWalker} walker
 */
function writeIEND(walker) {
    walker.writeUint32(0);
    walker.startCRC();
    walker.writeString(identifier);
    walker.writeCRC();
}
exports.writeIEND = writeIEND;
exports.length = identifier.length // identifier
    + 4 // CRC
    + 4; // length


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The color type our image uses. PngPong currently only supports
 * Palette images, PNGColorType.Palette
 *
 * @export
 * @enum {number}
 */
var PNGColorType;
(function (PNGColorType) {
    PNGColorType[PNGColorType["Grayscale"] = 0] = "Grayscale";
    PNGColorType[PNGColorType["RGB"] = 2] = "RGB";
    PNGColorType[PNGColorType["Palette"] = 3] = "Palette";
    PNGColorType[PNGColorType["GrayscaleWithAlpha"] = 4] = "GrayscaleWithAlpha";
    PNGColorType[PNGColorType["RGBA"] = 6] = "RGBA";
})(PNGColorType = exports.PNGColorType || (exports.PNGColorType = {}));
function writeIHDR(walker, options) {
    // IHDR length is always 13 bytes
    walker.writeUint32(13);
    walker.startCRC();
    walker.writeString("IHDR");
    walker.writeUint32(options.width);
    walker.writeUint32(options.height);
    walker.writeUint8(options.bitDepth);
    walker.writeUint8(options.colorType);
    walker.writeUint8(options.compressionMethod);
    walker.writeUint8(options.filter);
    walker.writeUint8(options.interface);
    walker.writeCRC();
}
exports.writeIHDR = writeIHDR;
/**
 *  IHDR length is always 13 bytes. So we can store this as a constant.
 */
exports.IHDRLength = 4 // Chunk length identifier
    + 4 // chunk header
    + 13 // actual IHDR length
    + 4; // CRC32 check;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var PRE_HEADER = '\x89PNG\r\n\x1A\n';
/**
 * PNG files have a very basic header that identifies the PNG
 * file as... a PNG file. We need to write that out.
 *
 * @export
 * @param {ArrayBufferWalker} walker
 */
function writePreheader(walker) {
    walker.writeString(PRE_HEADER);
}
exports.writePreheader = writePreheader;
exports.length = PRE_HEADER.length;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var png_writer_1 = __webpack_require__(3);
exports.PNGRGBAWriter = png_writer_1.PNGRGBAWriter;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var arraybuffer_walker_1 = __webpack_require__(1);
var crc_1 = __webpack_require__(2);
var adler_1 = __webpack_require__(0);
// yes, I know. Crap!
var BlobWriter = /** @class */ (function (_super) {
    __extends(BlobWriter, _super);
    function BlobWriter(chunkSize) {
        if (chunkSize === void 0) { chunkSize = 1024 * 1024 * 16; }
        var _this = _super.call(this, chunkSize) || this;
        _this.blobs = [];
        return _this;
    }
    BlobWriter.prototype.writeUint32 = function (value, littleEndian) {
        if (littleEndian === void 0) { littleEndian = false; }
        this.flushIfNoSpace(4);
        _super.prototype.writeUint32.call(this, value, littleEndian);
    };
    BlobWriter.prototype.writeUint16 = function (value, littleEndian) {
        if (littleEndian === void 0) { littleEndian = false; }
        this.flushIfNoSpace(2);
        _super.prototype.writeUint16.call(this, value, littleEndian);
    };
    BlobWriter.prototype.writeUint8 = function (value) {
        this.flushIfNoSpace(1);
        _super.prototype.writeUint8.call(this, value);
    };
    BlobWriter.prototype.writeString = function (value) {
        for (var i = 0, n = value.length; i < n; i++) {
            this.writeUint8(value.charCodeAt(i));
        }
    };
    BlobWriter.prototype.startCRC = function () {
        if (this.crcOffset !== undefined) {
            throw new Error("CRC already started");
        }
        this.crc = undefined;
        this.crcOffset = this.offset;
    };
    BlobWriter.prototype.writeCRC = function () {
        if (this.crcOffset === undefined) {
            throw new Error("CRC has not been started, cannot write");
        }
        var crc = crc_1.crc32(this.array, this.crcOffset, this.offset - this.crcOffset, this.crc);
        this.crcOffset = undefined;
        this.writeUint32(crc);
    };
    BlobWriter.prototype.startAdler = function () {
        if (this.adlerOffset !== undefined) {
            throw new Error("Adler already started");
        }
        this.adlerOffset = this.offset;
    };
    BlobWriter.prototype.pauseAdler = function () {
        if (this.adlerOffset === undefined) {
            throw new Error("Adler has not been started, cannot pause");
        }
        this.adler = adler_1.adler32_buf(this.array, this.adlerOffset, this.offset - this.adlerOffset, this.adler);
        this.adlerOffset = undefined;
    };
    // total hack!
    BlobWriter.prototype.writeAdler = function (walker) {
        if (this.adlerOffset === undefined && this.adler === undefined) {
            throw new Error("Adler has not been started, cannot pause");
        }
        if (this.adlerOffset === undefined) {
            walker.writeUint32(this.adler);
            this.adler = undefined;
            return;
        }
        var adler = adler_1.adler32_buf(this.array, this.adlerOffset, this.offset - this.adlerOffset, this.adler);
        this.adlerOffset = undefined;
        this.adler = undefined;
        walker.writeUint32(adler);
    };
    BlobWriter.prototype.flushIfNoSpace = function (spaceNeeded) {
        if (this.offset + spaceNeeded > this.array.length) {
            this.flush();
        }
    };
    BlobWriter.prototype.flush = function () {
        if (this.offset) {
            if (this.crcOffset !== undefined) {
                this.crc = crc_1.crc32(this.array, this.crcOffset, this.offset - this.crcOffset, this.crc);
                this.crcOffset = 0;
            }
            if (this.adlerOffset !== undefined) {
                this.adler = adler_1.adler32_buf(this.array, this.adlerOffset, this.offset - this.adlerOffset, this.adler);
                this.adlerOffset = 0;
            }
            var data = new Uint8Array(this.array.buffer, 0, this.offset);
            var blob = new Blob([data]);
            this.blobs.push(blob);
            this.offset = 0;
        }
    };
    BlobWriter.prototype.getBlob = function (type) {
        if (!this.blob) {
            this.flush();
            this.blob = new Blob(this.blobs, { type: type });
            this.blobs = [];
            this.array = new Uint8Array(0);
        }
        return this.blob;
    };
    return BlobWriter;
}(arraybuffer_walker_1.ArrayBufferWalker));
exports.BlobWriter = BlobWriter;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ZLIB_WINDOW_SIZE = 1024 * 32; // 32KB
exports.BLOCK_SIZE = 65535;
/**
 * Zlibbed data takes up more space than the raw data itself - we aren't
 * compressing it but we do need to add block headers and the like.
 *
 * @export
 * @param {number} dataLength
 * @returns
 */
function calculateZlibbedLength(dataLength) {
    var numberOfBlocks = Math.ceil(dataLength / exports.BLOCK_SIZE);
    return 1 // Compression method/flags code
        + 1 // Additional flags/check bits
        + (5 * numberOfBlocks) // Number of Zlib block headers we'll need
        + 4 // ADLER checksum
        + dataLength; // The actual data.
}
exports.calculateZlibbedLength = calculateZlibbedLength;
;
/**
 * Our tool for writing IDAT chunks. Although Zlib is used for compression,
 * we aren't compressing anything here. Basically, this writes a Zlib chunk
 * as if it is set to a compression level of 0.
 *
 * @export
 * @class ZlibWriter
 */
var ZlibWriter = /** @class */ (function () {
    function ZlibWriter(walker, dataLength) {
        this.walker = walker;
        this.bytesLeftInWindow = 0;
        this.bytesLeft = dataLength;
        this.writeZlibHeader();
        this.startBlock();
    }
    ZlibWriter.prototype.writeZlibHeader = function () {
        // http://stackoverflow.com/questions/9050260/what-does-a-zlib-header-look-like
        var cinfo = Math.LOG2E * Math.log(exports.ZLIB_WINDOW_SIZE) - 8;
        var compressionMethod = 8; // DEFLATE, only valid value.
        var zlibHeader = new Uint8Array(2);
        var cmf = (cinfo << 4) | compressionMethod;
        // Lifted a lot of this code from here: https://github.com/imaya/zlib.js/blob/master/src/deflate.js#L110
        var fdict = 0; // not totally sure what this is for
        var flevel = 0; // compression level. We don't want to compress at all
        var flg = (flevel << 6) | (fdict << 5);
        var fcheck = 31 - (cmf * 256 + flg) % 31;
        flg |= fcheck;
        this.walker.writeUint8(cmf);
        this.walker.writeUint8(flg);
    };
    ZlibWriter.prototype.startBlock = function () {
        // Whether this is the final block. If we've got less than 32KB to write, then yes.
        var bfinal = this.bytesLeft < exports.BLOCK_SIZE ? 1 : 0;
        // Compression type. Will always be zero = uncompressed
        var btype = 0;
        // Again, this logic comes from: https://github.com/imaya/zlib.js/blob/master/src/deflate.js#L110
        var blockLength = Math.min(this.bytesLeft, exports.BLOCK_SIZE);
        this.walker.writeUint8((bfinal) | (btype << 1));
        var nlen = (~blockLength + 0x10000) & 0xffff;
        // IMPORTANT: these values must be little-endian.
        this.walker.writeUint16(blockLength, true);
        this.walker.writeUint16(nlen, true);
        this.bytesLeftInWindow = Math.min(this.bytesLeft, exports.BLOCK_SIZE);
        this.walker.startAdler();
    };
    ZlibWriter.prototype.writeUint8 = function (val) {
        if (this.bytesLeft <= 0) {
            throw new Error("Ran out of space");
        }
        if (this.bytesLeftInWindow === 0 && this.bytesLeft > 0) {
            this.walker.pauseAdler();
            this.startBlock();
        }
        this.walker.writeUint8(val);
        this.bytesLeftInWindow--;
        this.bytesLeft--;
    };
    ZlibWriter.prototype.end = function () {
        this.walker.writeAdler(this.walker);
    };
    return ZlibWriter;
}());
exports.ZlibWriter = ZlibWriter;


/***/ })
/******/ ]);
});