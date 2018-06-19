import { glsl } from '@davidisaaclee/video-graph';

export default glsl`
	precision mediump float;

	const float N_SCANLINES = 500.;

	uniform vec2 inputTextureDimensions;

	void main() {
		highp vec2 uv =
			gl_FragCoord.xy / inputTextureDimensions;

		gl_FragColor = vec4(
			vec3(
				uv.x / N_SCANLINES
				+ (uv.y - mod(uv.y, 1. / N_SCANLINES))
			),
			1.);
	}
`;
