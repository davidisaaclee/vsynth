precision mediump float;

#pragma glslify: sampleTex = require('./sampleTex');

const float TWO_PI = 6.28318530718;

uniform vec2 inputTextureDimensions;

// The independent variable in the periodic function
uniform sampler2D inputTexture;
uniform float inputAmount;

// Size of the waves created by the oscillator
// (Corresponds to the integral harmonic of the frequency.)
uniform sampler2D waveSize;
uniform float waveSizeAmount;

// The speed of the waves created by the oscillator
// (Corresponds to the inharmonic portion of the frequency.)
// 0, 0.5, 1 = still
uniform sampler2D speed;
uniform float speedAmount;

// between 0-1, where 1 is a full period
uniform sampler2D phaseOffsetTexture;
uniform float phaseOffsetTextureAmount;

// wave shape: 0 = sine, 0.5 = triangle, 1 = sawtooth
uniform sampler2D shape;
uniform float shapeAmount;

float calculateFrequency(vec2 textureSamplePoint) {
	float waveSizeSample = sampleTex(
			waveSize,
			textureSamplePoint,
			waveSizeAmount);

	float speedSample = sampleTex(
			speed,
			textureSamplePoint,
			speedAmount);

	return ceil(waveSizeSample * 20.)
		+ 2. * (speedSample - 0.5);
}

void main() {
	vec2 textureSamplePoint =
		gl_FragCoord.xy / inputTextureDimensions;

	vec2 position = gl_FragCoord.xy;

	float phaseOffsetFromTexture = sampleTex(
			phaseOffsetTexture,
			textureSamplePoint,
			phaseOffsetTextureAmount);

	float pixelIndex =
		sampleTex(inputTexture, textureSamplePoint, inputAmount);

	float frequency =
		calculateFrequency(textureSamplePoint);

	float sine =
		(
		 sin(
			 mod(
				 TWO_PI
				 * (
					 frequency * pixelIndex
					 + phaseOffsetFromTexture),
				 TWO_PI))
		 + 1.)
		/ 2.;

	float sampledShape =
		sampleTex(shape, textureSamplePoint, shapeAmount);

	float duty = clamp(sampledShape, 0.5, 1.);
	// should mod pixelIndex by 1, but guaranteed to be within 0-1
	float p1 = duty;
	float p2 = 1. - p1;
	float m1 = 0.5 / p1;
	float m2 = 0.5 / p2;
	float x = mod((frequency * pixelIndex) + phaseOffsetFromTexture - 0.25, 1.);
	float inFirstDuty = 1. - step(p1, x);

	float t =
		inFirstDuty * mod(m1 * x, 0.5)
		+ (1. - inFirstDuty) * (mod(m2 * (x - p1), 0.5) + 0.5);
	float triangle =
		2. * abs(0.5 - t);



	float z = mix(sine, triangle, clamp(sampledShape, 0., 0.5) * 2.);

	gl_FragColor = vec4(
			vec3(z),
			1);
}
