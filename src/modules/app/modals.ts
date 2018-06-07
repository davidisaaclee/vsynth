const typeKey = 'type';

export interface ModuleControls {
	type: 'MODULE_CONTROLS';
	moduleKey: string;
}

export type Modal =
	'PICK_MODULE' 
	| ModuleControls;

export const PICK_MODULE = 'PICK_MODULE';

export const MODULE_CONTROLS: (moduleKey: string) => ModuleControls =
	(moduleKey: string) => ({ [typeKey]: 'MODULE_CONTROLS', moduleKey });

export function isModuleControls(modal: Modal): modal is ModuleControls {
	return modal[typeKey] != null && modal[typeKey] === 'MODULE_CONTROLS';
}

