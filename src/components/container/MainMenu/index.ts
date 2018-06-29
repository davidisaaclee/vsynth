import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { ActionCreators as UndoActions } from 'redux-undo';
import * as Graph from '../../../modules/graph';
import * as App from '../../../modules/app';
import * as C from './components';

const e = React.createElement;

interface DispatchProps {
	resetDocument: () => any;
	undo: () => any;
	redo: () => any;
}

type OwnProps = React.HTMLAttributes<HTMLUListElement>;

type Props = DispatchProps & OwnProps;

const MainMenu: React.StatelessComponent<Props> = ({
	resetDocument, undo, redo,
	...restProps
}) => (
	e(C.List,
		restProps,
		e(C.Item,
			{},
			e(C.Button,
				{
					onClick: resetDocument
				},
				'Reset')),
		e(C.Item,
			{},
			e(C.Button,
				{
					onClick: undo
				},
				'Undo')),
		e(C.Item,
			{},
			e(C.Button,
				{
					onClick: redo
				},
				'Redo')))
);

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {
		resetDocument: () => {
			dispatch(Graph.actions.resetAll());
			dispatch(App.actions.setModal(null));
		},

		undo: () => {
			dispatch(UndoActions.undo());
		},

		redo: () => {
			dispatch(UndoActions.redo());
		},
	};
}

export default connect<object, DispatchProps, OwnProps>(
	null,
	mapDispatchToProps
)(MainMenu);

