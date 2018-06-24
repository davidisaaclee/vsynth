import { glsl } from '@davidisaaclee/video-graph';
import { VideoModule, ShaderModule } from '../VideoModule';


export const inletKeys = {
	numerator: 'numerator',
	denominator: 'denominator',
}

const shaderSource = glsl`
	precision mediump float;

	const float DIVISOR_MIN = 0.0001;

	uniform vec2 inputTextureDimensions;
	uniform sampler2D numerator;
	uniform sampler2D denominator;

	void main() {
		vec2 samplePoint =
			gl_FragCoord.xy / inputTextureDimensions;
		gl_FragColor =
			texture2D(numerator, samplePoint)
			/ max(texture2D(denominator, samplePoint), DIVISOR_MIN);
	}
`;

// Takes the component-wise quotient of two textures.
// Guards against division-by-zero by clamping values below DIVISOR_MIN.
export const divide: VideoModule<ShaderModule> = {
	parameters: {
		keys: [],
		defaultValues: {},
	},

	inlets: {
		keys: [
			inletKeys.numerator,
			inletKeys.denominator,
		],
		associatedParameters: {},
	},

	details: {
		type: 'shader',

		shaderSource,

		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			},
		}),

		parametersToUniforms: () => ({}),

		inletsToUniforms: {
			[inletKeys.numerator]: 'numerator',
			[inletKeys.denominator]: 'denominator',
		}
	}
};
