import { entries, values, flatMap } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Table, Props as TableProps } from '@davidisaaclee/react-table';
import * as Graph from '@davidisaaclee/graph';
import { SimpleVideoGraph } from '../../model/SimpleVideoGraph';
import { modules as videoModules } from '../../model/Kit';
import { State as RootState } from '../../modules';
import * as GraphModule from '../../modules/graph';
import { combinations } from '../../utility/combinations';

const e = React.createElement;

interface StateProps {
	graph: SimpleVideoGraph;
}

interface DispatchProps {
	insertConnections: (connections: Array<{ outlet: Outlet, inlet: Inlet }>) => any;
	removeConnections: (connections: Array<{ outlet: Outlet, inlet: Inlet }>) => any;
}

type Props = Partial<TableProps> & StateProps & DispatchProps;

interface Connection {
	busIndex: number;
	laneIndex: number;
}

interface State {
	busCount: number;
	connections: Connection[];
}

type Inlet = { nodeKey: string, inletKey: string };
type Outlet = { nodeKey: string };

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
		busCount: 0,
		connections: [] as Connection[],
	}

	public componentDidMount() {
		this.populateConnections(this.props.graph);
	}

	public render() {
		const { busCount, connections } = this.state;
		const {
			graph,
			insertConnections, removeConnections,
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
				lanes[index].name),
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
						'x');
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
		});
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
		.filter(x => x != null) as Array<Inlet>;
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
		.filter(x => x != null) as Array<Outlet>;

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
			([nodeKey, node]): Lane[] => [
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
			busCount: edges.length,
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
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(BusRouter);

