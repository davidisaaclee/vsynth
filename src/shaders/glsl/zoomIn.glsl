precision mediump float;

#pragma glslify: sampleTex = require('./sampleTex');

uniform vec2 inputTextureDimensions;

uniform float inputAmount;
uniform sampler2D inputTexture;

// scale of 0 => no transform
// scale of 1 => 1/4 of original image fills viewport
uniform float scaleAmount;
uniform sampler2D scaleTexture;

void main() {
	vec2 uv =
		gl_FragCoord.xy / inputTextureDimensions;
	float scaleSample =
		sampleTex(scaleTexture, uv, scaleAmount);

	vec2 uvFromCenter = uv - vec2(0.5);
	vec2 scaledUVFromCenter = uvFromCenter * 1. / (1. + scaleSample);
	vec2 scaledUV = scaledUVFromCenter + vec2(0.5);

	gl_FragColor =
		texture2D(inputTexture, scaledUV) * inputAmount;
}

