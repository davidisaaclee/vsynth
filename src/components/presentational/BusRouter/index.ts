import { isEqual, range } from 'lodash';
import * as React from 'react';
import * as Graph from '@davidisaaclee/graph';
import { SimpleVideoGraph } from '../../../model/SimpleVideoGraph';
import * as Kit from '../../../model/Kit';
import { Connection, Lane } from './types';
import { LaneHeader, LaneRow, StyledParameterControl } from './components';

const e = React.createElement;

export interface Props {
	graph: SimpleVideoGraph;
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

function connectionsContains(connection: Connection, connections: Connection[]) {
	return connections.findIndex(c => isEqual(c, connection)) !== -1;
}

const BusRouter: React.StatelessComponent<Props> = ({
	graph, busCount,
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
				e(LaneRow,
					{ key: `lane-${lane.nodeKey}.${lane.name}` },
					// Lane header
					e(LaneHeader, {},
						...(lane.type === 'outlet'
							? [
								lane.name,
								e('button',
									{ onClick: () => removeNode(lane.nodeKey) },
									'x')
							]
							: [
								(() => {
									const node = Graph.nodeForKey(graph, lane.nodeKey)!;
									const mod = Kit.moduleForNode(node);
									const associatedParameter = 
										mod.inlets.associatedParameters[lane.inletKey];
									return (associatedParameter == null
										? lane.inletKey
										: e(StyledParameterControl,
											{
												key: `${lane.nodeKey}.${associatedParameter}`,
												name: lane.inletKey,
												value: node.parameters[associatedParameter],
												onInputValue: (value: number) => previewParameter(lane.nodeKey, associatedParameter, value),
												onChangeValue: (value: number) => setParameter(lane.nodeKey, associatedParameter, value),
											}));
								})()
							])),

					// Connection cells
					range(busCount).map(busIndex => {
						const hasConnection =
							connectionsContains({ busIndex, laneIndex }, connections);
						const clickHandler = 
							(hasConnection
								? (lane.type === 'inlet'
									? () => removeInletConnection(lane.nodeKey, lane.inletKey, busIndex)
									: () => removeOutletConnection(lane.nodeKey, busIndex))
								: (lane.type === 'inlet'
									? () => setInletConnection(lane.nodeKey, lane.inletKey, busIndex)
									: () => setOutletConnection(lane.nodeKey, busIndex)));

						return e('td',
							{
								key: `${lane.nodeKey}.bus-${busIndex}`,
								onClick: clickHandler
							},
							hasConnection ? 'x' : 'o');
					})))))));

export default BusRouter;
