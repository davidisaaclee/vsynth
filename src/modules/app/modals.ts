export type Modal =
	{ type: 'PICK_MODULE' }
	| { type: 'MAIN_MENU' }
	| { type: 'NODE_CONTROLS', nodeKey: string };

export const pickModule: Modal =
	{ type: 'PICK_MODULE' };
export const mainMenu: Modal =
	{ type: 'MAIN_MENU' };
export const nodeControls =
	(nodeKey: string): Modal => ({
		type: 'NODE_CONTROLS',
		nodeKey
	});

