import { Graph } from '@davidisaaclee/graph';
import { PluginConnection, UniformValue } from '@davidisaaclee/video-graph';

// TODO: Would be nice to make this typesafe with Kit.modules
export type ModuleType = "oscillator" | "constant";

export interface VideoModuleSpecification {
	type: ModuleType;
	uniforms: { [identifier: string]: UniformValue };
}

export type SimpleVideoGraph = Graph<VideoModuleSpecification, PluginConnection>;

