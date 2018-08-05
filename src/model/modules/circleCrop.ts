import shaderSource from '../../shaders/circleCrop.generated';
import mkShaderModule from '../../utility/mkShaderModule';

export const inletKeys = {
	input: 'input',
	radius: 'radius',
	centerX: 'centerX',
	centerY: 'centerY',
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
		{
			key: inletKeys.centerX,
			defaultScaleValue: 0.5,
		},
		{
			key: inletKeys.centerY,
			defaultScaleValue: 0.5,
		},
	],
	defaultUniforms: (gl: WebGLRenderingContext) => {
		return {
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			},
		}
	},
});

