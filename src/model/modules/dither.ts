import shaderSource from '../../shaders/dither.generated';
import { VideoModule, shaderVideoModule } from '../VideoModule';

export const dither: VideoModule = shaderVideoModule({
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
});
