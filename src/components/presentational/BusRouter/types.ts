import { Inlet } from '../../../model/Inlet';
import { Outlet } from '../../../model/Outlet';

export type Lane = { name: string }
	& (
		({ type: 'inlet' } & Inlet)
		| ({ type: 'outlet' } & Outlet)
	);

export interface Connection {
	busIndex: number;
	laneIndex: number;
}



