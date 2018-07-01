import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as Modal from 'react-modal';
import { ActionCreators as UndoActions } from 'redux-undo';
import { HotKeys } from 'react-hotkeys';
import styled from './styled-components';
import * as Kit from './model/Kit';
import { videoModuleSpecFromModuleType } from './model/SimpleVideoGraph';
import Screen from './components/container/Screen';
import BusRouter from './components/container/BusRouter';
import ModulePicker from './components/container/ModulePicker';
import NodeControls from './components/container/ConnectedNodeControls';
import MainMenu from './components/container/MainMenu';
import * as AppModule from './modules/app';
import * as Graph from './modules/graph';
import * as sharedSelectors from './modules/sharedSelectors';
import './App.css';
import { State as RootState } from './modules';

Modal.setAppElement('#root');

const e = React.createElement;

const StyledBusRouter = styled(BusRouter)`
	display: inline;
`;

const AddButton = styled.button`
	margin: 10px;
`;

const StyledMenu = styled(MainMenu)`
	background-color: #111;
	padding: 10px;
	position: fixed;
	height: 30px;
	right: 0;
	bottom: 0;
	
	margin: 20px;
`;

interface Props {
	modal: AppModule.Modals.Modal | null;

	closeModal: () => any;
	addModule: (modType: Kit.ModuleType) => any;
	addBus: () => any;
	openNodePicker: () => any;
	undo: () => any;
	redo: () => any;
};

interface StateProps {
	modal: AppModule.Modals.Modal | null;
	nextNodeKey: (modType: Kit.ModuleType) => string;
}

interface DispatchProps {
	closeModal: () => any;
	makeAddModule: (makeNodeKey: (modType: Kit.ModuleType) => string) => (modType: Kit.ModuleType) => any;
	addBus: () => any;
	openNodePicker: () => any;
	undo: () => any;
	redo: () => any;
}

interface State {
	isShowingRouter: boolean;
}

class App extends React.Component<Props, State> {
	public state = {
		isShowingRouter: true,
	}

	public renderModal(modal: AppModule.Modals.Modal): React.ReactNode {
		switch (modal.type) {
			case 'PICK_MODULE':
				return e(ModulePicker,
					{
						addModule: (modType: Kit.ModuleType) => {
							this.props.addModule(modType);
							this.props.closeModal();
						}
					});

			case 'NODE_CONTROLS':
				return e(NodeControls, { nodeKey: modal.nodeKey });
		}
	}
	
	public render() {
		const {
			modal,
			openNodePicker, closeModal,
			undo, redo,
			addBus
		} = this.props;
		const {
			isShowingRouter
		} = this.state;

		return e(HotKeys,
			{
				keyMap: {
					undo: ['command+z', 'ctrl+z'],
					redo: ['command+shift+z', 'ctrl+shift+z'],
				},
				handlers: {
					'undo': undo,
					'redo': redo
				},
				// TODO: This shouldn't be necessary, I think.
				attach: window,
			},
			e('div', {},
				e(Screen,
					{
						onClick: () => {
							this.setState({ isShowingRouter: true });
						}
					}),
				e(Modal,
					{
						isOpen: isShowingRouter,
						onRequestClose: () => {
							this.setState({ isShowingRouter: false });
						},
						style: {
							content: {
								opacity: 1,
								backgroundColor: '#444',
								borderRadius: 0,
								border: 'none',
								outline: 'none',
								overflow: 'visible',
							},
							overlay: {
								backgroundColor: 'rgba(255, 255, 255, 0)',
								border: 'none',
							}
						}
					},
					e('div',
						{
							style: {
								left: 0,
								right: 0,
								top: 0,
								bottom: 0,
								position: 'absolute',
								overflow: 'auto',
							}
						},
						e('div',
							{
								style: {
									whiteSpace: 'nowrap'
								}
							},
							e(StyledBusRouter),
							e(AddButton,
								{
									onClick: addBus
								},
								'Add bus')),
						e(AddButton,
							{
								onClick: openNodePicker
							},
							'Add node')),
					e(StyledMenu)),
				e(Modal,
					{
						isOpen: modal != null,
						onRequestClose: closeModal,
						style: {
							content: {
								opacity: 1,
								backgroundColor: 'rgba(255, 255, 255, 0)',
								borderRadius: 0,
								border: '1px solid white',
								outline: '1px solid black',
							},
							overlay: {
								backgroundColor: 'rgba(255, 255, 255, 0)',
								border: 'none',
							}
						}
					},
					modal == null
					? null
					: this.renderModal(modal))));
	}
}

function mapStateToProps(state: RootState): StateProps {
	return {
		modal: state.app.modal,
		nextNodeKey: sharedSelectors.nextNodeKey(state),
	};
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {
		makeAddModule: makeNodeKey => modType => (
			dispatch(Graph.actions.insertNode(
				videoModuleSpecFromModuleType(modType),
				makeNodeKey(modType)))
		),
		closeModal: () => dispatch(AppModule.actions.setModal(null)),
		addBus: () => dispatch(Graph.actions.addBus()),
		openNodePicker: () => dispatch(AppModule.actions.setModal(AppModule.Modals.pickModule)),
		undo: () => dispatch(UndoActions.undo()),
		redo: () => dispatch(UndoActions.redo()),
	};
}

interface OwnProps {};
function mergeProps(
	stateProps: StateProps,
	dispatchProps: DispatchProps,
	ownProps: OwnProps
): Props {
	const { modal, nextNodeKey } = stateProps;
	const {
		makeAddModule,
		addBus, closeModal,
		openNodePicker, redo, undo
	} = dispatchProps;
	return {
		addModule: makeAddModule(nextNodeKey),
		modal,
		addBus,
		closeModal,
		openNodePicker,
		redo,
		undo
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps,
)(App);

