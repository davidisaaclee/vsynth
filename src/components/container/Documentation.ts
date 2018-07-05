import * as React from 'react';
import * as Markdown from 'react-markdown';
import styled from '../../styled-components';

const e = React.createElement;

const Container = styled.div`
	color: white;
`;

const Section = styled.section`
`;

const Title = styled.h1`
`;

const Body = styled(Markdown).attrs({
	renderers: {
		link: (props: object) => e('a', { ...props, target: '_blank' })
	}
})`
`;

const sections = [
	{
		key: 'what',
		title: 'What is this?',
		body: `
_vsynth_ is a modular video synthesizer in the web browser. You can use it to program unique visual effects.
		`,
	},
];

const Documentation: React.StatelessComponent<{}> = () => (
	e(Container,
		{},
		sections.map(({ key, title, body }) =>
			e(Section, { key },
				e(Title, {}, title),
				e(Body, { source: body })))));

export default Documentation;

