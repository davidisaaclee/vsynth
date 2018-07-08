import * as ReactMarkdown from 'react-markdown';
import * as React from 'react';
import ReactPlayer from 'react-player';
import styled from '../../../styled-components';
import { deviceQueries } from '../../../utility/mediaQueries';

const e = React.createElement;

export const Container = styled.div`
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

export const MainTitle = styled.h1`
	text-align: center;
`;

export const Section = styled.section`
	font-size: 12pt;
`;

export const Title = styled.h2`
`;

export const Markdown = styled(ReactMarkdown).attrs({
	renderers: {
		link: (props: object) => e('a', { ...props, target: '_blank' })
	}
})`
`;

export const VideoPlayer = styled(ReactPlayer)`
	position: absolute;
	top: 0;
	left: 0;
`;

export const VideoAspectRatio = styled.div`
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

