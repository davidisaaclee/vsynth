import { UniformValue } from '@davidisaaclee/video-graph';
import { VideoModuleSpecification } from './SimpleVideoGraph';
import { ModuleType, Parameter } from './Kit';

/*
 * Configurations of nodes to be instantiated in a VideoGraph.
 */
export interface VideoModule {
	type: ModuleType;
	shaderSource: string;
	parameters?: {
		specifications: { [identifier: string]: Parameter },
		toUniforms: (values: { [identifier: string]: number }) => { [identifier: string]: UniformValue }
	};
	defaultUniforms?: (gl: WebGLRenderingContext) => { [identifier: string]: UniformValue };
	animationUniforms?: (frameIndex: number, uniforms: { [identifier: string]: UniformValue }, node: VideoModuleSpecification) => { [identifier: string]: UniformValue };

	// Update internal state on each frame if needed.
	update?: (frameIndex: number, state: Record<string, number>, node: VideoModuleSpecification) => Record<string, number>;

	inlets?: {
		// maps display name to uniform identifier
		uniformMappings: { [key: string]: string },

		// display order of inlets by key
		displayOrder: string[],
	}
}
