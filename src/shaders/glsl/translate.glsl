precision mediump float;

#pragma glslify: sampleTex = require('./sampleTex');

uniform vec2 inputTextureDimensions;

uniform float inputAmount;
uniform sampler2D inputTexture;

uniform float translateXAmount;
uniform sampler2D translateXTexture;

uniform float translateYAmount;
uniform sampler2D translateYTexture;

void main() {
	vec2 uv =
		gl_FragCoord.xy / inputTextureDimensions;
	vec2 translateSample =
		vec2(
			sampleTex(translateXTexture, uv, translateXAmount),
			sampleTex(translateYTexture, uv, translateYAmount)
		);

	vec2 samplePt = fract(uv + 1. + translateSample);

	gl_FragColor =
		texture2D(inputTexture, samplePt) * inputAmount;
}

