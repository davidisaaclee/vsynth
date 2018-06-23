import { UniformValue } from '@davidisaaclee/video-graph';
import { VideoNode } from './SimpleVideoGraph';

/*
 * A non-texture-based parameter to a module, which can be translated to a
 * set of uniforms to be provided to the fragment shader.
 */
interface Parameter {
	initialValue(): number;
}

/*
 * Configurations of nodes to be instantiated in a VideoGraph.
 */
export type VideoModule = ShaderVideoModule;

export function shaderVideoModule(config: ShaderVideoModule): VideoModule {
	return config;
}

export interface ShaderVideoModule {
	shaderSource: string;

	parameters?: {
		specifications: { [identifier: string]: Parameter },
		toUniforms: (values: { [identifier: string]: number }) => { [identifier: string]: UniformValue }
	};

	defaultUniforms?: (gl: WebGLRenderingContext) => { [identifier: string]: UniformValue };

	animationUniforms?: (frameIndex: number, uniforms: { [identifier: string]: UniformValue }, node: VideoNode) => { [identifier: string]: UniformValue };

	// Update internal state on each frame if needed.
	update?: (frameIndex: number, state: Record<string, number>, node: VideoNode) => Record<string, number>;

	inlets?: {
		// maps display name to uniform identifier
		uniformMappings: { [key: string]: string },

		// display order of inlets by key
		displayOrder: string[],

		// maps inlet key to a list of parameter keys
		associatedParameters?: { [inletKey: string]: string[] }
	}
}
