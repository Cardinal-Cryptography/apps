// Copyright 2017-2024 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { MarkWarning } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';

import CurrentList from './CurrentList.js';
import useSuspensions from './Suspensions.js';

export interface SuspensionEvent {
  address: string;
  era: number;
  suspensionReason: string;
  suspensionLiftsInEra: number;
}

function SuspensionsPage (): React.ReactElement {
  const { api } = useApi();
  const suspensions = useSuspensions();

  if (!api.runtimeChain.toString().includes('Aleph Zero')) {
    return (
      <MarkWarning content={'Unsupported chain.'} />
    );
  }

  return (
    <section>
      <CurrentList
        suspensions={suspensions}
      />
    </section>
  );
}

export default React.memo(SuspensionsPage);
