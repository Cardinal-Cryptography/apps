// Copyright 2017-2023 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { MarkWarning } from '@azero.dev/react-components';

import { useTranslation } from './translate.js';

interface Props {
  isInElection?: boolean;
}

function ElectionBanner ({ isInElection }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();

  if (!isInElection) {
    return null;
  }

  return (
    <MarkWarning
      className='warning centered'
      content={t<string>('There is currently an ongoing election for new validator candidates. As such staking operations are not permitted.')}
    />
  );
}

export default React.memo(ElectionBanner);
