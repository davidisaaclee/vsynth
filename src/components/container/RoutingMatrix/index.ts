import { flatMap, defaultTo, values } from 'lodash';
import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import {
	Table,
	edgeLookup,
	Props as TableProps
} from '@davidisaaclee/react-table';
import * as Kit from '../../../model/Kit';
import { State as RootState } from '../../../modules';
import * as Graph from '../../../modules/graph';
import * as App from '../../../modules/app';
import './RoutingMatrix.css';

const e = React.createElement;

type Props = TableProps & { openNodePicker: () => any, };

const RoutingMatrix: React.StatelessComponent<Props> = ({ openNodePicker, style, ...props }) =>
	e('span',
		{ style },
		e(Table,
			{
				style: {
					display: 'inline',
				},
				...props,
			}),
		e('button',
			{
				style: {
					margin: 20,
				},
				onClick: openNodePicker
			},
			'Add'));



interface Connection {
	fromNodeKey: string;
	toNodeKey: string;
	inletKey: string;
}

interface RenderCellConfig {
	setMasterOutput: (nodeKey: string) => any;
	connectNodes: (connection: Connection) => any;
	disconnectNodes: (connection: Connection) => any;
};

interface StateProps {
	rowCount: number;
	columnCount: number;
	makeRenderRowHeader: (openNodeControls: (nodeKey: string) => any) => (rowIndex: number) => React.ReactNode;
	renderColumnHeader: (columnIndex: number) => React.ReactNode;
	makeRenderCell: (config: RenderCellConfig) => (row: number, column: number) => React.ReactNode;
}

type ConnectedFields
	= "rowCount" | "columnCount" | "renderRowHeader"
	| "renderColumnHeader" | "renderCell";
interface ConnectedProps 
	extends Pick<TableProps, ConnectedFields>, React.HTMLAttributes<HTMLTableElement> {
	openNodePicker: () => any;
}

// TODO: I think this should be something like
// `Exclude<TableProps, ConnectedProps>`, but that doesn't seem to work.
// (Issue is: need to take the required fields of Table that are being provided
// via ConnectedProps and make them optional in OwnProps.)
type OwnProps = Pick<TableProps, 'style'>;

interface DispatchProps {
	setMasterOutput: (nodeKey: string) => any;
	openNodeControls: (nodeKey: string) => any;
	connectNodes: (connection: Connection) => any;
	disconnectNodes: (connection: Connection) => any;
	openNodePicker: () => any;
}


function mapStateToProps(state: RootState): StateProps {
	const nodeOutputList = Object.keys(state.graph.graph.nodes);
	const inletsList = flatMap(
		nodeOutputList,
		nodeKey => (
			Object.keys(
				defaultTo(
					Kit.modules[state.graph.graph.nodes[nodeKey].type].inletUniforms,
					{}))
			.map(inletKey => ({ nodeKey, inletKey }))));

	const masterOutputColumnIndex = 0;

	const indexOfInlet = (nodeKey: string, inletKey: string): number => (
		inletsList.findIndex(elm => elm.nodeKey === nodeKey && elm.inletKey === inletKey)
		// Offset by one to account for master output.
		+ 1
	);
	const indexOfNodeOutput = (nodeKey: string): number => (
		nodeOutputList.indexOf(nodeKey)
	);

	const edges: Array<[number, number, boolean]> = values(state.graph.graph.edges)
		.map(({ src, dst, metadata }) => {
			return [
				indexOfNodeOutput(dst),
				indexOfInlet(src, metadata.inlet),
				true,
			] as [number, number, boolean]
		});

	return {
		rowCount: nodeOutputList.length,
		columnCount: inletsList.length + 1,
		makeRenderRowHeader: (openNodeControls) => (rowIndex) => (
			e('button',
				{
					onClick: () => openNodeControls(nodeOutputList[rowIndex])
				},
				nodeOutputList[rowIndex])
		),
		renderColumnHeader: (columnIndex) => (
			columnIndex === 0 
			? 'output' 
			: e('span',
				{},
				e('div', { style: { fontStyle: 'italic' } }, inletsList[columnIndex - 1].nodeKey),
				e('div', {}, inletsList[columnIndex - 1].inletKey))
		),

		makeRenderCell: ({ setMasterOutput, connectNodes, disconnectNodes }) => edgeLookup(
			edges,
			(value: boolean | null, dstIndex: number, srcIndex: number) => {
				const connection = () => ({
					fromNodeKey: nodeOutputList[dstIndex],
					toNodeKey: inletsList[srcIndex - 1].nodeKey,
					inletKey: inletsList[srcIndex - 1].inletKey,
				});

				if (value) {
					return e('span',
						{
							style: {
								backgroundColor: 'black',
								width: 20,
								height: 20,
								display: 'block',
								margin: '0 auto',
							}
						});
				} else if (srcIndex === masterOutputColumnIndex) {
					if (nodeOutputList[dstIndex] === state.graph.outputNodeKey) {
						return e('span',
							{
								style: {
									width: 20,
									height: 20,
									display: 'block',
									margin: '0 auto',
									borderRadius: 20,
									border: '1px solid black',
								}
							});
					} else {
						return e('span',
							{
								style: {
									width: 30,
									height: 30,
									display: 'block',
									margin: '0 auto',
								},
								onClick: () => setMasterOutput(nodeOutputList[dstIndex]),
							});
					}
				} else {
					return e('span',
						{
							style: {
								width: 30,
								height: 30,
								display: 'block',
								margin: '0 auto',
							},
							onClick: () => connectNodes(connection())
						});
				}
			})
		
	};
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {
		setMasterOutput: (nodeKey) => dispatch(Graph.actions.setMasterOutput(nodeKey)),
		openNodeControls: (nodeKey) => dispatch(App.actions.setModal(App.Modals.NODE_CONTROLS(nodeKey))),
		connectNodes: (connection) => dispatch(Graph.actions.connectNodes(connection.fromNodeKey, connection.toNodeKey, connection.inletKey)),
		disconnectNodes: (connection) => dispatch(Graph.actions.disconnectNodes(connection.fromNodeKey, connection.toNodeKey, connection.inletKey)),
		openNodePicker: () => dispatch(App.actions.setModal(App.Modals.PICK_MODULE)),
	};
}

function mergeProps(
	stateProps: StateProps,
	dispatchProps: DispatchProps,
	ownProps: OwnProps
): ConnectedProps {
	const {
		makeRenderCell, makeRenderRowHeader,
		...restStateProps
	} = stateProps;
	const {
		setMasterOutput, openNodeControls,
		connectNodes, disconnectNodes,
		...restDispatchProps
	} = dispatchProps;

	return {
		...ownProps,
		...restStateProps,
		...restDispatchProps,
		renderCell: makeRenderCell({
			setMasterOutput,
			connectNodes,
			disconnectNodes,
		}),
		renderRowHeader: makeRenderRowHeader(openNodeControls)
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)(RoutingMatrix) as React.ComponentClass<OwnProps>;

