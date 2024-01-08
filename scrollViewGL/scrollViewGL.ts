const vertexShaderSource = `
attribute vec4 a_position;
void main() {
    gl_Position = a_position;
}`;

// 片段着色器代码
const fragmentShaderSource = `
precision mediump float;
void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // 红色
}`;

// Assume these utility functions exist
declare function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader;
declare function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram;
declare function createTextTexture(gl: WebGLRenderingContext, text: string): WebGLTexture;

class DanmakuRenderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private positionBuffer: WebGLBuffer | null;
  private texture: WebGLTexture;
  private positionLocation: number;
  private texCoordLocation: number;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('Failed to get WebGL context');
    }
    this.gl = gl;

    // Create shaders and program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    this.program = createProgram(gl, vertexShader, fragmentShader);

    // Look up where the vertex data needs to go.
    this.positionLocation = gl.getAttribLocation(this.program, 'a_position');
    this.texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');

    // Create a buffer to put three 2d clip space points in
    this.positionBuffer = gl.createBuffer();

    // Create a texture and put the text in it.
    this.texture = createTextTexture(gl, 'Your Text Here');

    // code to setup text positions and texture coordinates
  }

  drawScene() {
    // Tell WebGL how to convert from clip space to pixels
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    // Clear the canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    this.gl.useProgram(this.program);

    // Bind the position buffer.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    // this.gl.vertexAttribPointer(this.positionLocation, size, type, normalize, stride, offset);
    this.gl.vertexAttribPointer(this.positionLocation, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.positionLocation);

    // code to set texCoords and other uniforms

    // Draw the rectangle.
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Request the next frame of the animation
    requestAnimationFrame(() => this.drawScene());
  }

  // Other methods to handle updating positions, loading new text, etc.
}

const danmaku = new DanmakuRenderer(document.getElementById('danmuCanvas') as HTMLCanvasElement);
danmaku.drawScene();