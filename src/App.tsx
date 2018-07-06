import * as React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Editor from './components/container/Editor';
import Documentation from './components/container/Documentation';
import './App.css';

const e = React.createElement;

console.log(process.env.PUBLIC_URL);

const App: React.StatelessComponent<object> = () => (
	e(Router,
		{
			basename: (process.env.PUBLIC_URL === '.'
				? undefined
				: process.env.PUBLIC_URL!.substr(`${window.location.protocol}//${window.location.host}`.length)),
		},
		e(Switch, {},
			e(Route,
				{
					path: '/docs',
					component: Documentation
				}),
			e(Route,
				{
					path: '/',
					component: Editor
				}),
		)));

export default App;

