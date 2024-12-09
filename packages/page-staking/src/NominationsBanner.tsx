// Copyright 2017-2024 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { MarkWarning } from '@polkadot/react-components';

import { useTranslation } from './translate.js';

function ElectionBanner (): React.ReactElement<null> | null {
  const { t } = useTranslation();

  return (
    <MarkWarning
      className='warning centered'
      content={t('On December 16th, the Mainnet decentralizes as 9 AZF nodes are replaced by community validators in the block finalization committee. If you’re staking with an AZF node, switch to a Community Validator to keep earning rewards!')}
    />
  );
}

export default React.memo(ElectionBanner);
