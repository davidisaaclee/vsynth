import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { State as RootState } from '../../../modules';
import NodeControls, { Props as NodeControlsProps } from '../../presentational/NodeControls';
import * as DocumentModule from '../../../modules/document';
import * as selectors from './selectors';

interface StateProps {
	parametersForNodeKey: (nodeKey: string) => Array<{ key: string, name: string, value: number }>;
}

interface DispatchProps {
	makeOnInput: (nodeKey: string) => (index: number, value: number, key: string) => any;
	makeOnChange: (nodeKey: string) => (index: number, value: number, key: string) => any;
}

interface OwnProps {
	nodeKey: string;
}

function mapStateToProps(state: RootState): StateProps {
	return {
		parametersForNodeKey: selectors.parametersForNodeKey(state)
	};
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {
		makeOnInput: (nodeKey) => (index, value, parameterKey) => (
			dispatch(DocumentModule.actions.previewParameter(nodeKey, parameterKey, value))
		),

		makeOnChange: (nodeKey) => (index, value, parameterKey) => (
			dispatch(DocumentModule.actions.setParameter(nodeKey, parameterKey, value))
		),
	};
}

function mergeProps(
	stateProps: StateProps,
	dispatchProps: DispatchProps,
	ownProps: OwnProps
): NodeControlsProps {
	const { parametersForNodeKey } = stateProps;
	const { makeOnInput, makeOnChange } = dispatchProps;
	const { nodeKey } = ownProps;

	return {
		parameters: parametersForNodeKey(nodeKey),
		onInput: makeOnInput(nodeKey),
		onChange: makeOnChange(nodeKey),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)(NodeControls);

