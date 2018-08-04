import shaderSource from '../../shaders/noise.generated';
import mkShaderModule from '../../utility/mkShaderModule';

export const inletKeys = {
	seed: 'seed',
	offsetX: 'offsetX',
	offsetY: 'offsetY',
	scale: 'scale',
};

export const noise = mkShaderModule({
	name: 'noise',
	description: 'Generate noise.',
	shaderSource,
	inlets: [
		{
			key: inletKeys.seed,
			defaultScaleValue: 1,
		},
		{
			key: inletKeys.offsetX,
			defaultScaleValue: 1,
		},
		{
			key: inletKeys.offsetY,
			defaultScaleValue: 1,
		},
		{
			key: inletKeys.scale,
			defaultScaleValue: 1,
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

