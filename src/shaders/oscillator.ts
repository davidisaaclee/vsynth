import { glsl } from '@davidisaaclee/video-graph';

export default glsl`
	precision mediump float;

	const float TWO_PI = 6.28318530718;
	const float N_SCANLINES = 500.;

	// between 0-1, where 1 is a full period
	uniform float phaseOffset;

	// in cycles / frame
	uniform float frequency;

	uniform vec2 inputTextureDimensions;

	uniform vec3 color;

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

	vec2 rotate(vec2 v, float a) {
		float s = sin(a);
		float c = cos(a);
		mat2 m = mat2(c, -s, s, c);
		return m * v;
	}

	float luminance(vec3 rgb) {
		return (0.2126*rgb.r + 0.7152*rgb.g + 0.0722*rgb.b);
	}

	void main() {
		vec2 textureSamplePoint =
			gl_FragCoord.xy / inputTextureDimensions;

		float theta = luminance(
			texture2D(
				rotationTheta,
				textureSamplePoint).rgb
		) * TWO_PI * rotationAmount;

		vec2 position =
			rotate(
				gl_FragCoord.xy,
				theta);
		float phaseOffsetFromTexture =
			luminance(texture2D(
				phaseOffsetTexture,
				textureSamplePoint).rgb)
			* phaseOffsetTextureAmount;

		highp vec2 uv =
			position / inputTextureDimensions;

		float pixelIndex =
			uv.x / N_SCANLINES + (uv.y - mod(uv.y, 1. / N_SCANLINES));

		float summedPhaseOffset = mod(phaseOffset + phaseOffsetFromTexture, 1.);


		float sine =
			(
				sin(
					mod(
						TWO_PI
						* (
							frequency * pixelIndex
							+ (phaseOffset + phaseOffsetFromTexture)),
						TWO_PI))
				+ 1.)
			/ 2.;


		float duty = clamp(shape, 0.5, 1.);
		// should mod pixelIndex by 1, but guaranteed to be within 0-1
		float p1 = duty;
		float p2 = 1. - p1;
		float m1 = 0.5 / p1;
		float m2 = 0.5 / p2;
		float x = mod((frequency * pixelIndex) + summedPhaseOffset - 0.25, 1.);
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

`;
