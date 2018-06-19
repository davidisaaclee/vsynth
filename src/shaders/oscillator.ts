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

		float z =
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

		gl_FragColor = vec4(
			color * vec3(z),
			1);
	}

`;
