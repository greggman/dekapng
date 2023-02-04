import * as twgl from '../../3rdparty/twgl-full.module.js';
//import toyShader from './shadertoy-01.js';
import toyShader from './shadertoy-02.js';
//import toyShader from './shadertoy-03.js';
import { createElem as el } from '../elem.js';

export default class RendererShaderToy {
  lastToy = '';

  constructor(settingsElem) {

    this.timeElem = el('input', {type: 'number', step: '0.01', value: toyShader.time});
    this.toyElem = el('textarea', { placeholder: 'shadertoy shader', value: toyShader.code});
    this.errElem = el('pre', {className: 'error', style: { display: 'none' }});

    settingsElem.appendChild(el('table', {}, [
      el('tbody', {}, [
        el('tr', {}, [
          el('td', {textContent: 'time:'}),
          el('td', {}, [this.timeElem]),
        ]),
        el('tr', {}, [
          el('td', {textContent: 'shader:'}),
          el('td', {}, [this.toyElem]),
        ]),
        el('tr', {}, [
          el('td', {textContent: ''}),
          el('td', {}, [this.errElem]),
        ]),
      ]),
    ]))

    const gl = document.createElement("canvas").getContext("webgl2", {antialias: false});
    this.gl = gl;

    this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
      position: [
        -1, -1, 0,
         3, -1, 0,
        -1,  3, 0, 
      ],
    });
  }
  #updateToy(toyShader) {
    const toy = this.toyElem.value;
    if (toy !== this.lastToy) {
      const {gl} = this;
      const vs1 = `
      attribute vec4 position;
      void main() {
        gl_Position = position;
      }
      `;

      const vs3 = `#version 300 es
      in vec4 position;
      void main() {
        gl_Position = position;
      }
      `;

      const uniformsGLSL = `
        uniform vec2 iDekaPngOffset;
        uniform vec3 iResolution;
        uniform float iTime;
        uniform float iTimeDelta;
        uniform float iFrame;
        //uniform float iChannelTime[4];
        uniform vec4 iMouse;
        uniform vec4 iDate;
        uniform float iSampleRate;
        //uniform vec3 iChannelResolution[4];
        //uniform samplerXX iChanneli;
      `;

      const fs1 = `
      precision highp float;

      ${uniformsGLSL}

      ${toy}

      void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy + iDekaPngOffset);
      }
      `;

      const fs3 = `#version 300 es
      precision highp float;

      ${uniformsGLSL}

      ${toy}

      out vec4 fragColor;
      void main() {
        mainImage(fragColor, gl_FragCoord.xy + iDekaPngOffset);
      }
      `;

      const errors = [];
      this.programInfo = (_ => {
        let p = twgl.createProgramInfo(gl, [vs1, fs1], { errorCallback: _ => {}});
        if (!p) {
          p = twgl.createProgramInfo(gl, [vs3, fs3], { errorCallback: (...args) => {
            errors.push(args.join('\n'));
          }});
        }
        return p;
      })();

      if (!this.programInfo) {
        this.errElem.style.display = '';
        this.errElem.textContent = errors.join('\n');
      } else {
        this.errElem.style.display = 'none';
        this.errElem.textContent = '';
      }

      this.lastToy = toy;
    }
  }
  drawArea(width, height, chunkX, chunkY, chunkWidth, chunkHeight) {
    this.#updateToy();
    if (!this.programInfo) {
      return;
    }

    const {gl, time, programInfo, bufferInfo} = this;

    gl.canvas.width = chunkWidth;
    gl.canvas.height = chunkHeight;
    gl.viewport(0, 0, chunkWidth, chunkHeight);

    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    gl.useProgram(programInfo.program);

    const uniforms =  {
      iDekaPngOffset: [chunkX, height - chunkY - 1],
      iResolution: [width, height, 0],
      iTime: parseFloat(this.timeElem.value),
      iTimeDelta: 1 / 60,
      iFrame: time / 60 | 0,
      iMouse: [width / 2, height / 2, 0, 0],
      iDate: [0, 0, 0, 0],
      iSampleRate: 44100,
      //uniform float iChannelTime[4];
      //uniform vec3 iChannelResolution[4];
      //uniform samplerXX iChanneli;
    };

    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);

    const data = new Uint8Array(chunkWidth * chunkHeight * 4);
    gl.readPixels(0, 0, chunkWidth, chunkHeight, gl.RGBA, gl.UNSIGNED_BYTE, data);

    // swap lines (should probably just fix code in makeBigPng to read backward
    const lineSize = chunkWidth * 4;
    const line = new Uint8Array(lineSize);
    const numLines = chunkHeight / 2 | 0;
    for (let i = 0; i < numLines; ++i) {
      const topOffset = lineSize * i;
      const bottomOffset = lineSize * (chunkHeight - i - 1);
      line.set(data.slice(topOffset, topOffset + lineSize), 0);
      data.set(data.slice(bottomOffset, bottomOffset + lineSize), topOffset);
      data.set(line, bottomOffset);
    }
    return {
      width: chunkWidth,
      height: chunkHeight,
      data: data,
    };
  }
}