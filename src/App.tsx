import * as React from 'react';
import Screen from './components/container/Screen';
import './App.css';

const e = React.createElement;

class App extends React.Component {
	public render() {
		return e(Screen);
	}
}

export default App;

