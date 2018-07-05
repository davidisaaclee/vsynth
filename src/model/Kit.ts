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

import { autoOsc } from './modules/autoOsc';
import { ramp } from './modules/ramp';
import { crossBlur } from './modules/crossBlur';
import { multipassBlur } from './modules/multipassBlur';

import { VideoModule, ShaderModule, SubgraphModule } from './VideoModule';
import { VideoNode } from './SimpleVideoGraph';

export type SubgraphModuleType = 'autoOsc' | 'ramp' | 'crossBlur' | 'multipassBlur';
export type ShaderModuleType =
	'periodic' | 'identity' | 'constant' | 'addFract'
	| 'phaseDelta' | 'mixer' | 'scanlines' | 'rgbOffset' | 'divide'
	| 'multiply' | 'addClip' | 'singlePassBlur' | 'zoomIn'
	| 'scanlineDisplace' | 'modulo' | 'hsv';

export type ModuleType = ShaderModuleType | SubgraphModuleType;

export const subgraphModules: Record<SubgraphModuleType, VideoModule<SubgraphModule>> = {
	autoOsc,
	ramp,
	crossBlur,
	multipassBlur,
};

export const shaderModules: Record<ShaderModuleType, VideoModule<ShaderModule>> = {
	periodic,
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
	singlePassBlur,
	zoomIn,
	scanlineDisplace,
	modulo,
	hsv,
};

export const moduleKeys: ModuleType[] = [
	'periodic',
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
	'multipassBlur',
	'zoomIn',
	'scanlineDisplace',
	'modulo',
	'hsv',
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

