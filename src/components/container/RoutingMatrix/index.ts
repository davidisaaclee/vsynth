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
	rows: string[];
	columns: string[];
	makeRenderCell: (config: RenderCellConfig) => (row: number, column: number) => React.ReactNode;
}

// TODO: I think this should be Exclude<TableProps, DispatchProps & StateProps>, but that doesn't seem to work
type OwnProps = Partial<TableProps>;

interface DispatchProps {
	setMasterOutput: (nodeKey: string) => any;
	connectNodes: (connection: Connection) => any;
	disconnectNodes: (connection: Connection) => any;
	openNodePicker: () => any;
}


function mapStateToProps(state: RootState): StateProps {
	const moduleOutputList = Object.keys(state.graph.graph.nodes);
	const inletsList = flatMap(
		moduleOutputList,
		moduleKey => (
			Object.keys(
				defaultTo(
					Kit.modules[state.graph.graph.nodes[moduleKey].type].inletUniforms,
					{}))
			.map(inletKey => ({ moduleKey, inletKey }))));

	const masterOutputColumnIndex = 0;

	const indexOfInlet = (moduleKey: string, inletKey: string): number => (
		inletsList.findIndex(elm => elm.moduleKey === moduleKey && elm.inletKey === inletKey)
		// Offset by one to account for master output.
		+ 1
	);
	const indexOfModuleOutput = (moduleKey: string): number => (
		moduleOutputList.indexOf(moduleKey)
	);

	const edges: Array<[number, number, boolean]> = values(state.graph.graph.edges)
		.map(({ src, dst, metadata }) => {
			return [
				indexOfModuleOutput(dst),
				indexOfInlet(src, metadata.inlet),
				true,
			] as [number, number, boolean]
		});

	return {
		rows: moduleOutputList,
		columns: [
			'output',
			...inletsList.map(({ inletKey, moduleKey }) => `${moduleKey} • ${inletKey}`),
		],

		makeRenderCell: ({ setMasterOutput, connectNodes, disconnectNodes }) => edgeLookup(
			edges,
			(value: boolean | null, dstIndex: number, srcIndex: number) => {
				const connection = () => ({
					fromNodeKey: moduleOutputList[dstIndex],
					toNodeKey: inletsList[srcIndex - 1].moduleKey,
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
					if (moduleOutputList[dstIndex] === state.graph.outputNodeKey) {
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
								onClick: () => setMasterOutput(moduleOutputList[dstIndex]),
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
		connectNodes: (connection) => dispatch(Graph.actions.connectNodes(connection.fromNodeKey, connection.toNodeKey, connection.inletKey)),
		disconnectNodes: (connection) => dispatch(Graph.actions.disconnectNodes(connection.fromNodeKey, connection.toNodeKey, connection.inletKey)),
		openNodePicker: () => dispatch(App.actions.setModal(App.Modals.PICK_MODULE)),
	};
}

function mergeProps(
	stateProps: StateProps,
	dispatchProps: DispatchProps,
	ownProps: OwnProps
): object {
	const { makeRenderCell, ...restStateProps } = stateProps;
	const {
		setMasterOutput, connectNodes,
		disconnectNodes,
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
		})
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)(RoutingMatrix) as React.ComponentClass<OwnProps>;

