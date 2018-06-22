import { glsl } from '@davidisaaclee/video-graph';
import { VideoModule } from '../VideoModule';

const shaderSource = glsl`
	precision mediump float;

	uniform vec2 inputTextureDimensions;
	uniform sampler2D leftTexture;
	uniform sampler2D rightTexture;

	void main() {
		vec2 samplePoint =
			gl_FragCoord.xy / inputTextureDimensions;
		gl_FragColor =
			texture2D(leftTexture, samplePoint)
			+ texture2D(rightTexture, samplePoint);
		gl_FragColor.rgb = fract(gl_FragColor.rgb);
	}
`;

// Adds two textures together, and takes the fractional component of the result.
export const addFract: VideoModule = {
	shaderSource,
	defaultUniforms: (gl: WebGLRenderingContext) => ({
		'inputTextureDimensions': {
			type: '2f',
			data: [gl.canvas.width, gl.canvas.height]
		},
	}),
	inlets: {
		uniformMappings: {
			'a': 'leftTexture',
			'b': 'rightTexture',
		},
		displayOrder: ['a', 'b'],
	}
};
