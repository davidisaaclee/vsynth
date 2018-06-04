import { VideoGraph, PluginNode, UniformValue, UniformSpecification } from '@davidisaaclee/video-graph';
import { mapNodes } from '@davidisaaclee/graph';
import oscillatorShader from '../shaders/oscillator';
import constantShader from '../shaders/constant';
import { SimpleVideoGraph, VideoModuleSpecification } from './SimpleVideoGraph';

interface VideoModule {
	shaderSource: string;
	defaultUniforms?: (gl: WebGLRenderingContext) => { [identifier: string]: UniformValue };
	animationUniforms?: (frameIndex: number) => { [identifier: string]: UniformValue };
}

// key :: ModuleType
export const modules: { [key: string]: VideoModule } = {
	'oscillator': {
		shaderSource: oscillatorShader,
		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'inputTextureDimensions': {
				type: '2f',
				data: [gl.canvas.width, gl.canvas.height]
			}
		}),
		animationUniforms: (frameIndex: number) => ({
			// TODO: need to get the active frequency...
			'phaseOffset': {
				type: 'f',
				data: 0,
			}
		}),
	},

	'constant': {
		shaderSource: constantShader,
		defaultUniforms: (gl: WebGLRenderingContext) => ({
			'value': {
				type: '3f',
				data: [0, 0, 0]
			}
		}),
	},
};


interface RuntimeModule {
	program: WebGLProgram;
}

export function videoGraphFromSimpleVideoGraph(
	graph: SimpleVideoGraph,
	// moduleKey :: ModuleType
	runtime: { [moduleKey: string]: RuntimeModule },
	frameIndex: number,
	gl: WebGLRenderingContext
): VideoGraph {
	return mapNodes(graph, (moduleSpec: VideoModuleSpecification): PluginNode => {
		const runtimeModule = runtime[moduleSpec.type];
		const moduleConfiguration = modules[moduleSpec.type];

		if (runtimeModule == null) {
			throw new Error(`No runtime found for module type: ${moduleSpec.type}`);
		}
		if (moduleConfiguration == null) {
			throw new Error(`No module configuration found for module type: ${moduleSpec.type}`);
		}

		const defaultUniforms = moduleConfiguration.defaultUniforms == null
			? {} 
			: moduleConfiguration.defaultUniforms(gl);

		const animationUniforms = moduleConfiguration.animationUniforms == null
			? {} 
			: moduleConfiguration.animationUniforms(frameIndex);

		return {
			program: runtimeModule.program,
			uniforms: {
				...uniformValuesToSpec(defaultUniforms),
				...uniformValuesToSpec(animationUniforms),
				...uniformValuesToSpec(moduleSpec.uniforms),
			}
		}
	});
}

function uniformValuesToSpec(
	valuesDict: { [identifier: string]: UniformValue }
): { [identifier: string]: UniformSpecification } {
	const retval = {};
	for (const identifier of Object.keys(valuesDict)) {
		retval[identifier] = { identifier, value: valuesDict[identifier] };
	}
	return retval;
}

