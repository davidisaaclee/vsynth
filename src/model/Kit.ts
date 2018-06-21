import { scanlines } from './modules/scanlines';
import { constant } from './modules/constant';
import { mixer } from './modules/mixer';
import { crosshatch } from './modules/crosshatch';
import { dither } from './modules/dither';
import { rgbOffset } from './modules/rgbOffset';
import { oscillator } from './modules/oscillator';
import { proOsc } from './modules/pro-osc';
import { identity } from './modules/identity';
import { VideoModule } from './VideoModule';

// TODO: Would be nice to make this typesafe with Kit.modules
export type ModuleType =
	"identity" | "oscillator" | "constant" | "mixer" | "scanlines"
	| "pro-osc" | "crosshatch" | "dither" | "rgbOffset";

// key :: ModuleType
export const modules: Record<ModuleType, VideoModule> = {
	rgbOffset,
	dither,
	crosshatch,
	identity,
	oscillator,
	'pro-osc': proOsc,
	constant,
	mixer,
	scanlines,
};

