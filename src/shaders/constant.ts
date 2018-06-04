import { glsl } from 'video-graph';

export default glsl`
	precision mediump float;

	uniform vec3 value;

	void main() {
		gl_FragColor = vec4(value, 1);
	}
`;

