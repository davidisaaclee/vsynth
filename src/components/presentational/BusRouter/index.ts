import { range } from 'lodash';
import * as React from 'react';
import { Connection, Lane } from './types';
import { LaneView, BusHeader, RouterTable } from './components';

const e = React.createElement;

export interface Props {
	className?: string;

	busCount: number;
	// TODO: Could be good to make these dictionaries?
	// idk how that optimization works
	lanes: Lane[];
	connections: Connection[];
	isRouterCollapsed: boolean;

	setConnection: (laneIndex: number, busIndex: number) => any;
	removeConnection: (laneIndex: number, busIndex: number) => any;
	setParameter: (laneIndex: number, value: number) => any;
	previewParameter: (laneIndex: number, value: number) => any;
	removeNodeForLane: (laneIndex: number) => any;
	toggleCollapseRouter: () => any;
}

const BusRouter: React.StatelessComponent<Props> = ({
	className, busCount,
	lanes, connections,
	setConnection, removeConnection,
	setParameter, previewParameter,
	removeNodeForLane, toggleCollapseRouter,
}) => (
	e(RouterTable,
		{ className },
		e('thead',
			{},
			e('tr',
				{},
				// Cross-axis header
				e('th', {}, e('button', { onClick: toggleCollapseRouter }, 'Collapse')),
				range(busCount).map(busIndex =>
					// Bus header
					e(BusHeader,
						{ key: `bus-header-${busIndex}` },
						// TODO: Make this indexing more explicit.
						// Currently showing 1-indexed busses in UI, and storing as 0-indexed.
						busIndex + 1)))),
		e('tbody',
			{},
			lanes.map((lane, laneIndex) =>
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
				})))));

export default BusRouter;
