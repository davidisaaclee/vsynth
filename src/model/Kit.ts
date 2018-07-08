import { rgbOffset } from './modules/rgbOffset';
import { scanlines } from './modules/scanlines';
import { periodic } from './modules/periodic';
import { identity } from './modules/identity';
import { constant } from './modules/constant';
import { addFract } from './modules/addFract';
import { addClip } from './modules/addClip';
import { phaseDelta } from './modules/phaseDelta';
import { mixer } from './modules/mixer';
import { divide } from './modules/divide';
import { multiply } from './modules/multiply';
import { singlePassBlur } from './modules/singlePassBlur';
import { zoomIn } from './modules/zoomIn';
import { scanlineDisplace } from './modules/scanlineDisplace';
import { modulo } from './modules/modulo';
import { hsv } from './modules/hsv';

import { oscillator } from './modules/oscillator';
import { ramp } from './modules/ramp';
import { crossBlur } from './modules/crossBlur';
import { multipassBlur } from './modules/multipassBlur';

import { VideoModule, ShaderModule, SubgraphModule } from './VideoModule';
import { VideoNode } from './SimpleVideoGraph';

export enum SubgraphModuleType {
	oscillator = "oscillator",
	ramp = "ramp",
	crossBlur = "crossBlur",
	multipassBlur = "multipassBlur",
}

export enum ShaderModuleType {
	periodic = "periodic",
	identity = "identity",
	constant = "constant",
	addFract = "addFract",
	phaseDelta = "phaseDelta",
	mixer = "mixer",
	scanlines = "scanlines",
	rgbOffset = "rgbOffset",
	divide = "divide",
	multiply = "multiply",
	addClip = "addClip",
	singlePassBlur = "singlePassBlur",
	zoomIn = "zoomIn",
	scanlineDisplace = "scanlineDisplace",
	modulo = "modulo",
	hsv = "hsv",
}

export type ModuleType = ShaderModuleType | SubgraphModuleType;

export const subgraphModules: Record<SubgraphModuleType, VideoModule<SubgraphModule>> = {
	[SubgraphModuleType.oscillator]: oscillator,
	[SubgraphModuleType.ramp]: ramp,
	[SubgraphModuleType.crossBlur]: crossBlur,
	[SubgraphModuleType.multipassBlur]: multipassBlur,
};

export const shaderModules: Record<ShaderModuleType, VideoModule<ShaderModule>> = {
	[ShaderModuleType.periodic]: periodic,
	[ShaderModuleType.identity]: identity,
	[ShaderModuleType.constant]: constant,
	[ShaderModuleType.addFract]: addFract,
	[ShaderModuleType.phaseDelta]: phaseDelta,
	[ShaderModuleType.mixer]: mixer,
	[ShaderModuleType.scanlines]: scanlines,
	[ShaderModuleType.rgbOffset]: rgbOffset,
	[ShaderModuleType.divide]: divide,
	[ShaderModuleType.multiply]: multiply,
	[ShaderModuleType.addClip]: addClip,
	[ShaderModuleType.singlePassBlur]: singlePassBlur,
	[ShaderModuleType.zoomIn]: zoomIn,
	[ShaderModuleType.scanlineDisplace]: scanlineDisplace,
	[ShaderModuleType.modulo]: modulo,
	[ShaderModuleType.hsv]: hsv,
};

export const moduleKeys: ModuleType[] = [
	SubgraphModuleType.oscillator,
	ShaderModuleType.periodic,
	ShaderModuleType.mixer,
	SubgraphModuleType.ramp,
	ShaderModuleType.addFract,
	ShaderModuleType.addClip,
	ShaderModuleType.multiply,
	ShaderModuleType.divide,
	ShaderModuleType.modulo,
	ShaderModuleType.hsv,
	ShaderModuleType.scanlines,
	ShaderModuleType.zoomIn,
	ShaderModuleType.rgbOffset,
];


export function moduleForType(moduleType: ModuleType): VideoModule<ShaderModule | SubgraphModule> {
	if (shaderModules[moduleType] != null) {
		return shaderModules[moduleType];
	} else {
		return subgraphModules[moduleType];
	}
}


export function moduleForNode(node: VideoNode): VideoModule<ShaderModule | SubgraphModule> {
	if (node.nodeType === 'subgraph') {
		return subgraphModules[node.type];
	} else {
		return shaderModules[node.type];
	}
}

