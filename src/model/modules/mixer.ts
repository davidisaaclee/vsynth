import { glsl } from '@davidisaaclee/video-graph';
import { VideoModule, ShaderModule } from '../VideoModule';

const shaderSource = glsl`
	precision mediump float;

	uniform sampler2D mix;
	uniform float mixAmount;

	uniform vec2 inputTextureDimensions;

	uniform sampler2D inputA;
	uniform float inputAAmount;
	uniform sampler2D inputB;
	uniform float inputBAmount;

	float maxComponent(vec3 v) {
		return max(v.x, max(v.y, v.z));
	}

	void main() {
		vec2 textureSamplePoint =
			gl_FragCoord.xy / inputTextureDimensions;

		float sampledMix =
			maxComponent(texture2D(mix, textureSamplePoint).rgb * mixAmount);

		vec4 a =
			(texture2D(inputA, textureSamplePoint) * inputAAmount)
			* vec4(smoothstep(0., 0.5, sampledMix));
		vec4 b =
			(texture2D(inputB, textureSamplePoint) * inputBAmount)
			* vec4(smoothstep(0., 0.5, 1. - sampledMix));

		gl_FragColor =
			a + b;
	}
`;

export const parameterKeys = {
	mixAmount: 'mix amount',
	a: 'a',
	b: 'b',
};

export const inletKeys = {
	mix: 'mix',
	a: 'a',
	b: 'b',
};

export const mixer: VideoModule<ShaderModule> = {
	description: 'Fade between two inputs.',
	parameters: {
		keys: [
			parameterKeys.mixAmount,
			parameterKeys.a,
			parameterKeys.b,
		],
		defaultValues: {
			[parameterKeys.mixAmount]: 0.5,
			[parameterKeys.a]: 1,
			[parameterKeys.b]: 1,
		},
	},

	inlets: {
		keys: [inletKeys.mix, inletKeys.a, inletKeys.b],
		associatedParameters: {
			[inletKeys.mix]: parameterKeys.mixAmount,
			[inletKeys.a]: parameterKeys.a,
			[inletKeys.b]: parameterKeys.b,
		},
	},

	details: {
		type: 'shader',

		shaderSource,

		defaultUniforms: () => ({}),

		parametersToUniforms: values => ({
			'mixAmount': {
				type: 'f',
				data: values[parameterKeys.mixAmount]
			},
			'inputAAmount': {
				type: 'f',
				data: values[parameterKeys.a]
			},
			'inputBAmount': {
				type: 'f',
				data: values[parameterKeys.b]
			},
		}),

		inletsToUniforms: {
			[inletKeys.mix]: 'mix',
			[inletKeys.a]: 'inputA',
			[inletKeys.b]: 'inputB',
		}
	}
};

