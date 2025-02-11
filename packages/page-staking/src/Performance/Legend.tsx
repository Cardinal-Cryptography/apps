// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { Badge, styled } from '@polkadot/react-components';

interface Props {
  className?: string;
}

function Legend ({ className }: Props): React.ReactElement<Props> {
  return (
    <StyledDiv className={className}>
      <span>
        <Badge
          color='green'
          hover='no more than 4 units behind'
          icon='check'
        />
        <span>{'Ideal performance'}</span>
      </span>
      <span>
        <Badge
          color='orange'
          hover='from 4 to 11 units behind'
          icon='warning'
        />
        <span>{'acceptable performance'}</span>
      </span>
      <span>
        <Badge
          color='red'
          hover='more than 11 units behind'
          icon='skull'
        />
        <span>{'under-performance'}</span>
      </span>
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  font-size: var(--font-size-small);
  padding: 1rem 0.5rem;
  text-align: center;

  .ui--Badge, .ui--Tag {
    margin-right: 0.5rem;
  }

  span {
    vertical-align: middle;

    * {
      vertical-align: middle;
    }

    + span {
      margin-left: 1rem;
    }
  }
`;

export default React.memo(Legend);
