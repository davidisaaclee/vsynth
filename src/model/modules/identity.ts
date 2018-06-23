import { VideoModule, ShaderModule } from '../VideoModule';
import identityShader from '../../shaders/identity';

export const identity: VideoModule<ShaderModule> = {
	parameters: {
		keys: [],
		defaultValues: {},
	},

	inlets: {
		keys: ['input'],
		associatedParameters: {}
	},

	details: {
		type: 'shader',

		shaderSource: identityShader,

		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			},
		}),

		parametersToUniforms: () => ({}),

		inletsToUniforms: {
			'input': 'inputTexture'
		},
	},
};
