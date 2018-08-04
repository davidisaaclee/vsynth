import shaderSource from '../../shaders/noise.generated';
import mkShaderModule from '../../utility/mkShaderModule';

export const inletKeys = {
	resolution: 'resolution',
};

export const noise = mkShaderModule({
	name: 'noise',
	description: 'Generate noise.',
	shaderSource,
	inlets: [
		{
			key: inletKeys.resolution,
			defaultScaleValue: 1,
		}
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

