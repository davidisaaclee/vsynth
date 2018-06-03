import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { State } from './modules';
import { actions } from './modules/graph';

interface Props {
	counter: number;
	increment: () => any;
}

class App extends React.Component<Props, any> {
  public render() {
    return (
      <div className="App">
				{this.props.counter}
				<button onClick={this.props.increment}>
					Increment
				</button>
      </div>
    );
  }
}

function mapStateToProps(state: State): any {
	return {
		counter: state.graph.counter,
	};
}

function mapDispatchToProps(dispatch: Dispatch): any {
	return {
		increment: () => dispatch(actions.increment(1)),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(App);

