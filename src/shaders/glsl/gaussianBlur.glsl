precision mediump float;

#pragma glslify: blur = require('glsl-fast-gaussian-blur/13')
#pragma glslify: sampleTex = require('./sampleTex')

uniform vec2 inputTextureDimensions;

uniform sampler2D t;
uniform float tAmount;

uniform sampler2D dx;
uniform float dxAmount;

uniform sampler2D dy;
uniform float dyAmount;

void main() {
  vec2 uv =
		vec2(gl_FragCoord.xy / inputTextureDimensions.xy);
	float sampledDx =
		sampleTex(dx, uv, 2. * (dxAmount - 0.5));
	float sampledDy =
		sampleTex(dy, uv, 2. * (dyAmount - 0.5));

  gl_FragColor =
		blur(t,
				uv,
				inputTextureDimensions.xy,
				vec2(sampledDx, sampledDy));
	gl_FragColor.rgb *= tAmount;
}

