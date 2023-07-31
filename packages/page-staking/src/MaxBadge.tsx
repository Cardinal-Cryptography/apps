// Copyright 2017-2023 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { Badge } from '@azero.dev/react-components';
import { useApi } from '@azero.dev/react-hooks';

interface Props {
  numNominators?: number;
}

function MaxBadge ({ numNominators }: Props): React.ReactElement<Props> | null {
  const { api } = useApi();

  const max = api.consts.staking?.maxNominatorRewardedPerValidator;

  if (!numNominators || !max || max.gten(numNominators)) {
    return null;
  }

  return (
    <Badge
      className='media--1200'
      color='red'
      icon='balance-scale-right'
    />
  );
}

export default React.memo(MaxBadge);
