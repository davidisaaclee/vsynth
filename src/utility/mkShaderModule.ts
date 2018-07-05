import { merge } from 'lodash';
import { UniformValue } from '@davidisaaclee/video-graph';
import { VideoModule, ShaderModule } from '../model/VideoModule';

interface InletConfig {
	key: string;
	textureUniform: string;
	scalingUniform: string;
	defaultScaleValue: number;
}

interface ShaderConfig {
	shaderSource: string;
	inlets: InletConfig[];
	defaultUniforms: (gl: WebGLRenderingContext) => Record<string, UniformValue>;
}

export default function mkShaderModule(shaderConfig: ShaderConfig): VideoModule<ShaderModule> {
	const {
		inlets, defaultUniforms,
		shaderSource,
	} = shaderConfig;
	return {
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
					[i.scalingUniform]: {
						type: 'f',
						data: values[i.key]
					}
				}))
				.reduce(merge, {})),
			inletsToUniforms: (inlets
				.map(i => ({ [i.key]: i.textureUniform }))
				.reduce(merge, {}))
		}
	};
}
