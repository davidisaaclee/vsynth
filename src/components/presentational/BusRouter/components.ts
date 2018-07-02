import { range, includes, isEqual, pick } from 'lodash';
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
	laneIndex: number;
	busCount: number;
	// array of bus indices
	connections: number[];

	setConnection: (laneIndex: number, busIndex: number) => any;
	removeConnection: (laneIndex: number, busIndex: number) => any;
	setParameter: (laneIndex: number, value: number) => any;
	previewParameter: (laneIndex: number, value: number) => any;
	removeNodeForLane: (laneIndex: number) => any;
}

export class LaneView extends React.Component<LaneProps, any> {
	public shouldComponentUpdate(nextProps: LaneProps) {
		// Only update if non-dispatch props have changed.
		// This is helpful to prevent many lanes updating in response to a single
		// parameter change.
		const pickStateProps =
			(props: LaneProps) => pick(props, ['lane', 'busCount', 'connections']);
		return !isEqual(pickStateProps(nextProps), pickStateProps(this.props));
	}

	public render() {
		const {
			lane, laneIndex, busCount, connections,
			setConnection, removeConnection,
			setParameter, previewParameter,
			removeNodeForLane,
		} = this.props;
		return e(LaneRow,
			{ key: `lane-${lane.nodeKey}.${lane.name}` },
			// Lane header
			e(LaneHeader, {},
				...(lane.type === 'outlet'
					? [
						lane.name,
						e('button',
							{ onClick: () => removeNodeForLane(laneIndex) },
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
										value: scale,
										onInputValue: (value: number) => previewParameter(laneIndex, value),
										onChangeValue: (value: number) => setParameter(laneIndex, value),
									}));
						})()
					])),

			// Connection cells
			range(busCount).map(busIndex => {
				const hasConnection =
					includes(connections, busIndex);
				const clickHandler = hasConnection
					? () => removeConnection(laneIndex, busIndex)
					: () => setConnection(laneIndex, busIndex);

				return e('td',
					{
						key: `${lane.nodeKey}.bus-${busIndex}`,
						onClick: clickHandler
					},
					hasConnection ? 'x' : 'o');
			}));
	}
}

