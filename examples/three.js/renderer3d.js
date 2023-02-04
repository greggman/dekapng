export default class Renderer3D {
  constructor() {
    const camera = new THREE.PerspectiveCamera( 70, 1, 1, 10000 );
    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );
    const light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 1, 1 ).normalize();
    scene.add( light );
    const geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );
    for ( let i = 0; i < 2000; i ++ ) {
      var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
      object.position.x = Math.random() * 800 - 400;
      object.position.y = Math.random() * 800 - 400;
      object.position.z = Math.random() * 800 - 400;
      object.rotation.x = Math.random() * 2 * Math.PI;
      object.rotation.y = Math.random() * 2 * Math.PI;
      object.rotation.z = Math.random() * 2 * Math.PI;
      object.scale.x = Math.random() + 0.5;
      object.scale.y = Math.random() + 0.5;
      object.scale.z = Math.random() + 0.5;
      scene.add( object );
    }
    const renderer = new THREE.WebGLRenderer();

    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
  }
  drawArea(width, height, chunkX, chunkY, chunkWidth, chunkHeight) {
    const { renderer, camera, scene } = this;

    renderer.setSize( chunkWidth, chunkHeight );

    camera.aspect = chunkWidth / chunkHeight;
    camera.setViewOffset( width, height, chunkX, chunkY, chunkWidth, chunkHeight );
    camera.updateProjectionMatrix();

    const radius = 100;
    const theta = 45;

    camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
    camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
    camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
    camera.lookAt( scene.position );
    camera.updateMatrixWorld();
    renderer.render( scene, camera );

    const data = new Uint8Array(chunkWidth * chunkHeight * 4);
    const gl = renderer.context;
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