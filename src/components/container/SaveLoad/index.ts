import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { State as RootState } from '../../../modules';
import * as Document from '../../../modules/document';
import { documentDecoder } from '../../../model/Coding';
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

	private textareaElement: HTMLTextAreaElement | null;

	public render() {
		const { load } = this.props;
		const { fileText } = this.state;

		return e(C.Container,
			{},
			e(C.TextContainer,
				{},
				e(C.CopyButton,
					{
						onClick: () => {
							if (this.textareaElement == null) {
								return;
							}

							this.textareaElement.select();
							document.execCommand('copy');
						},
					},
					'Copy'),
				e(C.FileText,
					{
						innerRef: this.textareaRef,
						text: fileText,
						onChange: (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
							const fileText = evt.currentTarget.value;
							this.setState(prevState => ({
								...prevState,
								fileText
							}));
						}
					})),
			e(C.LoadButton,
				{
					onClick: () => {
						load(fileText);
					}
				},
				'Load'));
	}

	private textareaRef = (textarea: HTMLTextAreaElement | null) => {
		if (this.textareaElement !== textarea) {
			this.textareaElement = textarea;
		}
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
				const document = documentDecoder.runWithException(JSON.parse(fileText));
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

