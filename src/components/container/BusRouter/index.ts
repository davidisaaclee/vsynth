import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Table, Props as TableProps } from '@davidisaaclee/react-table';
import { SimpleVideoGraph } from '../../../model/SimpleVideoGraph';
import * as App from '../../../modules/app';
import { State as RootState } from '../../../modules';
import * as GraphModule from '../../../modules/graph';
import * as selectors from './selectors';
import { Lane, Inlet, Outlet, Connection } from './types';
import './style.css';

const e = React.createElement;

interface StateProps {
	graph: SimpleVideoGraph;
	connections: Connection[];
	busCount: number;
	lanes: Lane[];
}

interface DispatchProps {
	insertConnections: (connections: Array<{ outlet: Outlet, inlet: Inlet }>) => any;
	removeConnections: (connections: Array<{ outlet: Outlet, inlet: Inlet }>) => any;
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
			insertConnections, removeConnections,
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

				if (connection == null) {
					return e('div',
						{
							style: {
								...this.styleForLane(laneIndex),
								whiteSpace: 'pre-wrap',
							},
							onClick: () => this.addConnection({ laneIndex, busIndex }),
						},
						' ');
				} else {
					return e('div',
						{
							style: {
								...this.styleForLane(laneIndex),
								whiteSpace: 'pre-wrap',
							},
							onClick: () => this.removeConnection({ laneIndex, busIndex }),
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

	private addConnection(connection: Connection) {
		return;
		/*
		if (this.state.connections.find(c => connectionEqual(connection, c)) != null) {
			// Connection already exists.
			return;
		}
		
		const connections =
			[...this.props.connections, connection];
		this.setState({ connections }, () => {
			this.props.insertConnections(this.connectionsInBus(connection.busIndex));
		});
	*/
	}

	private removeConnection(connection: Connection) {
		return;

		/*
		const indexOfConnection =
			this.props.connections.findIndex(c => connectionEqual(connection, c));
		if (indexOfConnection === -1) {
			// No such connection
			return;
		}

		const oldConnectionsInBus =
			this.connectionsInBus(connection.busIndex);

		const connectionsCopy =
			this.props.connections.slice();
		connectionsCopy.splice(indexOfConnection, 1);

		this.setState({
			connections: connectionsCopy
		}, () => {
			const newConnectionsInBus =
				this.connectionsInBus(connection.busIndex);

			function isIOConnectionEqual(
				c1: { inlet: Inlet, outlet: Outlet },
				c2: { inlet: Inlet, outlet: Outlet }
			): boolean {
				return c1.inlet.inletKey === c2.inlet.inletKey
					&& c1.inlet.nodeKey === c2.inlet.nodeKey
					&& c1.outlet.nodeKey === c2.outlet.nodeKey;
			}
			const removedConnections = oldConnectionsInBus
				.filter(c1 => newConnectionsInBus.find(c2 => isIOConnectionEqual(c1, c2)) == null);
			this.props.removeConnections(removedConnections);

			// Some of the connections in the bus or lane might have
			// been previously overridden by one of the removed connection.
			// Just re-add all of them.
			this.props.insertConnections(newConnectionsInBus);
			this.props.insertConnections(this.connectionsFromLane(connection.laneIndex));
		});
		*/
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
		insertConnections: (connections) => (connections
			.map(({ inlet, outlet }) => GraphModule.actions.connectNodes(outlet.nodeKey, inlet.nodeKey, inlet.inletKey))
			.forEach(dispatch)),

		removeConnections: (connections) => (connections
			.map(({ inlet, outlet }) => (GraphModule.actions.disconnectNodes(outlet.nodeKey, inlet.nodeKey, inlet.inletKey)))
			.forEach(dispatch)),

		openNodeControls: (nodeKey) => dispatch(App.actions.setModal(App.Modals.NODE_CONTROLS(nodeKey))),
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps
)(BusRouter);

