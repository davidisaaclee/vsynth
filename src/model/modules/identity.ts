import { VideoModule, shaderVideoModule } from '../VideoModule';
import identityShader from '../../shaders/identity';

export const identity: VideoModule = shaderVideoModule({
	shaderSource: identityShader,
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
