// Copyright 2017-2023 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import React, { useCallback, useMemo } from 'react';

import { AddressSmall, Icon } from '@polkadot/react-components';
import { checkVisibility } from '@polkadot/react-components/util';
import { useAddressToDomain, useApi, useDeriveAccountInfo } from '@polkadot/react-hooks';

interface Props {
  address: string;
  era: number;
  suspensionReason: string;
  filterName: string,
  suspensionLiftsInEra: number,
}

function useAddressCalls (_api: ApiPromise, address: string) {
  const accountInfo = useDeriveAccountInfo(address);

  return { accountInfo };
}

function queryAddress (address: string) {
  window.location.hash = `/staking/query/${address}`;
}

function Address ({ address, era, filterName, suspensionLiftsInEra, suspensionReason }: Props): React.ReactElement<Props> | null {
  const { api } = useApi();
  const { accountInfo } = useAddressCalls(api, address);
  const { primaryDomain: domain } = useAddressToDomain(address);

  const onQueryStats = useCallback(
    () => queryAddress(address),
    [address]
  );

  const isVisible = useMemo(
    () => accountInfo ? checkVisibility(api, address, { ...accountInfo, domain }, filterName) : true,
    [api, accountInfo, address, domain, filterName]
  );

  if (!isVisible) {
    return null;
  }

  return (
    <tr>
      <td className='address'>
        <AddressSmall value={address} />
      </td>
      <td className='number'>
        {era}
      </td>
      <td className='number'>
        {suspensionLiftsInEra}
      </td>
      <td className='number'>
        {suspensionReason}
      </td>
      <td className='number'>
        <Icon
          className='staking--stats highlight--color'
          icon='chart-line'
          onClick={onQueryStats}
        />
      </td>
    </tr>
  );
}

export default React.memo(Address);
