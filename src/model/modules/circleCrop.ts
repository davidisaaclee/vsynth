import shaderSource from '../../shaders/circleCrop.generated';
import mkShaderModule from '../../utility/mkShaderModule';

export const inletKeys = {
	input: 'input',
	radius: 'radius',
};

export const circleCrop = mkShaderModule({
	name: 'circle crop',
	description: 'Crop an input into a circle.',
	shaderSource,
	inlets: [
		{
			key: inletKeys.input,
			defaultScaleValue: 1,
		},

		{
			key: inletKeys.radius,
			defaultScaleValue: 0.5,
		},
	],
	defaultUniforms: (gl: WebGLRenderingContext) => {
		return {
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			},
			center: {
				type: '2f',
				data: [0.5, 0.5]
			},
		}
	},
});

