import Renderer2D from './2d/renderer2d.js';
import Renderer3D from './three.js/renderer3d.js';
import RendererShaderToy from './shadertoy/rendererShaderToy.js';
import { createElem as el } from './elem.js';

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

function wait() {
  return new Promise((resolve) => {
    setTimeout(resolve);
  });
}

// example of writing an RGBA png
async function makeBigPng(renderer, width, height) {
  const pngRGBAWriter = new dekapng.PNGRGBAWriter(width, height);

  const chunkWidth  = 1000;
  const chunkHeight = 100;

  const progress = document.querySelector("#progress");
  function setProgress(p) {
    progress.textContent = `${p * 100 | 0}%`;
  }

  setProgress(0);

  for (let chunkY = 0; chunkY < height; chunkY += chunkHeight) {
    const rowChunks = [];
    const localHeight = Math.min(chunkHeight, height - chunkY);

    for (let chunkX = 0; chunkX < width; chunkX += chunkWidth) {
      const localWidth = Math.min(chunkWidth, width - chunkX);

      const data = renderer.drawArea(width, height, chunkX, chunkY, localWidth, localHeight);
      if (!data) {
        return;
      }
      rowChunks.push(data);
    }

    for (let row = 0; row < localHeight; ++row) {
      rowChunks.forEach((chunk) => {
        const rowSize = chunk.width * 4;
        const chunkOffset= rowSize * row;
        pngRGBAWriter.addPixels(chunk.data, chunkOffset, chunk.width);
      });
    }

    setProgress(Math.min(1, (chunkY + chunkHeight) / height));
    await wait();
  }

  return pngRGBAWriter.finishAndGetBlob();
}

const sizeElem = document.querySelector('#size');
const formElem = document.querySelector('#generate');
const infoElem = document.querySelector('#info');
const radioElem = document.querySelector('.radio');
const settingsElem = document.querySelector('#settings');

const renderers = {
  '2d': { Renderer: Renderer2D },
  'three.js': { Renderer: Renderer3D },
  'shadertoy': { Renderer: RendererShaderToy}, 
};

function showSettings(settingsElem) {
  for (const {elem} of Object.values(renderers)) {
    elem.style.display = elem === settingsElem ? '' : 'none';
  }
}

Object.entries(renderers).forEach(([name, info], ndx) => {
  info.elem = el('div');
  settingsElem.appendChild(info.elem);
  info.renderer = new info.Renderer(info.elem);
  const id = `t${ndx}`;
  radioElem.appendChild(el('div', {}, [
    el('input', {type: 'radio', value: name, id, name: 'type', onChange: _ => {
      showSettings(info.elem);
    }}),
    el('label', {for: id, textContent: name})
  ]));
});
showSettings(renderers['2d'].elem);

formElem.addEventListener('submit', (e) => {

  const form = new FormData(formElem);

  e.preventDefault();
  e.stopPropagation();

  formElem.disabled = true;
  infoElem.style.display = '';

  const width = parseInt(form.get('width'));
  const height = parseInt(form.get('height'));
  sizeElem.textContent = `${width}x${height}`;

  const { renderer } = renderers[form.get('type')];

  makeBigPng(renderer, width, height).then((blob) => {
    infoElem.style.display = 'none';
    formElem.disabled = false;
    if (blob) {
      const url = URL.createObjectURL(blob);
      saveData(blob, `generated-${width}x${height}.png`);
    }
  });
});