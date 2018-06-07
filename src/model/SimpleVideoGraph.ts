/*
 * Defines a plain-object representation of a video graph,
 * for use in a Redux store.
 */

import { Graph } from '@davidisaaclee/graph';
import { UniformValue } from '@davidisaaclee/video-graph';

// TODO: Would be nice to make this typesafe with Kit.modules
export type ModuleType = "oscillator" | "constant";

export interface InletSpecification {
	inlet: string;
}

export interface VideoModuleSpecification {
	type: ModuleType;
	uniforms: { [identifier: string]: UniformValue };
}

export type SimpleVideoGraph =
	Graph<VideoModuleSpecification, InletSpecification>;

