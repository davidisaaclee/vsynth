import shaderSource from '../../shaders/dither.generated';
import { VideoModule } from '../VideoModule';

export const dither: VideoModule = {
	type: 'dither',
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

