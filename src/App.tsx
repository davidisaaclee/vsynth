import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { VideoGraph } from '@davidisaaclee/video-graph';
import VideoGraphView from '@davidisaaclee/react-video-graph';
import { State } from './modules';
import { actions } from './modules/graph';
import './App.css';

const e = React.createElement;

interface Props {
	graph: VideoGraph;
	outputNodeKey: string | null;
	updateGraph: (gl: WebGLRenderingContext) => any;
}

class App extends React.Component<Props, any> {

	private gl: WebGLRenderingContext | null = null;

  public render() {
		const {
			graph, outputNodeKey, updateGraph,
		} = this.props;

		return e('div',
			{},
			[
				e(VideoGraphView,
					{
						key: 'screen',
						graph,
						outputNodeKey,
						runtimeUniforms: {},
						glRef: (gl: WebGLRenderingContext) => {
							if (this.gl == null) {
								this.gl = gl;
								if (gl != null) {
									updateGraph(gl);
								}
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
}

function mapStateToProps(state: State): any {
	return {
		graph: state.graph.graph,
		outputNodeKey: state.graph.outputNodeKey,
	};
}

function mapDispatchToProps(dispatch: Dispatch): any {
	return {
		updateGraph: (gl: WebGLRenderingContext) => dispatch(actions.buildGraph(gl)),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(App);

