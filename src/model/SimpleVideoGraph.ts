/*
 * Defines a plain-object representation of a video graph,
 * for use in a Redux store.
 */

import { Graph, Edge } from '@davidisaaclee/graph';
import { UniformValue } from '@davidisaaclee/video-graph';
import { ModuleType } from './Kit';

export interface InletSpecification {
	inlet: string;
}

export interface VideoNode {
	type: ModuleType;
	parameters: { [identifier: string]: number };
	uniforms: { [identifier: string]: UniformValue };
	state: Record<string, number>;
}

export type SimpleVideoGraph =
	Graph<VideoNode, InletSpecification>;

// TODO: It'd be nice to be able to automatically get this from a Graph<>.
export type Edge = Edge<InletSpecification>;

