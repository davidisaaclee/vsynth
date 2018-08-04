precision mediump float;

#pragma glslify: sampleTex = require('./sampleTex');

uniform vec2 inputTextureDimensions;

uniform float resolutionAmount;
uniform sampler2D resolutionTexture;

float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 n) {
	const vec2 d = vec2(0.0, 1.0);
	vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
	return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

void main() {
	vec2 uv = gl_FragCoord.xy / inputTextureDimensions;
	float resolution = sampleTex(resolutionTexture, uv, resolutionAmount * 100.);
  vec4 texColor = vec4(vec3(noise(uv * resolution)), 1.);
  gl_FragColor = texColor;
}
