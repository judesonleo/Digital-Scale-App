import styled, { keyframes } from "styled-components";

interface CardProps {
	theme: "light" | "dark";
}

export const Card = styled.div<CardProps>`
	background-color: ${({ theme }) => theme[theme].background};
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	padding: 16px;
	transition: box-shadow 0.3s ease;

	&:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
`;
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const FadeInAnimation = styled.div`
	animation: ${fadeIn} 0.5s ease;
`;
