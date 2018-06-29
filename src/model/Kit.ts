import { rgbOffset } from './modules/rgbOffset';
import { scanlines } from './modules/scanlines';
import { oscillator } from './modules/oscillator';
import { identity } from './modules/identity';
import { constant } from './modules/constant';
import { addFract } from './modules/addFract';
import { addClip } from './modules/addClip';
import { phaseDelta } from './modules/phaseDelta';
import { mixer } from './modules/mixer';
import { divide } from './modules/divide';
import { multiply } from './modules/multiply';
import { autoOsc } from './modules/autoOsc';
import { ramp } from './modules/ramp';

import { VideoModule, ShaderModule, SubgraphModule } from './VideoModule';
import { VideoNode } from './SimpleVideoGraph';

export type SubgraphModuleType = 'autoOsc' | 'ramp';
export type ShaderModuleType =
	'oscillator' | 'identity' | 'constant' | 'addFract'
	| 'phaseDelta' | 'mixer' | 'scanlines' | 'rgbOffset' | 'divide'
	| 'multiply' | 'addClip';

export type ModuleType = ShaderModuleType | SubgraphModuleType;

export const subgraphModules: Record<SubgraphModuleType, VideoModule<SubgraphModule>> = {
	autoOsc,
	ramp,
};

export const shaderModules: Record<ShaderModuleType, VideoModule<ShaderModule>> = {
	oscillator,
	identity,
	constant,
	addFract,
	phaseDelta,
	mixer,
	scanlines,
	rgbOffset,
	divide,
	multiply,
	addClip,
};

export const moduleKeys: ModuleType[] = [
	'oscillator',
	'multiply',
	'addFract',
	'phaseDelta',
	'autoOsc',
	'mixer',
	'scanlines',
	'rgbOffset',
	'divide',
	'addClip',
	'ramp',
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

