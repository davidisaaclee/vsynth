import { entries } from 'lodash';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { State as RootState } from '../../modules';
import NodeControls, { Props as NodeControlsProps } from '../presentational/NodeControls';
import * as GraphModule from '../../modules/graph';

interface StateProps {
	parametersForNodeKey: (nodeKey: string) => Array<{ key: string, name: string, value: number }>;
}

interface DispatchProps {
	makeOnEdit: (nodeKey: string) => (index: number, value: number, key: string) => any;
}

interface OwnProps {
	nodeKey: string;
}

function mapStateToProps(state: RootState): StateProps {
	return {
		parametersForNodeKey: nodeKey => {
			const node = state.graph.graph.nodes[nodeKey];
			return entries(node.parameters)
				.map(([identifier, value]) => ({
					key: identifier,
					name: identifier,
					value
				}));
		}
	};
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {
		makeOnEdit: (nodeKey) => (index, value, parameterKey) => (
			dispatch(GraphModule.actions.setParameter(nodeKey, parameterKey, value))
		)
	};
}

function mergeProps(
	stateProps: StateProps,
	dispatchProps: DispatchProps,
	ownProps: OwnProps
): NodeControlsProps {
	const { parametersForNodeKey } = stateProps;
	const { makeOnEdit } = dispatchProps;
	const { nodeKey } = ownProps;

	return {
		parameters: parametersForNodeKey(nodeKey),
		onEdit: makeOnEdit(nodeKey)
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)(NodeControls);

