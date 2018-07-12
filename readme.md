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

```
const writer = new dekapng.PNGRGBAWriter(width, height);
for each row
  writer.addRow(someUint8ArrayExactlyRowBytesLong)
const pngBlob = writer.finishAndGetBlob();
```

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

## Credits

This code is heavily based on [`png-pong`](https://github.com/gdnmobilelab/png-pong)
but everything not related to writing a 32bit png has been striped out.


