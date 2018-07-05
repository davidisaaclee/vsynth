import * as React from 'react';
import Editor from './components/container/Editor';
import './App.css';

const e = React.createElement;

const App: React.StatelessComponent<object> = props => (
	e(Editor)
);

export default App;

