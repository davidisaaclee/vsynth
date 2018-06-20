import { glsl } from '@davidisaaclee/video-graph';

export default glsl`
	precision mediump float;

	const float N_SCANLINES = 500.;
	const float TWO_PI = 6.28318530718;

	uniform float ditherAmount;
	uniform vec2 inputTextureDimensions;
	uniform sampler2D rotationTheta;
	uniform float rotationAmount;
	uniform sampler2D phaseOffsetTexture;
	uniform float phaseOffsetTextureAmount;


	vec2 rotate(vec2 v, float a, vec2 center) {
		float s = sin(a);
		float c = cos(a);
		mat2 m = mat2(c, -s, s, c);
		return center + m * (v - center);
	}

	float luminance(vec3 rgb) {
		return (0.2126*rgb.r + 0.7152*rgb.g + 0.0722*rgb.b);
	}

	float rand(vec2 n) { 
		return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
	}

	float noise(vec2 n) {
		const vec2 d = vec2(0.0, 1.0);
		vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
		return mix(
			mix(rand(b), rand(b + d.yx), f.x),
			mix(rand(b + d.xy), rand(b + d.yy), f.x),
			f.y);
	}

	void main() {
		vec2 textureSamplePoint =
			gl_FragCoord.xy / inputTextureDimensions;

		float theta = luminance(
			texture2D(
				rotationTheta,
				textureSamplePoint).rgb
		) * TWO_PI * rotationAmount;

		float phaseOffsetFromTexture =
			luminance(texture2D(
				phaseOffsetTexture,
				textureSamplePoint).rgb)
			* phaseOffsetTextureAmount;

		vec2 position =
			rotate(
				gl_FragCoord.xy,
				theta,
				inputTextureDimensions * 0.5
			);
		
		highp vec2 uv =
			position / inputTextureDimensions;

		gl_FragColor = vec4(
			vec3(
				mod(
					uv.x / N_SCANLINES
					+ (uv.y - mod(uv.y, 1. / N_SCANLINES))
					+ phaseOffsetFromTexture,
					1.
				)
			),
			1.);
		gl_FragColor.rgb +=
			ditherAmount * mix(-0.5/128., 0.5/128., noise(gl_FragCoord.xy));
	}

`;
