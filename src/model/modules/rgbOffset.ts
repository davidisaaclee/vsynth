import shaderSource from '../../shaders/rgb-offset.generated';
import { VideoModule, ShaderModule } from '../VideoModule';

export const parameterKeys = {
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
			parameterKeys.rAmount,
			parameterKeys.gAmount,
			parameterKeys.bAmount,
		],
		defaultValues: {
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
			[inletKeys.r]: [parameterKeys.rAmount],
			[inletKeys.g]: [parameterKeys.gAmount],
			[inletKeys.b]: [parameterKeys.bAmount],
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

