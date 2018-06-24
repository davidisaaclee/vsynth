precision mediump float;

const float TWO_PI = 6.28318530718;
const float N_SCANLINES = 500.;

uniform vec2 inputTextureDimensions;

uniform vec3 color;

// Size of the waves created by the oscillator
// (Corresponds to the integral harmonic of the frequency.)
uniform sampler2D waveSize;
uniform float waveSizeAmount;

// The speed of the waves created by the oscillator
// (Corresponds to the inharmonic portion of the frequency.)
// 0, 0.5, 1 = still
uniform sampler2D speed;
uniform float speedAmount;

// between 0-1, scaled to 0-2pi
uniform sampler2D rotationTheta;

// scales rotationTheta
uniform float rotationAmount;

// between 0-1, where 1 is a full period
uniform sampler2D phaseOffsetTexture;

// scales phaseOffsetFromTexture
uniform float phaseOffsetTextureAmount;

// wave shape: 0 = sine, 0.5 = triangle, 1 = sawtooth
uniform float shape;

vec2 rotate(vec2 v, float a, vec2 center) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return center + m * (v - center);
}

float maxComponent(vec3 v) {
	return max(v.x, max(v.y, v.z));
}

float sampleTex(sampler2D t, vec2 pt, float scale) {
	return maxComponent(
			texture2D(
				t,
				pt).rgb)
		* scale;
}

float calculateFrequency(vec2 textureSamplePoint) {
	// TODO: Scale by amount
	float waveSizeSample = sampleTex(
			waveSize,
			textureSamplePoint,
			waveSizeAmount);

	float speedSample = sampleTex(
			speed,
			textureSamplePoint,
			speedAmount);

	return ceil(waveSizeSample * waveSizeSample * 100.)
		+ 2. * (speedSample - 0.5);
}

void main() {
	vec2 textureSamplePoint =
		gl_FragCoord.xy / inputTextureDimensions;

	float theta = sampleTex(
			rotationTheta,
			textureSamplePoint,
			rotationAmount) * TWO_PI;

	vec2 position = rotate(
			gl_FragCoord.xy,
			theta,
			inputTextureDimensions * 0.5);

	float phaseOffsetFromTexture = sampleTex(
			phaseOffsetTexture,
			textureSamplePoint,
			phaseOffsetTextureAmount);

	highp vec2 uv =
		position / inputTextureDimensions;

	float pixelIndex =
		uv.x / N_SCANLINES + (uv.y - mod(uv.y, 1. / N_SCANLINES));

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


	float duty = clamp(shape, 0.5, 1.);
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



	float z = mix(sine, triangle, clamp(shape, 0., 0.5) * 2.);

	gl_FragColor = vec4(
			color * vec3(z),
			1);
}
