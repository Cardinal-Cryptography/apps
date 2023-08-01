// Copyright 2017-2023 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { PayoutStash } from './types.js';

import React, { useEffect, useState } from 'react';

import { AddressSmall, Table } from '@azero.dev/react-components';

import { createErasString } from './util.js';

interface Props {
  className?: string;
  payout: PayoutStash;
}

interface EraInfo {
  eraStr: React.ReactNode;
  oldestEra?: BN;
}

function Stash ({ className = '', payout: { available, rewards, stashId } }: Props): React.ReactElement<Props> {
  const [{ eraStr }, setEraInfo] = useState<EraInfo>({ eraStr: '' });

  useEffect((): void => {
    rewards && setEraInfo({
      eraStr: createErasString(rewards.map(({ era }) => era)),
      oldestEra: rewards[0]?.era
    });
  }, [rewards]);

  return (
    <tr className={className}>
      <td
        className='address'
        colSpan={2}
      >
        <AddressSmall value={stashId} />
      </td>
      <td className='start'>
        <span className='payout-eras'>{eraStr}</span>
      </td>
      <Table.Column.Balance value={available} />
      <td className='number' />
      <td
        className='button'
        colSpan={3}
      />
    </tr>
  );
}

export default React.memo(Stash);
