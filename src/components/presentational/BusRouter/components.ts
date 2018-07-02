import { range, includes } from 'lodash';
import * as React from 'react';
import styled from '../../../styled-components';
import ParameterControl from '../ParameterControl';
import { Lane } from './types';

const e = React.createElement;

const LaneRow = styled.tr`
	height: 30px;
`;

const LaneHeader = styled.th`
	position: relative;

	padding: 5px;
	width: 80px;

	text-align: right;
`;

const StyledParameterControl = styled(ParameterControl)`
	height: 20px;
`;

interface LaneProps {
	lane: Lane;
	busCount: number;
	// array of bus indices
	connections: number[];

	setParameter: (nodeKey: string, paramKey: string, value: number) => any;
	previewParameter: (nodeKey: string, paramKey: string, value: number) => any;
	setInletConnection: (nodeKey: string, inletKey: string, busIndex: number) => any;
	setOutletConnection: (nodeKey: string, busIndex: number) => any;
	removeInletConnection: (nodeKey: string, inletKey: string, busIndex: number) => any;
	removeOutletConnection: (nodeKey: string, busIndex: number) => any;
	removeNode: (nodeKey: string) => any;
}

export const LaneView: React.StatelessComponent<LaneProps> = ({
	lane, busCount, connections,
	setInletConnection, setOutletConnection,
	removeInletConnection, removeOutletConnection,
	setParameter, previewParameter,
	removeNode,
}) => (
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
						const scale = lane.scale;

						return (scale == null
							? lane.inletKey
							: e(StyledParameterControl,
								{
									key: `${lane.nodeKey}.${lane.inletKey}`,
									name: lane.inletKey,
									value: scale.value,
									onInputValue: (value: number) => previewParameter(lane.nodeKey, scale.key, value),
									onChangeValue: (value: number) => setParameter(lane.nodeKey, scale.key, value),
								}));
					})()
				])),

		// Connection cells
		range(busCount).map(busIndex => {
			const hasConnection =
				includes(connections, busIndex);
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
		}))
);

