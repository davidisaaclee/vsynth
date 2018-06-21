precision mediump float;

#pragma glslify: crosshatch = require('glsl-crosshatch-filter') 

uniform sampler2D inputTexture;
uniform vec2 inputTextureDimensions;
 
void main() {
	vec2 uv = gl_FragCoord.xy / inputTextureDimensions;
  vec4 texColor = texture2D(inputTexture, uv);
  gl_FragColor.rgb = crosshatch(texColor.rgb);
  gl_FragColor.a = texColor.a;
}
