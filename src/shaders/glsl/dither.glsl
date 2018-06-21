precision mediump float;
 
uniform sampler2D inputTexture;
uniform vec2 inputTextureDimensions;
 
// Use any of the following: 
#pragma glslify: dither = require(glsl-dither) 
 
void main() {
	vec2 uv = gl_FragCoord.xy / inputTextureDimensions;
  vec4 color = texture2D(inputTexture, uv);
  gl_FragColor = dither(gl_FragCoord.xy, color);
}
