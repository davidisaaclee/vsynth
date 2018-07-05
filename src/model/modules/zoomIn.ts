// import { VideoModule, ShaderModule } from '../VideoModule';
import shaderSource from '../../shaders/zoomIn.generated';
import mkShaderModule from '../../utility/mkShaderModule';

export const inletKeys = {
	input: 'input',
	scale: 'scale',
};

export const zoomIn = mkShaderModule({
	shaderSource,
	inlets: [
		{
			key: 'input',
			defaultScaleValue: 1,
			scalingUniform: 'inputAmount',
			textureUniform: 'inputTexture',
		},
		{
			key: 'scale',
			defaultScaleValue: 0,
			scalingUniform: 'scaleAmount',
			textureUniform: 'scaleTexture',
		}
	],
	defaultUniforms: (gl: WebGLRenderingContext) => ({
		'inputTextureDimensions': {
			type: '2f',
			data: [gl.canvas.width, gl.canvas.height]
		},
	}),
});

