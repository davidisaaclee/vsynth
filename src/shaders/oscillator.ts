import { glsl } from 'video-graph';

export default glsl`
	precision mediump float;

	const float TWO_PI = 6.28318530718;
	const float N_SCANLINES = 500.;

	// in frames
	uniform float phaseOffset;

	// in cycles / frame
	uniform float frequency;

	// todo: change to ivec2
	uniform vec2 inputTextureDimensions;

	uniform sampler2D rotationTheta;

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
		vec2 position =
			rotate(
				gl_FragCoord.xy,
				luminance(texture2D(
					rotationTheta,
					gl_FragCoord.xy / inputTextureDimensions).rgb) * TWO_PI);
		highp vec2 uv =
			position / inputTextureDimensions;

		float pixelIndex =
			uv.x / N_SCANLINES + (uv.y - mod(uv.y, 1. / N_SCANLINES));

		gl_FragColor = vec4(
			(sin(mod(frequency * TWO_PI * pixelIndex + phaseOffset * TWO_PI, TWO_PI)) + 1.) / 2.,
			vec2(0.),
			1);
	}

`;
