/* ============================================================================= 
#
# Author: 桔子桑
# Date: 2020-07-28 17:50:10
# FilePath: /canvasAnimation/js/wave.js
# Description: 
#
============================================================================= */
var uniformTime = 0,bindBuffer = false,n = 0;
function hollowOut() {
    const vs = `
        attribute vec4 a_Position;
        void main(){
            gl_Position = a_Position;
        }
    `;
    const fs = `
        #ifdef GL_ES
        precision mediump float;
        #endif
        uniform float time;
        uniform sampler2D u_Sampler;
        void main(){
          vec2 p = gl_FragCoord.xy;
          vec2 uv = gl_FragCoord.xy/vec2(2880.,1080.);
          vec4 tex = texture2D(u_Sampler,uv);
          vec4 color = vec4(1.0,0.0,0.0,0.0);
          if(p.x > 10.){
            color = vec4(0.0,1.0,0.0,0.0);
          }
          gl_FragColor = color;
        }
    `;
    var canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if (!gl) {
      console.log("Failed to get the rendering context for WebGL!");
      return;
    }
    if (!initShaders(gl, vs, fs)) {
      console.log("Failed to initialize shaders.");
      return;
    }
    function main() {
      if(!bindBuffer){
        n = initVertexBuffers(gl);
      }
      if (n < 0) {
        console.log("Failed to set the positions of the vertices!");
        return;
      }

      if(!initTextures(gl,n)){
        console.log('Failed to initialize textures.');
        return;
      }
      
      function initVertexBuffers(gl) {
        var verticesTex = new Float32Array([
          -1.0,1.0,0.0,1.0,
          -1.0,-1.0,0.0,0.0,
          1.0,1.0,1.0,1.0,
          1.0,-1.0,1.0,0.0
        ]);
        var n = 4;
        var vertexTexBuffer = gl.createBuffer();
        if (!vertexTexBuffer) {
          console.log("Failed to create the buffer object!");
          return -1;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verticesTex, gl.STATIC_DRAW);
        var fsize = verticesTex.BYTES_PER_ELEMENT;

        var a_Position = gl.getAttribLocation(gl.program, "a_Position");
        if (a_Position < 0) {
          console.log("Failed to get the storage location of a_Position");
          return -1;
        }
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, fsize * 4, 0);
        gl.enableVertexAttribArray(a_Position);



        var time = gl.getUniformLocation(gl.program, "time");
        if (time < 0) {
          console.log("Failed to get the storage location of a_Position");
          return -1;
        }
        gl.uniform1f(time, uniformTime);
        bindBuffer = true;
        return n;
      }

      //初始化纹理图片，通过image传入
      function initTextures(){
        console.log('image')
        //创建纹理对象
          var texture = gl.createTexture();

          //读取u_Sampler存储位置
          var u_Sampler = gl.getUniformLocation(gl.program,'u_Sampler');

          var image = new Image();

          image.onload = function(){
              loadTexture(gl,n,texture,u_Sampler,image);
          }

          image.src = '../images/map.jpg';

          return true;
      }

          //加载纹理
      function loadTexture(gl,n,texture,u_Sampler,image){
        //对问题图像进行y轴反转
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
        //开启0号纹理单元
        gl.activeTexture(gl.TEXTURE0);
        //向target绑定纹理对象
        gl.bindTexture(gl.TEXTURE_2D,texture);
        //配置纹理参数
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        //处理图片像素非2的幂次方的配置
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        //配置纹理图像
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
        //将0号纹理传递给着色器
        gl.uniform1i(u_Sampler,0);

        draw();
      }

      function draw(){
        gl.clearColor(0.4, 0.5, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
      }

      // requestAnimationFrame(draw);
    }
    main();
  }

  hollowOut();