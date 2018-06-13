import { glsl } from '@davidisaaclee/video-graph';

export default glsl`
	precision mediump float;

	uniform vec2 inputTextureDimensions;
	uniform sampler2D inputTexture;

	void main() {
		gl_FragColor =
			texture2D(inputTexture, gl_FragCoord.xy / inputTextureDimensions);
	}
`;

