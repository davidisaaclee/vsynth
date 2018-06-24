import { glsl } from '@davidisaaclee/video-graph';
import { VideoModule, ShaderModule } from '../VideoModule';

export const parameterKeys = {
	sizeAmount: 'sizeAmount',
	speedAmount: 'speedAmount'
};

export const inletKeys = {
	size: 'size',
	speed: 'speed'
};

const shaderSource = glsl`
	precision mediump float;

	uniform vec2 inputTextureDimensions;

	// Size of the waves created by the oscillator
	// (Corresponds to the integral harmonic of the frequency.)
	uniform sampler2D waveSize;
	uniform float waveSizeAmount;

	// The speed of the waves created by the oscillator
	// (Corresponds to the inharmonic portion of the frequency.)
	// 0, 0.5, 1 = still
	uniform sampler2D speed;
	uniform float speedAmount;

	// TODO: This might be out of bounds of a lowp float.
	uniform float frameDelta;

	// TODO: Be more explicit about mirroring
	// oscillator's frequency sampling method.
	float maxComponent(vec3 v) {
		return max(v.x, max(v.y, v.z));
	}

	float sampleTex(sampler2D t, vec2 pt, float scale) {
		return maxComponent(
				texture2D(
					t,
					pt).rgb)
			* scale;
	}

	float calculateFrequency(vec2 textureSamplePoint) {
		float waveSizeSample = sampleTex(
				waveSize,
				textureSamplePoint,
				waveSizeAmount);

		float speedSample = sampleTex(
				speed,
				textureSamplePoint,
				speedAmount);

		return ceil(waveSizeSample * waveSizeSample * 100.)
			+ 2. * (speedSample - 0.5);
	}

	void main() {
		vec2 textureSamplePoint =
			gl_FragCoord.xy / inputTextureDimensions;

		// actually frequency / 2pi
		float frequency =
			calculateFrequency(textureSamplePoint);

		float period = 1. / frequency;
		float phaseDelta = mod(frameDelta / period, 1.);

		gl_FragColor = vec4(vec3(phaseDelta), 1.);
	}
`;

// Calculates the phase offset delta for an oscillator, given a frequency.
export const phaseDelta: VideoModule<ShaderModule> = {
	parameters: {
		keys: [
			parameterKeys.sizeAmount,
			parameterKeys.speedAmount,
		],
		defaultValues: {
			[parameterKeys.sizeAmount]: 1,
			[parameterKeys.speedAmount]: 1,
		},
	},

	inlets: {
		keys: [
			inletKeys.size,
			inletKeys.speed
		],
		associatedParameters: {
			[inletKeys.size]: [parameterKeys.sizeAmount],
			[inletKeys.speed]: [parameterKeys.speedAmount],
		},
	},

	details: {
		type: 'shader',

		shaderSource,

		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			},
			'frameDelta': {
				type: 'f',
				data: 1
			}
		}),

		parametersToUniforms: (values) => ({
			waveSizeAmount: {
				type: 'f',
				data: values[parameterKeys.sizeAmount]
			},
			speedAmount: {
				type: 'f',
				data: values[parameterKeys.speedAmount]
			},
		}),

		inletsToUniforms: {
			[inletKeys.size]: 'waveSize',
			[inletKeys.speed]: 'speed',
		}
	}
};