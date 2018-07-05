import styled from '../../../styled-components';

export const List = styled.ul`
	height: 100%;

	display: flex;
	padding: 0;
	margin: 0;

	flex-flow: row nowrap;
	align-items: center;
	justify-content: flex-end;
`;

export const Item = styled.li`
	list-style-type: none;
	margin: 0 10px;
`

export const Button = styled.button`
	font-size: 11px;

	border: 2px solid white;
	outline: 1px solid black;
	padding: 1em;

	background-color: rgba(255, 255, 255, 0.7);
	color: black;

	&:hover {
		background-color: rgba(255, 255, 255, 1);
	}
`;

export const Link = styled.a`
	display: inline-block;
	box-sizing: border-box;

	border: 2px solid white;
	outline: 1px solid black;
	padding: 1em;

	text-align: center;
	font-size: 11px;
	background-color: rgba(255, 255, 255, 0.7);
	color: black;

	&:hover {
		background-color: rgba(255, 255, 255, 1);
	}
`;

