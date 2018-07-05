import mkShaderModule from '../../utility/mkShaderModule';
import shaderSource from '../../shaders/hsv.generated';

export const inletKeys = {
	input: 'input',
	hue: 'hue',
	saturation: 'saturation',
	value: 'value',
};

export const hsv = mkShaderModule({
	shaderSource,

	inlets: [
		{
			key: inletKeys.input,
			defaultScaleValue: 1,
		},
		{
			key: inletKeys.hue,
			defaultScaleValue: 1,
		},
		{
			key: inletKeys.saturation,
			defaultScaleValue: 0.5,
		},
		{
			key: inletKeys.value,
			defaultScaleValue: 0.5,
		},
	],

	defaultUniforms: (gl: WebGLRenderingContext) => ({
		'inputTextureDimensions': {
			type: '2f',
			data: [gl.canvas.width, gl.canvas.height]
		},
	}),
});

