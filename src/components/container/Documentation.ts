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
	text-align: center;
`;

const Section = styled.section`
	font-size: 12pt;
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
		key: 'feedback',
		title: "Something's not working!",
		body: e(Markdown, {
				source: `
If you encounter a bug, or if you want to request a feature, or if you just want to say hi, please drop a line on [this Google Form](https://docs.google.com/forms/d/e/1FAIpQLSdKup212FRe47iflRs-N7RBwRC3F1EYBm3ocN7Skf6LNB6BJw/viewform?usp=sf_link).

If you'd like to help me out, [here is the Github repo for vsynth](https://github.com/davidisaaclee/vsynth).
				`
			})
	},
	{
		key: 'pro-tips',
		title: "Any protips?",
		body: e(Markdown, {
				source: `
- __Your progress is saved when you navigate away from vsynth.__ Feel free to leave and come back later.
- __iOS users: Add vsynth to your homescreen to enable fullscreen play.__ After opening vsynth in Safari, tap the share icon in the middle of the toolbar at the bottom of the screen. Scroll through the grey icons, and tap on the action labeled \`Add to Home Screen\`.
- __To make fine adjustments to a slider, first drag down on the slider, then move the cursor left or right.__ As you increase the vertical distance between your cursor and the slider, your adjustments will become more precise.
- __Mac users: Use QuickTime Player to capture your video patches.__ You can record a portion of the screen using QuickTime Player, which comes installed on all Macs. Find QuickTime Player on your computer; open it; and click on \`File > New Screen Recording\` to begin recording your patch.
- __iOS users: Use screen recording to capture your video patches.__ Follow [these instructions](https://support.apple.com/en-us/ht207935) to enable screen recording.
				`
			})
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

