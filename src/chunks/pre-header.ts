import { ArrayBufferWalker } from '../util/arraybuffer-walker';

const PRE_HEADER = '\x89PNG\r\n\x1A\n';


/**
 * PNG files have a very basic header that identifies the PNG
 * file as... a PNG file. We need to write that out.
 * 
 * @export
 * @param {ArrayBufferWalker} walker 
 */
export function writePreheader(walker: ArrayBufferWalker) {
    walker.writeString(PRE_HEADER);
}


export const length = PRE_HEADER.length;