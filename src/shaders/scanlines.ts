import { glsl } from '@davidisaaclee/video-graph';

export default glsl`
	precision mediump float;

	const float N_SCANLINES = 500.;

	uniform vec2 inputTextureDimensions;

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
		vec2 uv =
			gl_FragCoord.xy / inputTextureDimensions;

		gl_FragColor = vec4(
			vec3(
				uv.x / N_SCANLINES
				+ (uv.y - mod(uv.y, 1. / N_SCANLINES))
			),
			1.);
		gl_FragColor.rgb += mix(-0.5/128., 0.5/128., noise(gl_FragCoord.xy));
	}

`;
