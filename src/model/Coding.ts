// Encodes/decodes a document into a shareable text string.

import {
	Decoder, object, number, array, dict, string, constant, oneOf, anyJson, lazy, union,
} from '@mojotech/json-type-validation';
import { UniformValue } from '@davidisaaclee/video-graph';
import { State as Document } from '../modules/document';
import { SubgraphNode, ShaderNode, VideoNode, SimpleVideoGraph } from '../model/SimpleVideoGraph';
import { ModuleConfigurationType } from '../model/VideoModule';
import { SubgraphModuleType, ShaderModuleType } from '../model/Kit';

// TODO
const uniformValueDecoder: Decoder<UniformValue> =
	anyJson().map(json => json as UniformValue);

const simpleVideoGraphDecoder: Decoder<SimpleVideoGraph> = object({
	_nodes: dict(lazy(() => videoNodeDecoder)),
	_edges: dict(object({
		src: string(),
		dst: string(),
		metadata: object({
			inlet: string()
		}),
	})),
});


const subgraphModuleType: Decoder<SubgraphModuleType> = oneOf(
	constant(SubgraphModuleType.oscillator),
	constant(SubgraphModuleType.ramp),
	constant(SubgraphModuleType.crossBlur),
	constant(SubgraphModuleType.multipassBlur),
);
const subgraphNodeDecoder: Decoder<SubgraphNode> = object({
	nodeType: constant(ModuleConfigurationType.subgraph) as Decoder<ModuleConfigurationType.subgraph>,
	type: subgraphModuleType,
	subgraph: simpleVideoGraphDecoder,
	outputNodeKey: string(),
});

const shaderModuleType: Decoder<ShaderModuleType> = oneOf(
	constant(ShaderModuleType.periodic),
	constant(ShaderModuleType.identity),
	constant(ShaderModuleType.constant),
	constant(ShaderModuleType.addFract),
	constant(ShaderModuleType.phaseDelta),
	constant(ShaderModuleType.mixer),
	constant(ShaderModuleType.scanlines),
	constant(ShaderModuleType.rgbOffset),
	constant(ShaderModuleType.divide),
	constant(ShaderModuleType.multiply),
	constant(ShaderModuleType.addClip),
	constant(ShaderModuleType.singlePassBlur),
	constant(ShaderModuleType.zoomIn),
	constant(ShaderModuleType.scanlineDisplace),
	constant(ShaderModuleType.modulo),
	constant(ShaderModuleType.hsv),
);

const shaderNodeDecoder: Decoder<ShaderNode> = object({
	nodeType: constant(ModuleConfigurationType.shader) as Decoder<ModuleConfigurationType.shader>,
	type: shaderModuleType,
	uniforms: dict(uniformValueDecoder),
});

const videoNodeDecoder: Decoder<VideoNode> = object({
	parameters: dict(number()),
	details: union(
		subgraphNodeDecoder,
		shaderNodeDecoder)
});

export const documentDecoder: Decoder<Document> = oneOf(
	object({
		version: constant(0),
		editHash: number(),
		nodeKeySeed: number(),
		nodes: dict(videoNodeDecoder),
		nodeOrder: array(string()),
		inletConnections: dict(dict(number())),
		outletConnections: dict(number()),
		busCount: number(),
	}));

export function encodeDocument(doc: Document): object {
	return { version: 0, ...doc };
}


