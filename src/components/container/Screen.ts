import { mapValues } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import VideoGraphView from '@davidisaaclee/react-video-graph';
import { empty as emptyGraph } from '@davidisaaclee/graph';
import { createProgramWithFragmentShader } from '@davidisaaclee/video-graph';
import { State as RootState } from '../../modules';
import { SimpleVideoGraph } from '../../model/SimpleVideoGraph';
import {
	modules as videoModules, VideoModule,
	videoGraphFromSimpleVideoGraph, RuntimeModule
} from '../../model/Kit';
import * as k from '../../constants';

const e = React.createElement;

interface StateProps {
	graph: SimpleVideoGraph;
	outputNodeKey: string | null;
}

interface DispatchProps {
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
	isAnimating: boolean;
	animationStartTime: number | null;
	frameIndex: number;
}

class Screen extends React.Component<Props, State> {

	public state: State = {
		isAnimating: false,
		animationStartTime: null,
		frameIndex: 0,
	};

	private gl: WebGLRenderingContext | null = null;
	private modulesRuntime: { [moduleKey: string]: RuntimeModule } = {};


	public componentDidMount() {
		this.setState({
			isAnimating: true,
			animationStartTime: Date.now()
		}, () => this.frame());
	}

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
							? emptyGraph
							: videoGraphFromSimpleVideoGraph(
								graph,
								this.modulesRuntime,
								this.state.frameIndex,
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
		this.modulesRuntime = mapValues(videoModules, (mod: VideoModule): RuntimeModule => ({
			program: createProgramWithFragmentShader(gl, mod.shaderSource)
		}));
		this.forceUpdate();
	}

	private frame() {
		if (!this.state.isAnimating || this.state.animationStartTime == null) {
			return;
		}

		const frameIndex = Math.floor(k.fps * (Date.now() - this.state.animationStartTime) / 1000);
		if (this.state.frameIndex !== frameIndex) {
			this.setState({ frameIndex });
		}

		window.requestAnimationFrame(() => this.frame());
	}
}

function mapStateToProps(state: RootState): StateProps {
	return {
		graph: state.graph.graph,
		outputNodeKey: state.graph.outputNodeKey,
	};
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return { };
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Screen);

