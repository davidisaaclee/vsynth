import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import styled from '../../styled-components';
import { deviceQueries } from '../../utility/mediaQueries';
import ReactPlayer from 'react-player';

const e = React.createElement;

const Container = styled.div`
	max-width: 600px;
	margin: 0 auto;

	${deviceQueries.mobile`
		max-width: unset;
		margin: 1em;
	`}

	color: white;

	a {
		color: lightblue;
	}
`;

const MainTitle = styled.h1`
`;

const Section = styled.section`
`;

const Title = styled.h2`
`;

const Markdown = styled(ReactMarkdown).attrs({
	renderers: {
		link: (props: object) => e('a', { ...props, target: '_blank' })
	}
})`
`;

const VideoPlayer = styled(ReactPlayer)`
	position: absolute;
	top: 0;
	left: 0;
`;

const VideoAspectRatio = styled.div`
	--width: 80%;
	--aspect-ratio: .72815;

	${deviceQueries.mobile`
		--width: 100%;
	`}

	position: relative;
	width: var(--width);
	margin: 0 auto;

	padding-top: calc(var(--width) * var(--aspect-ratio));
`;

const sections = [
	{
		key: 'what',
		title: 'What is this?',
		body: e(Markdown, {
			source: `
[vsynth](http://david-lee.net/vsynth) is a modular video synthesizer for the web browser. You can use it to program unique visual effects.
		`}),
	},
	{
		key: 'how',
		title: 'How do I use it?',
		body: e('div', {},
			e(Markdown, {
				source: `
Great question. Here's a 5 minute screencast which will walk you through creating a simple patch.
				`
			}),
			e(VideoAspectRatio,
				{},
				e(VideoPlayer, {
					url: "https://player.vimeo.com/video/278616817",
					width: "100%",
					height: "100%",
				})))
	},
	{
		key: 'what else',
		title: 'Is there anything else like this?',
		body: e(Markdown, {
		source: `
- [Lumen](https://lumen-app.com/) - a very stylish semimodular video synth app - Mac only
- [Radiance](https://github.com/zbanks/radiance) - a modular video synth designed for creating visuals to live music
- [Cathodemer](https://store.steampowered.com/app/697860/Cathodemer/) - I haven't tried this, but seems really cool
- [Synth](https://experiments.withgoogle.com/synth) - a WebGL video synthesizer - I can't find a working link for this, unfortunately
		`
		}),
	},
];

const Documentation: React.StatelessComponent<{}> = () => (
	e(Container,
		{},
		e(MainTitle, {}, 'vsynth'),
		sections.map(({ key, title, body }) =>
			e(Section, { key },
				e(Title, {}, title),
				body))));

export default Documentation;

