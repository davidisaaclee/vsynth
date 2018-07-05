import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Editor from './components/container/Editor';
import './App.css';

const e = React.createElement;

const App: React.StatelessComponent<object> = () => (
	e(Router,
		{},
		e('div', {},
			e(Route,
				{
					exact: true,
					path: '/',
					component: Editor
				}),
			e(Route,
				{
					path: '/help',
					render: () => e('span', {}, 'help')
				}))));

export default App;

