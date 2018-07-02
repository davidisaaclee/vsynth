import { Inlet } from '../../../model/Inlet';
import { Outlet } from '../../../model/Outlet';

export type Lane = { name: string }
	& (
		// `scale` is the value of the associated parameter
		({ type: 'inlet', scale: { value: number } | null } & Inlet)
		| ({ type: 'outlet' } & Outlet)
	);

export interface Connection {
	busIndex: number;
	laneIndex: number;
}

