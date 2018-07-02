import { isEqual, range } from 'lodash';
import * as React from 'react';
import { SimpleVideoGraph } from '../../../model/SimpleVideoGraph';
import { Connection, Lane } from './types';

const e = React.createElement;

interface Props {
	graph: SimpleVideoGraph;
	busCount: number;
	// TODO: Could be good to make these dictionaries?
	// idk how that optimization works
	lanes: Lane[];
	connections: Connection[];
}

function connectionsContains(connection: Connection, connections: Connection[]) {
	return connections.findIndex(c => isEqual(c, connection)) !== -1;
}

const BusRouter: React.StatelessComponent<Props> = ({
	graph, busCount,
	lanes, connections,
}) => (
	e('table',
		{},
		e('thead',
			{},
			// Cross-axis header
			e('td', {}, null),
			range(busCount).map(busIndex => (
				// Bus header
				e('th', { key: `bus-header-${busIndex}` }, busIndex)
			))),
		e('tbody',
			{},
			lanes.map((lane, laneIndex) => (
				e('tr',
					{ key: `lane-${lane.nodeKey}.${lane.name}` },
					// Lane header
					e('th', {}, lane.name),
					range(busCount).map(busIndex => (
						connectionsContains({ busIndex, laneIndex }, connections)
						? e('td', {}, 'x')
						: e('td', {}, 'o')
					)))
			)))));

export default BusRouter;
