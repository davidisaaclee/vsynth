import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { State as RootState } from '../../../modules';
import * as Document from '../../../modules/document';
import * as C from './components';
import * as selectors from './selectors';

const e = React.createElement;

interface StateProps {
	initialText: string;
}

interface DispatchProps {
	load: (file: string) => any;
}

type Props = StateProps & DispatchProps;

interface State {
	fileText: string;
}

class SaveLoad extends React.Component<Props, State> {
	public state: State = {
		fileText: this.props.initialText,
	}

	public render() {
		const { load } = this.props;
		const { fileText } = this.state;

		return e(C.Container,
			{},
			e(C.Toolbar, { onClickLoad: () => load(fileText) }),
			e(C.FileText,
				{
					text: fileText,
					onChange: (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
						const fileText = evt.currentTarget.value;
						this.setState(prevState => ({
							...prevState,
							fileText
						}));
					}
				}));
	}
}

function mapStateToProps(state: RootState): StateProps {
	return {
		initialText: selectors.currentDocumentFile(state),
	};
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {
		load: (fileText: string) => {
			try {
				const document = JSON.parse(fileText);
				dispatch(Document.actions.loadDocument(document));
			} catch (e) {
				console.error(e);
			}
		},
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SaveLoad);

