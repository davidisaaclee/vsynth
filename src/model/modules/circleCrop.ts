import shaderSource from '../../shaders/circleCrop.generated';
import mkShaderModule from '../../utility/mkShaderModule';

export const inletKeys = {
	input: 'input',
};

export const circleCrop = mkShaderModule({
	name: 'circle crop',
	description: 'Crop an input into a circle.',
	shaderSource,
	inlets: [
		{
			key: 'input',
			defaultScaleValue: 1,
			scalingUniform: 'inputAmount',
			textureUniform: 'inputTexture',
		},
	],
	defaultUniforms: (gl: WebGLRenderingContext) => {
		const radius = 0.3;
		const aspectRatioRadius: [number, number] = [radius, gl.canvas.width / gl.canvas.height * radius];

		return {
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			},

			radius: {
				type: '2f',
				data: aspectRatioRadius
			},

			center: {
				type: '2f',
				data: [0.5, 0.5]
			},
		}
	},
});

