import { entries, values, flatMap } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Table, Props as TableProps } from '@davidisaaclee/react-table';
import * as Graph from '@davidisaaclee/graph';
import { SimpleVideoGraph } from '../../model/SimpleVideoGraph';
import { modules as videoModules } from '../../model/Kit';
import { State as RootState } from '../../modules';

const e = React.createElement;

interface StateProps {
	graph: SimpleVideoGraph;
}

type Props = Partial<TableProps> & StateProps;

interface Connection {
	busIndex: number;
	laneIndex: number;
}

interface State {
	busCount: number;
	connections: Connection[];
}

type Lane = { name: string, nodeKey: string }
	& (
		{ type: 'inlet', inletKey: string }
		| { type: 'outlet' }
	);

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
		const { graph, ...restProps } = this.props;
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
						},
						' ');
				} else {
					return e('div',
						{
							style: {
								...this.styleForLane(laneIndex),
								whiteSpace: 'pre-wrap',
							},
						},
						'x');
				}
				// TODO
				throw new Error();
			}
		});
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

function mapDispatchToProps(dispatch: Dispatch): object {
	return {};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(BusRouter);

