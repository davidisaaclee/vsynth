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

	setConnection: (laneIndex: number, busIndex: number) => any;
	removeConnection: (laneIndex: number, busIndex: number) => any;
	setParameter: (laneIndex: number, value: number) => any;
	previewParameter: (laneIndex: number, value: number) => any;
	removeNodeForLane: (laneIndex: number) => any;
}

const BusRouter: React.StatelessComponent<Props> = ({
	busCount,
	lanes, connections,
	setConnection, removeConnection,
	setParameter, previewParameter,
	removeNodeForLane,
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
					key: `${lane.nodeKey}.${lane.name}`,
					lane,
					laneIndex,
					busCount,
					connections: (connections
						.filter(c => c.laneIndex === laneIndex)
						.map(c => c.busIndex)),
					setParameter,
					previewParameter,
					setConnection,
					removeConnection,
					removeNodeForLane,
				})
			)))));

export default BusRouter;
