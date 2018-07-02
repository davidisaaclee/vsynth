import { range } from 'lodash';
import * as React from 'react';
import { Connection, Lane } from './types';
import { LaneView } from './components';

const e = React.createElement;

export interface Props {
	busCount: number;
	// TODO: Could be good to make these dictionaries?
	// idk how that optimization works
	lanes: Lane[];
	connections: Connection[];

	setInletConnection: (nodeKey: string, inletKey: string, busIndex: number) => any;
	setOutletConnection: (nodeKey: string, busIndex: number) => any;
	removeInletConnection: (nodeKey: string, inletKey: string, busIndex: number) => any;
	removeOutletConnection: (nodeKey: string, busIndex: number) => any;
	setParameter: (nodeKey: string, paramKey: string, value: number) => any;
	previewParameter: (nodeKey: string, paramKey: string, value: number) => any;
	removeNode: (nodeKey: string) => any;
}

const BusRouter: React.StatelessComponent<Props> = ({
	busCount,
	lanes, connections,
	setInletConnection, setOutletConnection,
	removeInletConnection, removeOutletConnection,
	setParameter, previewParameter,
	removeNode,
}) => (
	e('table',
		{},
		e('thead',
			{},
			e('tr',
				{},
				// Cross-axis header
				e('th', {}, null),
				range(busCount).map(busIndex => (
					// Bus header
					e('th', { key: `bus-header-${busIndex}` }, busIndex)
				)))),
		e('tbody',
			{},
			lanes.map((lane, laneIndex) => (
				e(LaneView, {
					lane,
					busCount,
					connections: (connections
						.filter(c => c.laneIndex === laneIndex)
						.map(c => c.busIndex)),
					setParameter,
					previewParameter,
					setInletConnection,
					setOutletConnection,
					removeInletConnection,
					removeOutletConnection,
					removeNode,
				})
			)))));

export default BusRouter;
