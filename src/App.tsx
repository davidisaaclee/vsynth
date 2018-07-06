import * as React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Editor from './components/container/Editor';
import Documentation from './components/container/Documentation';
import './App.css';

const e = React.createElement;

const App: React.StatelessComponent<object> = () => (
	e(Router,
		{ basename: process.env.PUBLIC_URL, },
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

