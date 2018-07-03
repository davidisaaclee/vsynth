import { range, includes, isEqual, pick } from 'lodash';
import * as React from 'react';
import styled, { css } from '../../../styled-components';
import ParameterControl from '../ParameterControl';
import { Lane } from './types';
import { isEnterKeyEvent, isSpaceKeyEvent } from '../../../utility/keys';

const e = React.createElement;

const pinstripes = css`
	background-color: rgba(255, 255, 255, 0.5);
	&:nth-child(even) {
		background-color: rgba(255, 255, 255, 0.75);
	}
`;

export const RouterTable = styled.table`
	user-select: none;
`;

const Cell = styled.td<{ type: 'inlet' | 'outlet' }>`
	width: 30px;
	white-space: prewrap;

	&:focus {
		outline: 1px solid white;
	}

	${({ type }) => type === 'inlet' && pinstripes}
`;

const CellCheckmark = styled.div<{ type: 'inlet' | 'outlet' }>`
	display: block;
	width: 10px;
	height: 10px;

	margin: 0 auto;

	${({ type }) => css`
		background-color: ${type === 'inlet' ? 'black' : 'white'};
	`}
`;

const LaneRow = styled.tr<{ type: 'inlet' | 'outlet' }>`
	height: 30px;

	${({ type }) => css`
		background-color: ${type === 'inlet'
				? 'rgba(255, 255, 255, 0.5)' 
				: 'rgba(0, 0, 0, 0.75)'};
		color: ${type === 'inlet' ? 'black' : 'white'};
	`}
`;

const LaneHeader = styled.th`
	position: relative;

	text-align: right;
	padding: 5px;
	width: 80px;

	font-size: 12px;
`;

const LaneHeaderText = styled.span`
	margin: 0 1em;
`;

const RemoveNodeButton = styled.button`
	box-sizing: border-box;
	border: 1px solid white;

	background: none;
	color: white;
	white-space: nowrap;
`;

const StyledParameterControl = styled(ParameterControl)`
	height: 20px;
`;

export const BusHeader = styled.th`
	min-width: 30px;

	${pinstripes}
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
			{
				key: `lane-${lane.nodeKey}.${lane.name}`,
				type: lane.type
			},
			// Lane header
			e(LaneHeader, {},
				...(lane.type === 'outlet'
					? [
						e(LaneHeaderText, {}, lane.name),
						e(RemoveNodeButton,
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
				const toggleCell = hasConnection
					? () => removeConnection(laneIndex, busIndex)
					: () => setConnection(laneIndex, busIndex);

				return e(Cell,
					{
						key: `${lane.nodeKey}.bus-${busIndex}`,
						type: lane.type,
						tabIndex: 0,
						onClick: toggleCell,
						onKeyDown: (evt: React.KeyboardEvent<HTMLElement>) => {
							if (isEnterKeyEvent(evt) || isSpaceKeyEvent(evt)) {
								toggleCell();
								evt.preventDefault();
							}
						}
					},
					hasConnection ? e(CellCheckmark, { type: lane.type }) : ' ');
			}));
	}
}

