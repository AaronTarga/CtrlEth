import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import './prism.css';
import loadHighlighter from '../lib/highlighSolidity';

type CodeProps = {
  code: string;
  language: string;
};

const StyledSection = styled.section`
  margin: 0 auto;
  width: 90%;
  display: inline-block;
  max-height: 100%;
  overflow: auto;
`;

const StyledPre = styled.pre`
  text-align: left;
  max-height: inherit;
`;

export default function Code({ code, language }: CodeProps) {
  const codeElement = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (codeElement.current) {
      const Prism = loadHighlighter();

      Prism.highlightElement(codeElement.current);
    }
  }, []);
  return (
    <StyledSection>
      <StyledPre>
        <code ref={codeElement} className={`lang-${language}`}>
          {code}
        </code>
      </StyledPre>
    </StyledSection>
  );
}
