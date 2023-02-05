# dekapng

A library to make giant PNGs in the browser.

[Example](https://greggman.github.io/dekapng/)

## What?

I wanted to be able to create an 8000x8000 or 16000x16000 PNG client side.
All the PNG libraries I looked at expected you had all the data in memory at once
but for large PNGs that's probably not possible.

This PNG library you create a `PNGRGBAWriter` of a specific size and then
provide one row of data at a time. Behind the scenes the writer will use
a collection of `Blob`s to effectively stream the data out of JavaScript.

After finishing the blobs are concatinated into one large blob which you can
do with as you please.

## Usage:

Terse version:

    const writer = new dekapng.PNGRGBAWriter(width, height);
    for each row
      writer.addRow(someUint8ArrayExactlyRowBytesLong)
    const pngBlob = writer.finishAndGetBlob();

You can also use `writer.addPixels` with

    const byteOffset = ???
    const numPixels = ???
    writer.addPixels(someUint8Array, byteOffset, numPixels);

Actual example:

```
<body></body>
<script src="dist/dekapng.js"></script>
<script>
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
  const pngRGBAWriter = new dekapng.PNGRGBAWriter(width, height);
  for (let y = 0; y < height; ++y) {
    const row = new Uint8Array(pixels.buffer, y * lineSize, lineSize);
    pngRGBAWriter.addRow(row);
  }
  const blob = pngRGBAWriter.finishAndGetBlob();
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.src = url;
}
</script>
```

If your image is too large the browser might not be able to load it as an image. You can offer it
to the user as follows

```
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

{

  // code from above
  ...
  const blob = pngRGBAWriter.finishAndGetBlob();
  saveData(blob, "generated.png");
}
```

## Running tests/dev

Clone the repo, cd into it and `npm install`.

To spin up a server showing you a small demo page at demo/demo.ts just run:

    npm run demo

And go to http://localhost:8080. To run the test suite in Node, run

    npm run tests-node

To build

    npm run build

## Limits

Unknown. It used to have a limit of just under 2147319796 bytes
as that is the limit you can store in a single IDAT zlib uncompressed
chunk. As a square that was about 23170x23168 pixels. But I've since
removed that limit so I'm guessing the limit is whatever the browser
complains about. PNG's techincal limit appears to be 2^32-1 x 2^32-1.

## Cleanup

The code is a mess. Because I started with [png-pong](https://github.com/gdnmobilelab/png-pong)
and I wanted the change the code as little as possible I hacked in a class
`BlobWriter` that was a substitute for png-pong's `ArrayBufferWalker`.
It did the job but it's not a correct fit and the code should be refactored.
It got worse when adding support for really large PNGs (size > 2**31-1)
when I added `IDATChunker` which is yet another kind of override of `ArrayBufferWriter`
that really doesn't fit and I had to hack some stuff in particularly related
to adler stuff.

The code seems to be working but if there is one place I'd fix I'd make zlib take
an `IDATChunker` direclty probably. I also might figure out a way to move
the adler code to another class? Not sure.

## Future

It probably would not be that hard to add real compression using some zlib
library. The library just have to be adapted to handle a stream
which I believe zlib compression is condusive too.

There's also the issue right now that code that writes the `IDAT` chunks
needs to know the size of the chunk it's going to write before it writes
it. Given that at the end we are concatinating an array of Blobs we could just
insert a blob with only the length at the right place in the array of blobs
so that we don't have to know the length in advance.

In other words as the code its now it's streaming to an arraybuffer. When the arraybuffer
is full it saves the arraybuffer to a blob and adds the blob to the end of an array of blobs.

   [largeblob, largeblob, largeblob]

We could change the chunk writing code to return an array of blobs that would be something like

   [4byteLengthBlob, dataBlob, dataBlob, dataBlob]

That `4byteLengthBlob` would get inserted when ending the chunk. This way we wouldn't
need to know the length before writing. We'd know the length after writing and then
insert the `4byteLengthBlob` with the correct length.

We'd then have an array of all blobs making the file (like we do now) that we can create
a new blob from that is the concatination of all blobs.

## Other

While dekapng works with three.js it is not three.js specific. If you are using three.js you might consider [THREE.Highres](https://github.com/taseenb/THREE.Highres), a library that's already integrated with three.js

## Credits

This code is heavily based on [`png-pong`](https://github.com/gdnmobilelab/png-pong)
but everything not related to writing a 32bit png has been striped out.


