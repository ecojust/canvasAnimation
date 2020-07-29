/* ============================================================================= 
#
# Author: 桔子桑
# Date: 2020-07-28 17:50:10
# FilePath: /canvasAnimation/js/wave.js
# Description: 
#
============================================================================= */
var uniformTime = 0.3,bindBuffer = false,n = 0;
function hollowOut() {
    const vs = `
        attribute vec4 a_Position;
        attribute vec2 a_TexCoord;
        varying vec2 v_TexCoord;
        void main(){
            gl_Position = a_Position;
            v_TexCoord = a_TexCoord;
        }
    `;
    const fs = `
        #ifdef GL_ES
        precision mediump float;
        #endif
        uniform float time;
        uniform sampler2D u_Sampler;
        varying vec2 v_TexCoord;

        void main(){
          // vec2 p = gl_FragCoord.xy;
          // vec2 uv = gl_FragCoord.xy/vec2(800.,600.);

          vec4 tex = texture2D(u_Sampler,v_TexCoord);

          float cycle = sin(time * 9.0);

          vec3 from = vec3(255./255.,215./255.,0./255.);
          vec3 to = vec3(255./255.,20./255.,147./255.);
          float step = (cycle+1.0)/2.0;
          vec4 bg = vec4(
            from.r + step * (to.r - from.r),
            from.g + step * (to.g - from.g),
            from.b + step * (to.b - from.b),
          1.0);

          vec4 line = vec4(0.0);
          float linewidth = 0.02;
          float index = 1.0;
          for(int i = 1; i < 20; i++){
            float sy = sin((v_TexCoord.x + 0.0) * 6.0  + cycle ) * 0.4 * (cycle - index/60.0) + 0.52 ;
            float dis = abs(sy - v_TexCoord.y);
            if(dis < linewidth){
              float alpha = smoothstep(1.0,0.0,dis/linewidth);
              line = vec4(vec3(0.0,1.0,1.0) * alpha/4.0,alpha/4.0);
            }
            index +=1.0;
            linewidth -= 0.001;
          }
          line.a = 0.2;

          float rline = smoothstep(1.0,0.0,tex.r);
          vec4 finalColor = mix(tex,line,rline);
          finalColor.a = rline;
          gl_FragColor = mix(finalColor ,(bg + line) * rline,rline);
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


        var a_TexCoord = gl.getAttribLocation(gl.program,'a_TexCoord');
        if (a_TexCoord < 0) {
            console.log('Failed to get the storage location of a_TexCoord');
            return -1;
        }
        gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,fsize * 4,fsize * 2);
        gl.enableVertexAttribArray(a_TexCoord);



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
          var texture = gl.createTexture();
          var u_Sampler = gl.getUniformLocation(gl.program,'u_Sampler');
          var image = new Image();
          image.onload = function(){
              loadTexture(gl,n,texture,u_Sampler,image);
          }
          image.src = '../images/bg2.jpg';
          // image.src = '../images/map2.jpeg';
          return true;
      }

      //加载纹理
      function loadTexture(gl,n,texture,u_Sampler,image){
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
        gl.uniform1i(u_Sampler,0);
        animate();
      }

      function animate(){
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

        uniformTime+=0.001;
        var time = gl.getUniformLocation(gl.program, "time");
        if (time < 0) {
          console.log("Failed to get the storage location of a_Position");
          return -1;
        }
        gl.uniform1f(time, uniformTime);
        requestAnimationFrame(animate);
      }
    }
    main();
  }

  hollowOut();