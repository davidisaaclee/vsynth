import * as React from 'react';
import * as C from './components';
import { sections } from './content';

const e = React.createElement;


const Documentation: React.StatelessComponent<{}> = () => (
	e(C.Container,
		{},
		e(C.MainTitle, {}, 'vsynth'),
		sections.map(({ key, title, body }) =>
			e(C.Section, { key },
				e(C.Title, {}, title),
				body))));

export default Documentation;

