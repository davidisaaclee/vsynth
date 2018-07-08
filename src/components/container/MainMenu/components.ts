import styled, { css } from '../../../styled-components';

export const List = styled.ul`
	display: flex;
	padding: 0;
	margin: 0;

	flex-flow: row wrap;
	align-items: center;
	justify-content: center;
`;

export const Item = styled.li`
	list-style-type: none;
	margin: 0 10px;

	white-space: nowrap;
`;


const buttonSharedStyle = css`
	display: inline-block;
	box-sizing: border-box;

	border: 2px solid white;
	outline: 1px solid black;
	padding: 0.5em;

	font-size: 11px;
	text-align: center;
	background-color: rgba(255, 255, 255, 0.7);
	color: black;

	&:hover {
		background-color: rgba(255, 255, 255, 1);
	}
`;

export const Button = styled.button`
	${buttonSharedStyle}
`;

export const Link = styled.a`
	${buttonSharedStyle}
`;

