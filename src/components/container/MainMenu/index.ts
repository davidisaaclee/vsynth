import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { ActionCreators as UndoActions } from 'redux-undo';
import * as Graph from '../../../modules/graph';
import * as App from '../../../modules/app';

const e = React.createElement;

interface DispatchProps {
	resetDocument: () => any;
	undo: () => any;
	redo: () => any;
}

type Props = DispatchProps;

const MainMenu: React.StatelessComponent<Props> = ({ resetDocument, undo, redo }) => (
	e('ul',
		{},
		e('li',
			{},
			e('button',
				{
					onClick: resetDocument
				},
				'Reset')),
		e('li',
			{},
			e('button',
				{
					onClick: undo
				},
				'Undo')),
		e('li',
			{},
			e('button',
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

export default connect(
	null,
	mapDispatchToProps
)(MainMenu);

