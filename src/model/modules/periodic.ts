import mkShaderModule from '../../utility/mkShaderModule';
import shaderSource from '../../shaders/oscillator.generated';

export const inletKeys = {
	input: 'input',
	waveSize: 'harmonics',
	speed: 'inharmonics',
	shape: 'shape',
	rotation: 'rotation',
	phaseOffset: 'phase offset',
};


export const periodic = mkShaderModule({
	name: 'periodic',
	description: "Applies a periodic function to its input.",
	shaderSource,

	inlets: [
		{
			key: inletKeys.input,
			defaultScaleValue: 1,
		},
		{
			key: inletKeys.waveSize,
			defaultScaleValue: 1,
			textureUniform: 'waveSize',
			scalingUniform: 'waveSizeAmount',
		},
		{
			key: inletKeys.speed,
			defaultScaleValue: 1,
			textureUniform: 'speed',
			scalingUniform: 'speedAmount',
		},
		{
			key: inletKeys.shape,
			defaultScaleValue: 0,
			textureUniform: 'shape',
		},
		{
			key: inletKeys.phaseOffset,
			defaultScaleValue: 0,
			textureUniform: 'phaseOffsetTexture',
			scalingUniform: 'phaseOffsetTextureAmount',
		},
	],

	defaultUniforms: (gl: WebGLRenderingContext) => ({
		'inputTextureDimensions': {
			type: '2f',
			data: [gl.canvas.width, gl.canvas.height]
		},
	}),

});

