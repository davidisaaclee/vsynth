import { mapValues } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import VideoGraphView from '@davidisaaclee/react-video-graph';
import { createProgramWithFragmentShader } from '@davidisaaclee/video-graph';
import { State } from './modules';
import { actions } from './modules/graph';
import { SimpleVideoGraph } from './model/SimpleVideoGraph';
import {
	modules as videoModules, VideoModule,
	videoGraphFromSimpleVideoGraph, RuntimeModule
} from './model/Kit';
import './App.css';

const e = React.createElement;

interface StateProps {
	graph: SimpleVideoGraph;
	outputNodeKey: string | null;
}

interface DispatchProps {
	updateGraph: (gl: WebGLRenderingContext) => any;
}

type Props = StateProps & DispatchProps;

class App extends React.Component<Props, any> {

	private gl: WebGLRenderingContext | null = null;
	private modulesRuntime: { [moduleKey: string]: RuntimeModule } = {};

  public render() {
		const {
			graph, outputNodeKey,
		} = this.props;

		return e('div',
			{},
			[
				e(VideoGraphView,
					{
						key: 'screen',
						graph: (this.gl == null
							? { nodes: {}, edges: {} }
							: videoGraphFromSimpleVideoGraph(
								graph,
								this.modulesRuntime,
								0,
								this.gl
							)),
						outputNodeKey,
						runtimeUniforms: {},
						glRef: (gl: WebGLRenderingContext) => {
							if (this.gl == null && gl != null) {
								this.setup(gl);
							}
						},
						style: {
							width: '100vw',
							height: '100vh',
							display: 'block'
						}
					}),
			]);
  }

	private setup(gl: WebGLRenderingContext) {
		this.gl = gl;
		this.props.updateGraph(gl);
		this.modulesRuntime = mapValues(videoModules, (mod: VideoModule): RuntimeModule => ({
			program: createProgramWithFragmentShader(gl, mod.shaderSource)
		}));
		this.forceUpdate();
	}
}

function mapStateToProps(state: State): StateProps {
	return {
		graph: state.graph.graph,
		outputNodeKey: state.graph.outputNodeKey,
	};
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {
		updateGraph: (gl: WebGLRenderingContext) => dispatch(actions.buildGraph(gl)),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(App);

