import shaderSource from '../../shaders/alphaBlend.generated';
import mkShaderModule from '../../utility/mkShaderModule';

export const inletKeys = {
	foreground: 'foreground',
	background: 'background',
};

export const alphaBlend = mkShaderModule({
	name: 'alpha blend',
	description: 'Blend two signals by their alpha channel.',
	shaderSource,
	inlets: [
		{
			key: inletKeys.foreground,
			defaultScaleValue: 1,
		},
		{
			key: inletKeys.background,
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

