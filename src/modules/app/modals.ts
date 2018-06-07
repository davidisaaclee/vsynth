const typeKey = 'type';

export interface NodeControls {
	type: 'NODE_CONTROLS';
	nodeKey: string;
}

export type Modal =
	'PICK_MODULE' 
	| NodeControls;

export const PICK_MODULE = 'PICK_MODULE';

export const NODE_CONTROLS: (nodeKey: string) => NodeControls =
	(nodeKey: string) => ({ [typeKey]: 'NODE_CONTROLS', nodeKey });

export function isNodeControls(modal: Modal): modal is NodeControls {
	return modal[typeKey] != null && modal[typeKey] === 'NODE_CONTROLS';
}

