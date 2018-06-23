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
/*
import { addFract } from './modules/addFract';
import { divide } from './modules/divide';
import { phaseDelta } from './modules/phaseDelta';
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

export type SubgraphModuleType = never;
export type ShaderModuleType = 'oscillator' | 'identity' | 'constant';

// TODO: add SubgraphModuleType
export type ModuleType = ShaderModuleType;

// const subgraphModules: Record<SubgraphModuleType, SubgraphModule> = {};
export const shaderModules: Record<ShaderModuleType, VideoModule<ShaderModule>> = {
	oscillator,
	identity,
	constant,
};

export const moduleKeys: ShaderModuleType[] = [
	'oscillator', 'identity', 'constant'
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
		throw new Error("TODO");
	}
}


export function moduleForNode(node: VideoNode): VideoModule<ShaderModule | SubgraphModule> {
	if (node.nodeType === 'subgraph') {
		throw new Error("TODO");
	} else {
		return shaderModules[node.type];
	}
}

