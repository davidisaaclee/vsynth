import shaderSource from '../../shaders/rgb-offset.generated';
import { VideoModule, ShaderModule } from '../VideoModule';

export const parameterKeys = {
	input: 'input',
	rAmount: 'rAmount',
	gAmount: 'gAmount',
	bAmount: 'bAmount',
};

export const inletKeys = {
	input: 'input',
	r: 'r',
	g: 'g',
	b: 'b',
};

export const rgbOffset: VideoModule<ShaderModule> = {
	parameters: {
		keys: [
			parameterKeys.input,
			parameterKeys.rAmount,
			parameterKeys.gAmount,
			parameterKeys.bAmount,
		],
		defaultValues: {
			[parameterKeys.input]: 1,
			[parameterKeys.rAmount]: 0.5,
			[parameterKeys.gAmount]: 0.5,
			[parameterKeys.bAmount]: 0.5,
		}
	},

	inlets: {
		keys: [
			inletKeys.input,
			inletKeys.r,
			inletKeys.g,
			inletKeys.b,
		],
		associatedParameters: {
			[inletKeys.input]: parameterKeys.input,
			[inletKeys.r]: parameterKeys.rAmount,
			[inletKeys.g]: parameterKeys.gAmount,
			[inletKeys.b]: parameterKeys.bAmount,
		}
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
			inputTextureAmount: {
				type: 'f',
				data: values[parameterKeys.input]
			},
			rOffsetAmount: {
				type: 'f',
				data: values[parameterKeys.rAmount]
			},
			gOffsetAmount: {
				type: 'f',
				data: values[parameterKeys.gAmount]
			},
			bOffsetAmount: {
				type: 'f',
				data: values[parameterKeys.bAmount]
			},
		}),

		inletsToUniforms: {
			[inletKeys.input]: 'inputTexture',
			[inletKeys.r]: 'rOffset',
			[inletKeys.g]: 'gOffset',
			[inletKeys.b]: 'bOffset',
		}
	}
};

