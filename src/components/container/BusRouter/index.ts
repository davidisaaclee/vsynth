import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { throttle } from 'lodash';
import * as classNames from 'classnames';
import * as Graph from '@davidisaaclee/graph';
import { Table, Props as TableProps } from '@davidisaaclee/react-table';
import styled from '../../../styled-components';
import { SimpleVideoGraph } from '../../../model/SimpleVideoGraph';
import * as Kit from '../../../model/Kit';
import * as App from '../../../modules/app';
import { State as RootState } from '../../../modules';
import * as GraphModule from '../../../modules/graph';
import ParameterControl from '../../presentational/ParameterControl';
import {
	defaultConstantBusIndex, nullSendBusIndex, fps
} from '../../../constants';
import * as selectors from './selectors';
import { Lane, Connection } from './types';
import './style.css';

const e = React.createElement;

function isSpaceKeyEvent<E extends HTMLElement>(keyEvent: React.KeyboardEvent<E>): boolean {
	return keyEvent.keyCode === 32;
}

function isEnterKeyEvent<E extends HTMLElement>(keyEvent: React.KeyboardEvent<E>): boolean {
	return keyEvent.keyCode === 13;
}

const css = {
	classNames: {
		lane: 'router-lane',
		row: 'router-row',
		columnHeader: 'router-column-header',
		cell: 'router-cell',
	},
	data: {
		laneType: {
			key: 'data-lane-type',
			values: {
				inlet: 'inlet',
				outlet: 'outlet',
			}
		},
	}
};

const StyledTable = styled(Table)`
	user-select: none;
`;

const HamburgerMenuButton = styled.button`
	background: none;
	border: none;
	color: white;

	width: 100%;
	height: 30px;
`;

interface StateProps {
	graph: SimpleVideoGraph;
	connections: Connection[];
	busCount: number;
	lanes: Lane[];
}

interface DispatchProps {
	setInletConnection: (nodeKey: string, inletKey: string, busIndex: number) => any;
	setOutletConnection: (nodeKey: string, busIndex: number) => any;
	openNodeControls: (nodeKey: string) => any;
	setParameter: (nodeKey: string, paramKey: string, value: number) => any;
	previewParameter: (nodeKey: string, paramKey: string, value: number) => any;
	removeNode: (nodeKey: string) => any;
	openMainMenu: () => any;
}

interface OwnProps extends Partial<TableProps> {}

type Props = OwnProps & StateProps & DispatchProps;

interface State {}

class BusRouter extends React.Component<Props, State> {

	private RowContainer: React.StatelessComponent<{ rowIndex: number }> = (
		({ rowIndex, children }) => {
			return e('tr',
				{
					className: classNames(
						css.classNames.row,
						{
							[css.classNames.lane]: rowIndex >= 0,
							[css.classNames.columnHeader]: rowIndex < 0,
						}
					),
				},
				children);
		}
	)

	private CellContainer: React.StatelessComponent<{ rowIndex: number, columnIndex: number }> = (
		({ rowIndex, columnIndex, children }) => {
			const {
				lanes, connections,
				setInletConnection, setOutletConnection,
			} = this.props;

			if (rowIndex < 0 && columnIndex < 0) {
				return e('th',
					{},
					e(HamburgerMenuButton,
						{ onClick: this.props.openMainMenu },
						'menu'));
			}

			if (rowIndex < 0) {
				// column header
				return e('th',
					{
						className: css.classNames.cell,
					},
					children);
			}

			const lane = lanes[rowIndex];
			if (columnIndex < 0) {
				// row header
				return e('th',
					{
						className: css.classNames.cell,
						[css.data.laneType.key]: (lane.type === 'inlet'
							? css.data.laneType.values.inlet
							: css.data.laneType.values.outlet),
					},
					children);
			}

			const laneIndex = rowIndex;
			const busIndex = columnIndex;

			const connection =
				connections.find(c => (
					c.busIndex === busIndex
					&& laneIndex === c.laneIndex
				));

			const toggleCell = lane.type === 'inlet'
				? () => setInletConnection(
					lane.nodeKey,
					lane.inletKey,
					(connection == null
						? busIndex
						: defaultConstantBusIndex))
				: () => setOutletConnection(
					lane.nodeKey,
					(connection == null
						? busIndex
						: nullSendBusIndex));

			return e('td',
				{
					className: css.classNames.cell,
					[css.data.laneType.key]: (lane.type === 'inlet'
						? css.data.laneType.values.inlet
						: css.data.laneType.values.outlet),
					tabIndex: 0,
					onClick: toggleCell,
					onKeyDown: evt => {
						if (isSpaceKeyEvent(evt) || isEnterKeyEvent(evt)) {
							toggleCell();
						}
					}
				},
				children);
		}
	)

	public render() {
		const {
			graph, connections, busCount, lanes,
			setInletConnection, setOutletConnection,
			openNodeControls, setParameter, previewParameter,
			removeNode, openMainMenu,
			...restProps
		} = this.props;
		return e(StyledTable, {
			...restProps,
			rowCount: lanes.length,
			columnCount: busCount,

			renderRowHeaderContent: (index: number) => (lane => {
				if (lane.type === 'inlet') {
					const node = Graph.nodeForKey(graph, lane.nodeKey)!;
					const videoModule = Kit.moduleForNode(node);
					const associatedParameters = videoModule.inlets.associatedParameters[lane.inletKey] != null
						? videoModule.inlets.associatedParameters[lane.inletKey]
						: [];

					if (associatedParameters.length === 0) {
						return lane.inletKey;
					}

					return associatedParameters.map(paramKey => (
						e(ParameterControl,
							{
								key: lane.inletKey,
								name: lane.inletKey,
								value: node.parameters[paramKey],
								onInputValue: throttle(value => (
									previewParameter(lane.nodeKey, paramKey, value)
								), 1000 / fps),
								onChangeValue: throttle(value => (
									setParameter(lane.nodeKey, paramKey, value)
								), 1000 / fps),
								style: {
									height: 20,
								}
							})));
				}

				return e('span',
					{},
					e('button',
						{
							onClick: () => openNodeControls(lane.nodeKey),
						},
						lanes[index].name),
					e('button',
						{
							onClick: () => removeNode(lane.nodeKey),
						},
						'x'));
			})(lanes[index]),

			renderColumnHeaderContent: (index: number) => e(
				'div',
				{
					style: {
						minWidth: 30,
					}
				},
				index),

			renderCellContent: (laneIndex: number, busIndex: number) => {
				const connection =
					connections.find(c => (
						c.busIndex === busIndex
						&& laneIndex === c.laneIndex
					));

				return e('div',
					{
						style: {
							whiteSpace: 'pre-wrap',
						},
					},
					connection == null
					? ' '
					: e('div',
						{
							style: {
								backgroundColor: lanes[laneIndex].type === 'inlet'
								? 'black'
								: 'white',
								width: 10,
								height: 10,
								display: 'block',
								margin: '0 auto',
							}
						}));
			},

			renderRowContainer: this.RowContainer,
			renderCellContainer: this.CellContainer,
		});
	}

}

function mapStateToProps(state: RootState): StateProps {
	return {
		graph: selectors.graph(state),
		busCount: selectors.busCount(state),
		connections: selectors.connections(state),
		lanes: selectors.lanes(state),
	};
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {
		setInletConnection: (nodeKey: string, inletKey: string, busIndex: number) => (
			dispatch(GraphModule.actions.setInletConnection(nodeKey, inletKey, busIndex))
		),

		setOutletConnection: (nodeKey: string, busIndex: number) => (
			dispatch(GraphModule.actions.setOutletConnection(nodeKey, busIndex))
		),

		openNodeControls: (nodeKey) => (
			dispatch(App.actions.setModal(App.Modals.nodeControls(nodeKey)))
		),

		setParameter: (nodeKey: string, paramKey: string, value: number) => (
			dispatch(GraphModule.actions.setParameter(nodeKey, paramKey, value))
		),

		previewParameter: (nodeKey: string, paramKey: string, value: number) => (
			dispatch(GraphModule.actions.previewParameter(nodeKey, paramKey, value))
		),

		removeNode: (nodeKey: string) => (
			dispatch(GraphModule.actions.removeNode(nodeKey))
		),

		openMainMenu: () => (
			dispatch(App.actions.setModal(App.Modals.mainMenu))
		)
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(BusRouter);

