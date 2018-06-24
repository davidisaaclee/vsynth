/*
import { scanlines } from './modules/scanlines';
import { mixer } from './modules/mixer';
import { crosshatch } from './modules/crosshatch';
import { dither } from './modules/dither';
import { rgbOffset } from './modules/rgbOffset';
*/
import { oscillator } from './modules/oscillator';
import { identity } from './modules/identity';
import { constant } from './modules/constant';
import { testSubgraph } from './modules/testSubgraph';
import { addFract } from './modules/addFract';
import { phaseDelta } from './modules/phaseDelta';
/*
import { divide } from './modules/divide';
*/
import { VideoModule, ShaderModule, SubgraphModule } from './VideoModule';
import { VideoNode } from './SimpleVideoGraph';

	/*
export type ModuleType =
	"oscillator";
	"identity" | "oscillator" | "constant" | "mixer" | "scanlines"
	| "crosshatch" | "dither" | "rgbOffset" | "addFract"
	| "divide" | "phaseDelta";
	*/

export type SubgraphModuleType = 'testSubgraph';
export type ShaderModuleType =
	'oscillator' | 'identity' | 'constant' | 'addFract' | 'phaseDelta';

export type ModuleType = ShaderModuleType | SubgraphModuleType;

export const subgraphModules: Record<SubgraphModuleType, VideoModule<SubgraphModule>> = {
	testSubgraph,
};

export const shaderModules: Record<ShaderModuleType, VideoModule<ShaderModule>> = {
	oscillator,
	identity,
	constant,
	addFract,
	phaseDelta,
};

export const moduleKeys: ModuleType[] = [
	'oscillator', 'identity', 'constant', 'testSubgraph', 'addFract',
	'phaseDelta'
];


	/*
const modules: Record<ModuleType, VideoModule> = {
	rgbOffset,
	dither,
	crosshatch,
	identity,
	oscillator,
	constant,
	mixer,
	scanlines,
	addFract,
	divide,
	phaseDelta,
};
	*/

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

