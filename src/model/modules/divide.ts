import { glsl } from '@davidisaaclee/video-graph';
import { VideoModule, ShaderModule } from '../VideoModule';

export const parameterKeys = {
	numerator: 'numerator',
	denominator: 'denominator',
};

export const inletKeys = {
	numerator: 'numerator',
	denominator: 'denominator',
};

const shaderSource = glsl`
	precision mediump float;

	const float DIVISOR_MIN = 0.0001;

	uniform vec2 inputTextureDimensions;

	uniform float numeratorAmount;
	uniform sampler2D numerator;

	uniform float denominatorAmount;
	uniform sampler2D denominator;

	void main() {
		vec2 samplePoint =
			gl_FragCoord.xy / inputTextureDimensions;
		gl_FragColor =
			(texture2D(numerator, samplePoint) * numeratorAmount)
			/ max(texture2D(denominator, samplePoint) * denominatorAmount, DIVISOR_MIN);
	}
`;

// Takes the component-wise quotient of two textures.
// Guards against division-by-zero by clamping values below DIVISOR_MIN.
export const divide: VideoModule<ShaderModule> = {
	name: '÷',
	description: "Divides the numerator by the denominator.",

	parameters: {
		keys: [
			parameterKeys.numerator,
			parameterKeys.denominator,
		],
		defaultValues: {
			[parameterKeys.numerator]: 1,
			[parameterKeys.denominator]: 1,
		},
	},

	inlets: {
		keys: [
			inletKeys.numerator,
			inletKeys.denominator,
		],
		associatedParameters: {
			[inletKeys.numerator]: parameterKeys.numerator,
			[inletKeys.denominator]: parameterKeys.denominator,
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

		parametersToUniforms: values => ({
			'numeratorAmount': {
				type: 'f',
				data: values[parameterKeys.numerator]
			},
			'denominatorAmount': {
				type: 'f',
				data: values[parameterKeys.denominator]
			},
		}),

		inletsToUniforms: {
			[inletKeys.numerator]: 'numerator',
			[inletKeys.denominator]: 'denominator',
		}
	}
};
