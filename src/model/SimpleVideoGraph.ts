/*
 * Defines a plain-object representation of a video graph,
 * for use in a Redux store.
 */

import { Graph, Edge } from '@davidisaaclee/graph';
import { UniformValue } from '@davidisaaclee/video-graph';

// TODO: Would be nice to make this typesafe with Kit.modules
export type ModuleType =
	"identity" | "oscillator" | "constant" | "mixer"
	| "scanlines" | "pro-osc" | "blur" | "crosshatch"
	| "dither";

export interface InletSpecification {
	inlet: string;
}

export interface VideoModuleSpecification {
	type: ModuleType;
	parameters: { [identifier: string]: number };
	uniforms: { [identifier: string]: UniformValue };
	state: Record<string, number>;
}

export type SimpleVideoGraph =
	Graph<VideoModuleSpecification, InletSpecification>;

// TODO: It'd be nice to be able to automatically get this from a Graph<>.
export type Edge = Edge<InletSpecification>;

