/* ============================================================================= 
#
# Author: 桔子桑
# Date: 2020-07-28 17:50:10
# FilePath: /canvasAnimation/js/wave.js
# Description: 
#
============================================================================= */
var uniformTime = 0,bindBuffer = false,n = 0;
function wave() {
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
        void main(){
          vec2 p = gl_FragCoord.xy;
          vec2 uv = gl_FragCoord.xy/vec2(1920.,350);
          float wavey = 50. * sin((p.x + time)/100. - 11.) +440.;
          float abswave = abs(p.y - wavey);
          vec4 wavecolor = vec4(0.0);

          float shadowy = 50. * sin((p.x+time)/100. - 10.95) +340.;
          float absshadow = abs(p.y - shadowy);
          vec4 shadowcolor = vec4(0.0);

          vec4 pointcolor = vec4(0.0);

          if(abswave < 12.){
            float alphay = smoothstep(1.0,0.9,(abswave / 10.));
            vec3 colorwhite = vec3(0.0);
            if(p.x < 1500.){
              colorwhite = (1.0 - p.x/1500.) * vec3(1.0)* 0.6;
            }
            wavecolor = vec4((vec3(137.,199.,250.)/255.+ colorwhite)* alphay ,alphay);
          }
          if(absshadow < 50.){
            float alphay = smoothstep(1.0,0.0,(absshadow / 50.));
            vec3 colorblue = vec3(0.0);
            if(p.x > 1500.){
              colorblue = ((p.x - 1500.)/1500.) * vec3(137.,199.,250.)/255.* 0.01;
            }
            shadowcolor = vec4((vec3(111.,128.,156.)/255. + colorblue)* alphay ,alphay);
          }

          float index = 1.0;
          for(int i = 1; i < 8; i++){
              if(abs(uv.x-(index/7.9)) < 0.02){
                float cx = index/7.9 * 6480.;
                float cy = 50. * sin((cx + time)/100. - 11.) +444.;
                float dis = distance(p,vec2(cx,cy));
                if(dis < 30.){
                  wavecolor =  vec4(0.0);
                  shadowcolor = vec4(0.0);
                  if(dis < 15.){
                    float alphay = smoothstep(1.0,0.0,dis/60.);
                    pointcolor = vec4(vec3(137.,199.,250.)/255.,alphay);
                  }else{
                    float alphay = smoothstep(1.0,0.0,(dis-15.)/20.);
                    pointcolor = vec4(vec3(225.,255.,255.)/255. * alphay ,alphay);
                  }
                }
              }
              index +=1.0;
          }
          gl_FragColor = wavecolor +shadowcolor + pointcolor;
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
      gl.clearColor(0.4, 0.5, 0.0, 0.0);
      // gl.clear(gl.COLOR_BUFFER_BIT);
      // gl.enable(gl.BLEND);
      // gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
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

        // var time = gl.getUniformLocation(gl.program, "time");
        // if (time < 0) {
        //   console.log("Failed to get the storage location of a_Position");
        //   return -1;
        // }
        // gl.uniform1f(time, uniformTime);
        bindBuffer = true;
        return n;
      }

      uniformTime -= 3.0;
      var time = gl.getUniformLocation(gl.program, "time");
      if (time < 0) {
        console.log("Failed to get the storage location of a_Position");
        return -1;
      }
      gl.uniform1f(time, uniformTime);
      
      requestAnimationFrame(main);
    }
    main();
  }

  wave();