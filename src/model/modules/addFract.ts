import { glsl } from '@davidisaaclee/video-graph';
import { VideoModule, ShaderModule } from '../VideoModule';

export const parameterKeys = {
	'a': 'a',
	'b': 'b',
};

export const inletKeys = {
	'a': 'a',
	'b': 'b',
};

const shaderSource = glsl`
	precision mediump float;

	uniform vec2 inputTextureDimensions;

	uniform float leftAmount;
	uniform sampler2D leftTexture;

	uniform float rightAmount;
	uniform sampler2D rightTexture;

	void main() {
		vec2 samplePoint =
			gl_FragCoord.xy / inputTextureDimensions;
		gl_FragColor =
			texture2D(leftTexture, samplePoint) * leftAmount
			+ texture2D(rightTexture, samplePoint) * rightAmount;
		gl_FragColor.rgb = fract(gl_FragColor.rgb);
	}
`;

// Adds two textures together, and takes the fractional component of the result.
export const addFract: VideoModule<ShaderModule> = {
	name: 'add wrap',
	description: "Sums two inputs, and returns the fractional component of the sum.",

	parameters: {
		keys: [
			parameterKeys.a,
			parameterKeys.b,
		],
		defaultValues: {
			[parameterKeys.a]: 1,
			[parameterKeys.b]: 1,
		},
	},

	inlets: {
		keys: [inletKeys.a, inletKeys.b],
		associatedParameters: {
			[inletKeys.a]: parameterKeys.a,
			[inletKeys.b]: parameterKeys.b,
		},
	},

	details: {
		type: 'shader',

		shaderSource,

		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			},
		}),

		parametersToUniforms: (values) => ({
			'leftAmount': {
				type: 'f',
				data: values[parameterKeys.a],
			},
			'rightAmount': {
				type: 'f',
				data: values[parameterKeys.b],
			},
		}),

		inletsToUniforms: {
			[inletKeys.a]: 'leftTexture',
			[inletKeys.b]: 'rightTexture',
		}
	}
};

