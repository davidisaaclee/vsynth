import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as Modal from 'react-modal';
import { modules as videoModules, ModuleType } from './model/Kit';
import { videoModuleSpecFromModuleType } from './model/SimpleVideoGraph';
import Screen from './components/container/Screen';
import BusRouter from './components/container/BusRouter';
import ModulePicker from './components/container/ModulePicker';
import NodeControls from './components/container/ConnectedNodeControls';
import * as AppModule from './modules/app';
import * as Graph from './modules/graph';
import './App.css';
import { State as RootState } from './modules';

Modal.setAppElement('#root');

const e = React.createElement;

type Props = StateProps & DispatchProps;

interface State {
	isShowingRouter: boolean;
}

class App extends React.Component<Props, State> {
	public state = {
		isShowingRouter: true,
	}

	public renderModal(modal: AppModule.Modals.Modal): React.ReactNode {
		if (modal === AppModule.Modals.PICK_MODULE) {
			return e(ModulePicker,
				{
					addModule: (modType: ModuleType) => {
						this.props.addModule(modType);
						this.props.closeModal();
					}
				});
		} else if (AppModule.Modals.isNodeControls(modal)) {
			return e(NodeControls, { nodeKey: modal.nodeKey });
		} else {
			throw new Error(`Invalid modal type: ${modal}`);
		}
	}
	
	public render() {
		const {
			modal,
			openNodePicker, closeModal,
			addBus
		} = this.props;
		const {
			isShowingRouter
		} = this.state;

		return e('div', {},
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
					e(BusRouter),
					e('button',
						{
							style: {
								margin: 0,
								position: 'absolute',
								right: -50,
								top: 0
							},
							onClick: addBus
						},
						'Add bus'),
					e('button',
						{
							style: {
								margin: 20,
							},
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
				: this.renderModal(modal))
		);
	}
}

interface StateProps {
	modal: AppModule.Modals.Modal | null;
}

interface DispatchProps {
	closeModal: () => any;
	addModule: (modType: ModuleType) => any;
	addBus: () => any;
	openNodePicker: () => any;
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

			// HACK: Automatically connect all inlets to default bus (-1);
			const mod = videoModules[modType];
			if (mod.inlets != null) {
				Object.keys(mod.inlets.uniformMappings).forEach(inletKey => {
					dispatch(Graph.actions.setInletConnection(
						nodeKey,
						inletKey,
						-1));
				});
			}
		},
		addBus: () => dispatch(Graph.actions.addBus()),
		openNodePicker: () => dispatch(AppModule.actions.setModal(AppModule.Modals.PICK_MODULE)),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(App);

