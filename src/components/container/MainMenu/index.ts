import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as Graph from '../../../modules/graph';
import * as App from '../../../modules/app';

const e = React.createElement;

interface DispatchProps {
	resetDocument: () => any;
}

type Props = DispatchProps;

const MainMenu: React.StatelessComponent<Props> = ({ resetDocument }) => (
	e('ul',
		{},
		e('li',
			{},
			e('button',
				{
					onClick: resetDocument
				},
				'Reset')))
);

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {
		resetDocument: () => {
			dispatch(Graph.actions.resetAll());
			dispatch(App.actions.setModal(null));
		}
	};
}

export default connect(
	null,
	mapDispatchToProps
)(MainMenu);

