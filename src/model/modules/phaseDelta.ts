import { glsl, UniformValue } from '@davidisaaclee/video-graph';
import { VideoModule, shaderVideoModule } from '../VideoModule';
import { VideoNode } from '../SimpleVideoGraph';

const stateKeys = {
	frameIndex: 'frameIndex',
};

const shaderSource = glsl`
	precision mediump float;

	uniform vec2 inputTextureDimensions;

	// Size of the waves created by the oscillator
	// (Corresponds to the integral harmonic of the frequency.)
	uniform sampler2D waveSize;

	// The speed of the waves created by the oscillator
	// (Corresponds to the inharmonic portion of the frequency.)
	// 0, 0.5, 1 = still
	uniform sampler2D speed;

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
				//waveSizeAmount);
				1.);

		float speedSample = sampleTex(
				speed,
				textureSamplePoint,
				//speedAmount);
				1.);

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
export const phaseDelta: VideoModule = shaderVideoModule({
	shaderSource,
	defaultUniforms: (gl: WebGLRenderingContext) => ({
		'inputTextureDimensions': {
			type: '2f',
			data: [gl.canvas.width, gl.canvas.height]
		},
	}),
	inlets: {
		uniformMappings: {
			'wave size': 'waveSize',
			'speed': 'speed',
		},
		displayOrder: ['wave size', 'speed'],
	},
	update: (frameIndex: number, state: Record<string, number>, node: VideoNode) => {
		return {
			[stateKeys.frameIndex]: frameIndex,
		};
	},
	animationUniforms: (frameIndex: number, uniforms: { [identifier: string]: UniformValue }, node: VideoNode) => {
		const previousFrameIndex = node.state[stateKeys.frameIndex];
		return {
			'frameDelta': {
				type: 'f',
				data: previousFrameIndex == null
				? 0
				: previousFrameIndex - frameIndex
			}
		};
	},
});
