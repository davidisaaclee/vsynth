interface PickModule {
	type: 'PICK_MODULE';
}

interface SaveLoad {
	type: 'SAVE_LOAD';
}

export type Modal =
	PickModule | SaveLoad;

export const pickModule: PickModule =
	{ type: 'PICK_MODULE' };

export const saveLoad: SaveLoad =
	{ type: 'SAVE_LOAD' };

