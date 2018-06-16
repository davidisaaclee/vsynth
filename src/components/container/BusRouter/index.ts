import { entries, values, flatMap } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Table, Props as TableProps } from '@davidisaaclee/react-table';
import * as Graph from '@davidisaaclee/graph';
import { SimpleVideoGraph, VideoModuleSpecification } from '../../../model/SimpleVideoGraph';
import { modules as videoModules } from '../../../model/Kit';
import * as App from '../../../modules/app';
import { State as RootState } from '../../../modules';
import * as GraphModule from '../../../modules/graph';
import { combinations } from '../../../utility/combinations';
import './style.css';

const e = React.createElement;

interface StateProps {
	graph: SimpleVideoGraph;
}

interface DispatchProps {
	insertConnections: (connections: Array<{ outlet: Outlet, inlet: Inlet }>) => any;
	removeConnections: (connections: Array<{ outlet: Outlet, inlet: Inlet }>) => any;
	openNodeControls: (nodeKey: string) => any;
}

interface OwnProps extends Partial<TableProps> {
	busCount: number;
}

type Props = OwnProps & StateProps & DispatchProps;

interface Connection {
	busIndex: number;
	laneIndex: number;
}

interface State {
	connections: Connection[];
}

interface Inlet {
	nodeKey: string;
	inletKey: string;
}

interface Outlet {
	nodeKey: string;
}

type Lane = { name: string }
	& (
		({ type: 'inlet' } & Inlet)
		| ({ type: 'outlet' } & Outlet)
	);

function connectionEqual(c1: Connection, c2: Connection): boolean {
	return c1.busIndex === c2.busIndex && c1.laneIndex === c2.laneIndex;
}

class BusRouter extends React.Component<Props, State> {
	public state = {
		connections: [] as Connection[],
	}

	public componentDidMount() {
		this.populateConnections(this.props.graph);
	}

	public render() {
		const { connections } = this.state;
		const {
			graph, busCount,
			insertConnections, removeConnections,
			openNodeControls,
			...restProps
		} = this.props;
		const lanes = this.lanes;

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
		if (this.state.connections.find(c => connectionEqual(connection, c)) != null) {
			// Connection already exists.
			return;
		}
		
		const connections =
			[...this.state.connections, connection];
		this.setState({ connections }, () => {
			this.props.insertConnections(this.connectionsInBus(connection.busIndex));
		});
	}

	private removeConnection(connection: Connection) {
		const indexOfConnection =
			this.state.connections.findIndex(c => connectionEqual(connection, c));
		if (indexOfConnection === -1) {
			// No such connection
			return;
		}

		const oldConnectionsInBus =
			this.connectionsInBus(connection.busIndex);

		const connectionsCopy =
			this.state.connections.slice();
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
	}

	private connectionsFromLane(laneIndex: number): Array<{ inlet: Inlet, outlet: Outlet }> {
		const lanes = this.lanes;

		// Get all busses that this lane connects to.
		const bussesConnectedToLane = this.state.connections
		.filter(c => c.laneIndex === laneIndex)
		.map(c => c.busIndex);

		// If this lane is an inlet, find all outlets connected to the connected busses.
		const lane = lanes[laneIndex];
		if (lane.type === 'inlet') {
			const connectedOutletNodes = flatMap(
				bussesConnectedToLane,
				busIndex => (this.state.connections
					.filter(c => c.busIndex === busIndex)
					.filter(c => lanes[c.laneIndex].type === 'outlet')
					.map(c => ({
						nodeKey: lanes[c.laneIndex].nodeKey
					}))));

			return connectedOutletNodes.map(outlet => ({
				inlet: {
					nodeKey: lane.nodeKey,
					inletKey: lane.inletKey
				},
				outlet
			}));
		} else {
			const connectedInletNodes = flatMap(
				bussesConnectedToLane,
				busIndex => (this.state.connections
					.filter(c => c.busIndex === busIndex)
					.filter(c => lanes[c.laneIndex].type === 'inlet')
					.map(c => {
						const inlet = lanes[c.laneIndex] as Inlet;
						return {
							nodeKey: inlet.nodeKey,
							inletKey: inlet.inletKey,
						}
					})));

			return connectedInletNodes.map(inlet => ({
				inlet,
				outlet: {
					nodeKey: lane.nodeKey
				}
			}));
		}
	}

	private connectionsInBus(busIndex: number): Array<{ inlet: Inlet, outlet: Outlet }> {
		const lanesConnectedToBus = this.state.connections
		.filter(connection => connection.busIndex === busIndex)
		.map(({ laneIndex }) => laneIndex);

		const lanes = this.lanes;
		const inletsConnectedToBus = lanesConnectedToBus
		.map(laneIndex => {
			const lane = lanes[laneIndex];
			if (lane.type !== 'inlet') {
				return null;
			}

			return {
				nodeKey: lane.nodeKey,
				inletKey: lane.inletKey
			};
		})
		.filter(x => x != null) as Inlet[];
		const outletsConnectedToBus = lanesConnectedToBus
		.map(laneIndex => {
			const lane = lanes[laneIndex];
			if (lane.type !== 'outlet') {
				return null;
			}

			return {
				nodeKey: lane.nodeKey,
			};
		})
		.filter(x => x != null) as Outlet[];

		return combinations(outletsConnectedToBus, inletsConnectedToBus)
		.map(([outlet, inlet]) => ({ outlet, inlet }));
	}

	// TODO: be safer
	private styleForLane(laneIndex: number): object {
		const isInlet = this.lanes[laneIndex].type === 'inlet';
		return isInlet
		? {}
		: {
			backgroundColor: 'black',
			color: 'white',
		};
	}

	private get lanes(): Lane[] {
		return flatMap(
			entries(Graph.allNodes(this.props.graph)),
			([nodeKey, node]: [string, VideoModuleSpecification]): Lane[] => [
				{
					type: 'outlet',
					name: nodeKey,
					nodeKey,
				},
				...(videoModules[node.type].inletUniforms == null
					? []
					: entries(videoModules[node.type].inletUniforms)
					.map(([inletKey, inlet]): Lane => ({
						type: 'inlet',
						name: `${nodeKey} • ${inletKey}`,
						nodeKey,
						inletKey
					})))
			]);
	}

	private populateConnections(graph: SimpleVideoGraph) {
		const edges = values(Graph.allEdges(graph));
		const lanes = this.lanes;

		this.setState({
			connections: flatMap(
				edges,
				({
					src: inletNodeKey,
					dst: outletNodeKey,
					metadata: { inlet: inletKey }
				}, index) => [
					{
						busIndex: index,
						laneIndex: lanes.findIndex(l => (
							l.type === 'inlet'
							&& l.inletKey === inletKey
							&& l.nodeKey === inletNodeKey
						))
					},
					{
						busIndex: index,
						laneIndex: lanes.findIndex(l => (
							l.type === 'outlet'
							&& l.nodeKey === outletNodeKey
						))
					}
				])
		});
	}
}

function mapStateToProps(state: RootState): StateProps {
	return {
		graph: state.graph.graph
	};
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {
		// TODO
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

