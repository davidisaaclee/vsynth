import shaderSource from '../../shaders/crosshatch.generated';
import { VideoModule } from '../VideoModule';

export const crosshatch: VideoModule = {
	type: 'crosshatch',
	shaderSource,
	defaultUniforms: (gl: WebGLRenderingContext) => ({
		'inputTextureDimensions': {
			type: '2f',
			data: [gl.canvas.width, gl.canvas.height]
		},
	}),
	inlets: {
		uniformMappings: {
			'input': 'inputTexture',
		},
		displayOrder: ['input'],
	}
};

