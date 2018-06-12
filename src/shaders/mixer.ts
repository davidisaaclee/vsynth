import { glsl } from '@davidisaaclee/video-graph';

export default glsl`
	precision mediump float;

	uniform float mixAmount;

	// todo: change to ivec2
	uniform vec2 inputTextureDimensions;

	uniform sampler2D inputA;
	uniform sampler2D inputB;

	void main() {
		vec2 textureSamplePoint =
			gl_FragCoord.xy / inputTextureDimensions;

		vec4 a =
			texture2D(inputA, textureSamplePoint) * vec4(smoothstep(0., 0.5, mixAmount));
		vec4 b =
			texture2D(inputB, textureSamplePoint) * vec4(smoothstep(0., 0.5, 1. - mixAmount));

		gl_FragColor =
			a + b;
	}

`;
