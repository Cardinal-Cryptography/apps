// Copyright 2017-2023 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import styled from 'styled-components';

import Icon from './Icon';

interface Props {
  children?: React.ReactNode;
  className?: string;
  content?: React.ReactNode;
}

function MarkError ({ children, className = '', content }: Props): React.ReactElement<Props> {
  return (
    <StyledArticle className={`mark error ${className}`}>
      <Icon icon='exclamation-triangle' />{content}{children}
    </StyledArticle>
  );
}

const StyledArticle = styled.article`
  .ui--Icon {
    color: rgba(255, 12, 12, 1);
    margin-right: 0.5rem;
  }
`;

export default React.memo(MarkError);
