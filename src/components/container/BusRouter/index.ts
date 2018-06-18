import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Table, Props as TableProps } from '@davidisaaclee/react-table';
import { SimpleVideoGraph } from '../../../model/SimpleVideoGraph';
import * as App from '../../../modules/app';
import { State as RootState } from '../../../modules';
import * as GraphModule from '../../../modules/graph';
import * as selectors from './selectors';
import { Lane, Connection } from './types';
import './style.css';

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
}

interface OwnProps extends Partial<TableProps> {}

type Props = OwnProps & StateProps & DispatchProps;

interface State {}

/*
function connectionEqual(c1: Connection, c2: Connection): boolean {
	return c1.busIndex === c2.busIndex && c1.laneIndex === c2.laneIndex;
}
*/

class BusRouter extends React.Component<Props, State> {

	public render() {
		const {
			graph, connections, busCount, lanes,
			setInletConnection, setOutletConnection,
			openNodeControls,
			...restProps
		} = this.props;
		return e(Table, {
			...restProps,
			rowCount: lanes.length,
			columnCount: busCount,

			renderRowHeader: (index: number) => e(
				'div',
				{
					style: this.styleForLane(index)
				},
				e('button',
					{
						onClick: () => openNodeControls(lanes[index].nodeKey)
					},
					lanes[index].name)),
			renderColumnHeader: (index: number) => e(
				'div',
				{
					style: {
						minWidth: 30,
					}
				},
				index),

			renderCell: (laneIndex: number, busIndex: number) => {
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
								: () => setOutletConnection(lane.nodeKey, -1))
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
			}
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

		openNodeControls: (nodeKey) => dispatch(App.actions.setModal(App.Modals.NODE_CONTROLS(nodeKey))),
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(BusRouter);

