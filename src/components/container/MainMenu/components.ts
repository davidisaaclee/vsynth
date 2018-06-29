import styled from '../../../styled-components';

export const List = styled.ul`
	height: 100%;

	display: flex;
	padding: 0;
	margin: 0;

	flex-flow: column nowrap;
	align-items: stretch;
	justify-content: space-around;
`;

export const Item = styled.li`
	list-style-type: none;
	height: 20%;
`

export const Button = styled.button`
	width: 100%;
	height: 100%;

	border: 2px solid white;
	outline: 1px solid black;
	padding: 0;

	background-color: rgba(255, 255, 255, 0.7);
	color: black;
	font-size: 16pt;

	&:hover {
		background-color: rgba(255, 255, 255, 1);
	}
`;

