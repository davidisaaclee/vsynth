/*
import { scanlines } from './modules/scanlines';
import { constant } from './modules/constant';
import { mixer } from './modules/mixer';
import { crosshatch } from './modules/crosshatch';
import { dither } from './modules/dither';
import { rgbOffset } from './modules/rgbOffset';
*/
import { oscillator } from './modules/oscillator';
/*
import { identity } from './modules/identity';
import { addFract } from './modules/addFract';
import { divide } from './modules/divide';
import { phaseDelta } from './modules/phaseDelta';
*/
import { VideoModule } from './VideoModule';

export type ModuleType =
	"oscillator";
	/*
	"identity" | "oscillator" | "constant" | "mixer" | "scanlines"
	| "crosshatch" | "dither" | "rgbOffset" | "addFract"
	| "divide" | "phaseDelta";
	*/

export const modules: Record<ModuleType, VideoModule> = {
	/*
	rgbOffset,
	dither,
	crosshatch,
	identity,
	*/
	oscillator,
	/*
	constant,
	mixer,
	scanlines,
	addFract,
	divide,
	phaseDelta,
	*/
};

