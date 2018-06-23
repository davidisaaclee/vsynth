import { glsl } from '@davidisaaclee/video-graph';
import { VideoModule, shaderVideoModule } from '../VideoModule';

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
export const divide: VideoModule = shaderVideoModule({
	shaderSource,
	defaultUniforms: (gl: WebGLRenderingContext) => ({
		'inputTextureDimensions': {
			type: '2f',
			data: [gl.canvas.width, gl.canvas.height]
		},
	}),
	inlets: {
		uniformMappings: {
			'numerator': 'numerator',
			'denominator': 'denominator',
		},
		displayOrder: ['numerator', 'denominator'],
	}
});
