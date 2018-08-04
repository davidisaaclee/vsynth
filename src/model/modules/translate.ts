import shaderSource from '../../shaders/translate.generated';
import mkShaderModule from '../../utility/mkShaderModule';

export const inletKeys = {
	input: 'input',
	translateX: 'translateX',
	translateY: 'translateY',
};

export const translate = mkShaderModule({
	name: 'translate',
	description: 'Translate by xy value, wrapping.',
	shaderSource,
	inlets: [
		{
			key: 'input',
			defaultScaleValue: 1,
		},
		{
			key: 'translateX',
			defaultScaleValue: 0,
		},
		{
			key: 'translateY',
			defaultScaleValue: 0,
		},
	],
	defaultUniforms: (gl: WebGLRenderingContext) => ({
		'inputTextureDimensions': {
			type: '2f',
			data: [gl.canvas.width, gl.canvas.height]
		},
	}),
});

