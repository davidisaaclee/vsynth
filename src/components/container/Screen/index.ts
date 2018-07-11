import { mapValues } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import VideoGraphView from '@davidisaaclee/react-video-graph';
import { empty as emptyGraph } from '@davidisaaclee/graph';
import { State as RootState } from '../../../modules';
import { SimpleVideoGraph, videoGraphFromSimpleVideoGraph } from '../../../model/SimpleVideoGraph';
import { RuntimeModule, runtimeModuleFromShaderModule } from '../../../model/RuntimeModule';
import * as Kit from '../../../model/Kit';
import { resetSharedTextureCache, getSharedTextureCache } from '../../../utility/textureCache';
import * as selectors from './selectors';

const e = React.createElement;

interface StateProps {
	graph: SimpleVideoGraph;
	outputNodeKey: string | null;
	editHash: string;
}

interface DispatchProps {
}

interface OwnProps extends React.HTMLAttributes<HTMLDivElement> {
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
	private modulesRuntime: Record<Kit.ShaderModuleType, RuntimeModule> | null = null;

	public componentDidMount() {
		this.setState({
			isAnimating: true,
			animationStartTime: Date.now()
		}, this.frame);
	}

	public shouldComponentUpdate(nextProps: Props, nextState: State) {
		return this.state.frameIndex !== nextState.frameIndex;
	}

  public render() {
		const {
			graph, outputNodeKey, editHash,
			...restProps
		} = this.props;

		const textureCache = getSharedTextureCache();

		return e('div',
			restProps,
			e(VideoGraphView,
				{
					realToCSSPixelRatio: 1,
					graph: ((this.gl == null || this.modulesRuntime == null)
						? emptyGraph()
						: videoGraphFromSimpleVideoGraph(
							graph,
							editHash,
							this.modulesRuntime,
							this.gl)),
					outputNodeKey,
					getReadTextureForNode: (textureCache == null
						? () => { throw new Error("Attempted to read texture before cache was initialized") }
						: (key: string) => textureCache.getReadTextureForNode(key, this.state.frameIndex)),
					getWriteTextureForNode: (textureCache == null
						? () => { throw new Error("Attempted to read texture before cache was initialized") }
						: (key: string) => textureCache.getWriteTextureForNode(key, this.state.frameIndex)),
					glRef: this.onGLRef,
					style: {
						width: '100vw',
						height: '100vh',
						display: 'block'
					}
				}));
  }

	private setup(gl: WebGLRenderingContext) {
		this.gl = gl;
		this.modulesRuntime = mapValues(
			Kit.shaderModules,
			shaderModule => runtimeModuleFromShaderModule(gl, shaderModule)) as Record<Kit.ShaderModuleType, RuntimeModule>;

		resetSharedTextureCache(gl);

		this.forceUpdate();
	}

	private frame = () => {
		if (!this.state.isAnimating || this.state.animationStartTime == null) {
			return;
		}

		// TODO: This is decoupling the real framerate from Constants.fps (using whatever
		// is provided by requestAnimationFrame).
		this.setState(prevState => ({
			frameIndex: prevState.frameIndex + 1
		}));

		window.requestAnimationFrame(this.frame);
	}

	private onGLRef = (gl: WebGLRenderingContext) => {
		if (this.gl == null && gl != null) {
			this.setup(gl);
		}
	}
}

function mapStateToProps(state: RootState): StateProps {
	return {
		graph: selectors.graph(state),
		outputNodeKey: selectors.outputNodeKey(state),
		editHash: selectors.editHash(state),
	};
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
	return {};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Screen);

