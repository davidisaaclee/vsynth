export type Modal =
	{ type: 'PICK_MODULE' }
	| { type: 'NODE_CONTROLS', nodeKey: string };

export const pickModule: Modal =
	{ type: 'PICK_MODULE' };
export const nodeControls =
	(nodeKey: string): Modal => ({
		type: 'NODE_CONTROLS',
		nodeKey
	});

