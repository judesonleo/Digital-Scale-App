import styled, { keyframes } from "styled-components";

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
