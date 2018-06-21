import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { throttle } from 'lodash';
import * as Graph from '@davidisaaclee/graph';
import { Table, Props as TableProps } from '@davidisaaclee/react-table';
import { SimpleVideoGraph } from '../../../model/SimpleVideoGraph';
import * as Kit from '../../../model/Kit';
import * as App from '../../../modules/app';
import { State as RootState } from '../../../modules';
import * as GraphModule from '../../../modules/graph';
import * as selectors from './selectors';
import { Lane, Connection } from './types';

const e = React.createElement;

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
}

interface OwnProps extends Partial<TableProps> {}

type Props = OwnProps & StateProps & DispatchProps;

interface State {}

class BusRouter extends React.Component<Props, State> {

	public render() {
		const {
			graph, connections, busCount, lanes,
			setInletConnection, setOutletConnection,
			openNodeControls, setParameter,
			...restProps
		} = this.props;
		return e(Table, {
			...restProps,
			rowCount: lanes.length,
			columnCount: busCount,

			renderRowHeaderContent: (index: number) => e(
				'div',
				{
					style: this.styleForLane(index)
				},
				(lane => {
					if (lane.type === 'inlet') {
						const node = Graph.nodeForKey(graph, lane.nodeKey)!;
						const videoModule = Kit.modules[node.type];
						const hasAssociatedParametersForInlet =
							videoModule.inlets != null 
							&& videoModule.inlets.associatedParameters != null
							&& videoModule.inlets.associatedParameters[lane.inletKey] != null;

						const associatedParameters = hasAssociatedParametersForInlet
							? videoModule.inlets!.associatedParameters![lane.inletKey]
							: [];
						return e('div',
							{},
							lane.inletKey,
							associatedParameters.map(paramKey => (
								e('input',
									{
										key: `${lane.nodeKey}-${paramKey}`,
										type: 'range',
										min: 0,
										max: 1,
										step: 'any',
										value: node.parameters[paramKey],
										onChange: throttle((evt: React.SyntheticEvent<HTMLInputElement>) => (
											setParameter(lane.nodeKey, paramKey, parseFloat(evt.currentTarget.value))
										), 1000 / 60),
									})
							)));
					}

					return e('button',
						{
							onClick: () => openNodeControls(lanes[index].nodeKey)
						},
						lanes[index].name);
				})(lanes[index]),
			),
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

				const lane = lanes[laneIndex];

				if (connection == null) {
					return e('div',
						{
							style: {
								...this.styleForLane(laneIndex),
								whiteSpace: 'pre-wrap',
							},
							onClick: (lane.type === 'inlet'
								? () => setInletConnection(lane.nodeKey, lane.inletKey, busIndex)
								: () => setOutletConnection(lane.nodeKey, busIndex))
						},
						' ');
				} else {
					return e('div',
						{
							style: {
								...this.styleForLane(laneIndex),
								whiteSpace: 'pre-wrap',
							},
							// TODO: Be more explicit about removing edges behavior
							onClick: (lane.type === 'inlet'
								? () => setInletConnection(lane.nodeKey, lane.inletKey, -1)
								: () => setOutletConnection(lane.nodeKey, -2))
						},
						e('div',
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
				}
			},

			renderRowContainer: this.RowContainer,
			renderCellContainer: this.CellContainer,
		});
	}

	// TODO: be safer
	private styleForLane(laneIndex: number): object {
		const isInlet = this.props.lanes[laneIndex].type === 'inlet';
		return isInlet
		? {}
		: {
			backgroundColor: 'black',
			color: 'white',
		};
	}

	private RowContainer: React.StatelessComponent<{ rowIndex: number }> = ({ rowIndex, children }) => {
		if (rowIndex < 0) {
			// header
			return e('tr',
				{
					style: {
						backgroundColor: 'white'
					}
				},
				children)
		}

		const lane = this.props.lanes[rowIndex];
		return e('tr',
			{
				style: {
					backgroundColor: (lane.type === 'inlet'
						? 'white'
						: 'black')
				}
			},
			children);
	}

	private CellContainer: React.StatelessComponent<{ rowIndex: number, columnIndex: number }> = ({ rowIndex, columnIndex, children }) => (
		e('td', {}, children)
	)

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
			dispatch(App.actions.setModal(App.Modals.NODE_CONTROLS(nodeKey)))
		),

		setParameter: (nodeKey: string, paramKey: string, value: number) => (
			dispatch(GraphModule.actions.setParameter(nodeKey, paramKey, value))
		)
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(BusRouter);

