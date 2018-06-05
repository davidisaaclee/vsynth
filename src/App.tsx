import * as React from 'react';
import Screen from './components/container/Screen';
import RoutingMatrix from './components/container/RoutingMatrix';
import './App.css';

const e = React.createElement;

class App extends React.Component {
	public render() {
		return e('div',
			{},
			e(Screen),
			e(RoutingMatrix, {
				style: {
					left: 0,
					top: 0,
					position: 'fixed',
				}
			}),
		);
	}
}

export default App;

