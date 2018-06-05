import { flatMap, defaultTo, values } from 'lodash';
import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import {
	RoutingMatrix as RoutingMatrixView,
	edgeLookup,
	Props as RoutingMatrixProps
} from '@davidisaaclee/react-routing-matrix';
import * as Kit from '../../../model/Kit';
import { State as RootState } from '../../../modules';
import * as Graph from '../../../modules/graph';
import './RoutingMatrix.css';

const e = React.createElement;

interface StateProps {
	rows: string[];
	columns: string[];
	makeRenderCell: (setMasterOutput: (nodeKey: string) => any) => (row: number, column: number) => React.ReactNode;
}

// TODO: I think this should be Exclude<RoutingMatrixProps, DispatchProps & StateProps>, but that doesn't seem to work
type OwnProps = Partial<RoutingMatrixProps>;

interface DispatchProps {
	setMasterOutput: (nodeKey: string) => any;
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

	const outputRowIndex = 0;

	const indexOfInlet = (moduleKey: string, inletKey: string): number => (
		inletsList.findIndex(elm => elm.moduleKey === moduleKey && elm.inletKey === inletKey)
		// Offset by one to account for output row.
		+ 1
	);
	const indexOfModuleOutput = (moduleKey: string): number => (
		moduleOutputList.indexOf(moduleKey)
	);

	const edges: Array<[number, number, boolean]> = values(state.graph.graph.edges)
		.map(({ src, dst, metadata }) => {
			return [
				indexOfInlet(src, metadata.inlet),
				indexOfModuleOutput(dst),
				true,
			] as [number, number, boolean]
		});

	return {
		rows: [
			'output',
			...inletsList.map(({ inletKey, moduleKey }) => `${moduleKey} • ${inletKey}`),
		],
		columns: moduleOutputList,

		makeRenderCell: (setMasterOutput) => edgeLookup(
			edges,
			(value: boolean | null, row: number, column: number) => {
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
				} else if (row === outputRowIndex) {
					if (moduleOutputList[column] === state.graph.outputNodeKey) {
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
								onClick: () => setMasterOutput(moduleOutputList[column]),
							});
					}
				} else {
					return null;
				}
			})
		
	};
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {
		setMasterOutput: (nodeKey: string) => dispatch(Graph.actions.setMasterOutput(nodeKey))
	};
}

function mergeProps(
	stateProps: StateProps,
	dispatchProps: DispatchProps,
	ownProps: OwnProps
): object {
	const { makeRenderCell, ...restStateProps } = stateProps;
	const { setMasterOutput, ...restDispatchProps } = dispatchProps;

	return {
		...ownProps,
		...restStateProps,
		...restDispatchProps,
		renderCell: makeRenderCell(setMasterOutput)
	};
}

export default connect<StateProps, DispatchProps, OwnProps>(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)(RoutingMatrixView) as React.ComponentClass<OwnProps>;

