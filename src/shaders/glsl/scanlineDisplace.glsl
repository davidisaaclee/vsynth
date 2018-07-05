precision mediump float;

#pragma glslify: sampleTex = require('./sampleTex');

uniform vec2 inputTextureDimensions;

uniform float inputAmount;
uniform sampler2D inputTexture;

uniform float displaceAmount;
uniform sampler2D displaceTexture;

void main() {
	float N_SCANLINES = inputTextureDimensions.y;

	vec2 uv =
		gl_FragCoord.xy / inputTextureDimensions;

	float displaceSample =
		sampleTex(displaceTexture, uv, displaceAmount);

	float pixelIndex =
		mod(
				uv.x / N_SCANLINES
				+ (uv.y - mod(uv.y, 1. / N_SCANLINES))
				+ displaceSample,
				1.);

	float xp =
		mod(pixelIndex, 1. / N_SCANLINES);

	vec2 displacedUV =
		vec2(
				xp * N_SCANLINES,
				pixelIndex - xp);

	gl_FragColor =
		texture2D(inputTexture, displacedUV) * inputAmount;
}

