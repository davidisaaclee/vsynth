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
import './App.css';
import { State as RootState } from './modules';

Modal.setAppElement('#root');

const e = React.createElement;

const StyledBusRouter = styled(BusRouter)`
	display: inline;
`;

const AddButton = styled.button`
	margin: 20px;
`;

type Props = StateProps & DispatchProps;

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

			case 'MAIN_MENU':
				return e(MainMenu);

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
								backgroundColor: 'rgba(255, 255, 255, 0)',
								borderRadius: 0,
								border: 'none',
								outline: 'none',
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
								top: 0,
								position: 'absolute',
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
							'Add node'),
					)),
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

interface StateProps {
	modal: AppModule.Modals.Modal | null;
}

interface DispatchProps {
	closeModal: () => any;
	addModule: (modType: Kit.ModuleType) => any;
	addBus: () => any;
	openNodePicker: () => any;
	undo: () => any;
	redo: () => any;
}

function mapStateToProps(state: RootState): StateProps {
	return {
		modal: state.app.modal
	};
}

let counter = 0;
function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {
		closeModal: () => dispatch(AppModule.actions.setModal(null)),
		addModule: (modType) => {
			const nodeKey = `${modType}-${counter++}`;
			dispatch(Graph.actions.insertNode(
				videoModuleSpecFromModuleType(modType),
				nodeKey));
		},
		addBus: () => dispatch(Graph.actions.addBus()),
		openNodePicker: () => dispatch(AppModule.actions.setModal(AppModule.Modals.pickModule)),
		undo: () => dispatch(UndoActions.undo()),
		redo: () => dispatch(UndoActions.redo()),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(App);

