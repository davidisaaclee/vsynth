import { range, } from 'lodash';
import * as React from 'react';
import styled from '../../../styled-components';
import { Lane, Connection } from './types';

const e = React.createElement;

/*
const pinstripes = css`
	background-color: rgba(255, 255, 255, 0.5);
	&:nth-child(even) {
		background-color: rgba(255, 255, 255, 0.75);
	}
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
	position: sticky;
	left: 0;

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

/*
export const BusHeader = styled.th`
	min-width: 30px;

	position: sticky;
	top: 0;

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
							{ onClick: this.removeNode },
							'x')
					]
					: [
						(lane.scale == null
							? lane.inletKey
							: e(StyledParameterControl,
								{
									key: `${lane.nodeKey}.${lane.inletKey}`,
									name: lane.inletKey,
									value: lane.scale,
									onInputValue: this.onInputValue,
									onChangeValue: this.onChangeValue,
								}))
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

	private removeNode = () => this.props.removeNodeForLane(this.props.laneIndex)

	private onInputValue = (value: number) => this.props.previewParameter(this.props.laneIndex, value)

	private onChangeValue = (value: number) => this.props.setParameter(this.props.laneIndex, value)
}
*/


export const RouterTable = styled.span`
	display: inline-flex;

	user-select: none;

	& * {
		border: 1px solid white;
		box-sizing: border-box;
	}
`;

const BusHeader = styled.div`
	width: 20px;
	height: 20px;
`;

interface BusHeadersProps extends React.HTMLAttributes<HTMLDivElement> {
	busCount: number;
	laneHeight: number;
	busWidth: number;
}

const _BusHeaders: React.StatelessComponent<BusHeadersProps> = ({ busCount, busWidth, laneHeight, ...restProps }) =>
	e('span',
		restProps,
		range(busCount).map(busIndex =>
			e(BusHeader,
				{
					key: busIndex,
					style: {
						height: laneHeight,
						width: busWidth,
					}
				},
				busIndex)));

const BusHeaders = styled(_BusHeaders)`
	display: flex;
	flex-flow: row nowrap;
`;



interface OutletHeaderProps extends React.HTMLAttributes<HTMLSpanElement> {
	name: string;
}
const OutletHeader: React.StatelessComponent<OutletHeaderProps> = ({ name, ...restProps }) =>
	e('span', restProps, name);


interface InletHeaderProps extends React.HTMLAttributes<HTMLSpanElement> {
	name: string;
	scale: number | null;
}
const InletHeader: React.StatelessComponent<InletHeaderProps> = ({ name, scale, ...restProps }) =>
	scale == null
		? e('span', restProps, name)
		: e(ScaledInletHeader, { name, scale, ...restProps });


interface ScaledInletHeaderProps extends React.HTMLAttributes<HTMLSpanElement> {
	name: string;
	scale: number;
}
const ScaledInletHeader: React.StatelessComponent<ScaledInletHeaderProps> = ({ name, scale, ...restProps }) =>
	e('span', restProps,
		e('span', {}, name),
		e('span', {}, scale));



interface LaneHeaderProps extends React.HTMLAttributes<HTMLSpanElement> {
	lane: Lane;
}

const _LaneHeader: React.StatelessComponent<LaneHeaderProps> = ({ lane, ...restProps }) => {
	if (lane.type === 'inlet') {
		return e(InletHeader, { name: lane.inletKey, scale: lane.scale, ...restProps });
	} else {
		return e(OutletHeader, { name: lane.name, ...restProps });
	}
}

const LaneHeader = styled(_LaneHeader)`
	display: block;
`;


const CrossAxisHeader = styled.div<{ height: number }>`
	height: ${({ height }) => height}px;
`;


interface LaneHeadersProps extends React.HTMLAttributes<HTMLDivElement> {
	lanes: Lane[];
	laneHeight: number;
}

const _LaneHeaders: React.StatelessComponent<LaneHeadersProps> = ({ lanes, laneHeight, ...restProps}) =>
	e('div',
		restProps,
		e(CrossAxisHeader, { height: laneHeight }),
		lanes.map(lane =>
			e(LaneHeader,
				{
					key: `${lane.nodeKey}.${lane.name}`,
					lane,
					style: {
						height: laneHeight,
					}
				})));

export const LaneHeaders = styled(_LaneHeaders)`
	display: inline-block;
`;


const Row = styled.tr<{ height: number }>`
	height: ${({ height }) => height}px;
`;

const BusHeaderRow = Row;

interface MatrixProps {
	connections: Connection[];
	lanes: Lane[];
	busCount: number;
	laneHeight: number;
	busWidth: number;
}
export const Matrix: React.StatelessComponent<MatrixProps> = ({
	connections, lanes, busCount, laneHeight, busWidth
}) =>
	e('table',
		{
			style: {
				borderSpacing: 0,
			}
		},
		e('thead',
			{},
			e(BusHeaderRow,
				{ height: laneHeight },
				e(BusHeaders, { busCount, laneHeight, busWidth }))),
		e('tbody',
			{},
			lanes.map(lane =>
				e(Row,
					{ height: laneHeight },
					range(busCount).map(busIndex =>
						e('span', { style: { display: 'inline-block', width: busWidth } }, 'x'))))));

