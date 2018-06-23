import shaderSource from '../../shaders/rgb-offset.generated';
import { VideoModule, shaderVideoModule } from '../VideoModule';

const params = {
	rAmount: 'rAmount',
	gAmount: 'gAmount',
	bAmount: 'bAmount',
};

export const rgbOffset: VideoModule = shaderVideoModule({
	shaderSource,
	parameters: {
		specifications: {
			[params.rAmount]: {
				initialValue: () => 0.5,
			},
			[params.gAmount]: {
				initialValue: () => 0.5,
			},
			[params.bAmount]: {
				initialValue: () => 0.5,
			},
		},
		toUniforms: values => ({
			rOffsetAmount: {
				type: 'f',
				data: values[params.rAmount]
			},
			gOffsetAmount: {
				type: 'f',
				data: values[params.gAmount]
			},
			bOffsetAmount: {
				type: 'f',
				data: values[params.bAmount]
			},
		}),
	},
	defaultUniforms: (gl: WebGLRenderingContext) => ({
		'inputTextureDimensions': {
			type: '2f',
			data: [gl.canvas.width, gl.canvas.height]
		},
	}),

	inlets: {
		uniformMappings: {
			'input': 'inputTexture',
			'r': 'rOffset',
			'g': 'gOffset',
			'b': 'bOffset',
		},
		displayOrder: ['input', 'r', 'g', 'b'],
		associatedParameters: {
			'r': [params.rAmount],
			'g': [params.gAmount],
			'b': [params.bAmount],
		}
	}
});

