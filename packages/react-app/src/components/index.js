import styled from "styled-components";

export const Header = styled.header`
  background-color: black;
  min-height: 70px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  color: white;
`;

export const Body = styled.body`
  align-items: center;
  background-color: black;
  color: white;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  justify-content: center;
  min-height: calc(100vh - 70px);
`;

export const Image = styled.img`
  height: 40vmin;
  margin-bottom: 16px;
  pointer-events: none;
`;

export const Link = styled.a.attrs({
  target: "_blank",
  rel: "noopener noreferrer",
})`
  color: #61dafb;
  margin-top: 10px;
`;

export const Button = styled.button`
  background: transparent linear-gradient(270deg, #8f4198 0%, #eb008b 100%) 0 0 no-repeat padding-box;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  text-decoration: bold;
  margin: 0px 3px;
  padding: 8px 24px;

  ${props => props.hidden && "hidden"} :focus {
    border: none;
    outline: none;
  }
`;

export const Actions = styled.div`
  border: none;
  display: flex;
  justify-content: center;
  padding: 3px;
  clear: none; 
`;

export const TokenBalance = styled.p`
  color: white;
  font-size: 16px;
  text-align: center;
  text-decoration: bold;
`;