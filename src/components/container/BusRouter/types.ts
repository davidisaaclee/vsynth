

export type Lane = { name: string }
	& (
		({ type: 'inlet' } & Inlet)
		| ({ type: 'outlet' } & Outlet)
	);

export interface Inlet {
	nodeKey: string;
	inletKey: string;
}

export interface Outlet {
	nodeKey: string;
}

export interface Connection {
	busIndex: number;
	laneIndex: number;
}



