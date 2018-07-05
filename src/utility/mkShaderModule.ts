import { merge, defaultTo } from 'lodash';
import { UniformValue } from '@davidisaaclee/video-graph';
import { VideoModule, ShaderModule } from '../model/VideoModule';

interface InletConfig {
	key: string;

	// defaults to `${key}Texture`
	textureUniform?: string;

	// defaults to `${key}Amount`
	scalingUniform?: string;

	defaultScaleValue: number;
}

interface ShaderConfig {
	description: string;
	shaderSource: string;
	inlets: InletConfig[];
	defaultUniforms: (gl: WebGLRenderingContext) => Record<string, UniformValue>;
}

export default function mkShaderModule(shaderConfig: ShaderConfig): VideoModule<ShaderModule> {
	const {
		inlets, defaultUniforms,
		shaderSource, description,
	} = shaderConfig;

	return {
		description,

		parameters: {
			keys: inlets.map(i => i.key),
			defaultValues: (inlets
				.map(i => ({ [i.key]: i.defaultScaleValue }))
				.reduce(merge, {})),
		},

		inlets: {
			keys: inlets.map(i => i.key),
			associatedParameters: (inlets
				.map(i => ({ [i.key]: i.key }))
				.reduce(merge, {})),
		},

		details: {
			type: 'shader',
			shaderSource,
			defaultUniforms,
			parametersToUniforms: values => (inlets
				.map(i => ({
					[defaultTo(i.scalingUniform, `${i.key}Amount`)]: {
						type: 'f',
						data: values[i.key]
					}
				}))
				.reduce(merge, {})),
			inletsToUniforms: (inlets
				.map(i => ({ [i.key]: defaultTo(i.textureUniform, `${i.key}Texture`) }))
				.reduce(merge, {}))
		}
	};
}
