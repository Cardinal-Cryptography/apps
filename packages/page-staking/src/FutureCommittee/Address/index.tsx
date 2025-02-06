// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useMemo } from 'react';

import { AddressSmall, Badge, Icon } from '@polkadot/react-components';
import { checkVisibility } from '@polkadot/react-components/util';
import { useAddressToDomain, useApi, useDeriveAccountInfo } from '@polkadot/react-hooks';

interface Props {
  address: string;
  currentSessionCommittee: boolean;
  filterName: string;
  nextSessionInCommittee?: number;
}

function useAddressCalls (address: string) {
  const accountInfo = useDeriveAccountInfo(address);

  return { accountInfo };
}

function queryAddress (address: string) {
  window.location.hash = `/staking/query/${address}`;
}

function Address ({ address, currentSessionCommittee, filterName, nextSessionInCommittee }: Props): React.ReactElement<Props> | null {
  const { api } = useApi();
  const { accountInfo } = useAddressCalls(address);
  const { primaryDomain: domain } = useAddressToDomain(address);

  const isVisible = useMemo(
    () => accountInfo ? checkVisibility(api, address, { ...accountInfo, domain }, filterName) : true,
    [api, accountInfo, address, domain, filterName]
  );

  const onQueryStats = useCallback(
    () => queryAddress(address),
    [address]
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
        <Badge
          color={currentSessionCommittee ? 'green' : 'transparent'}
          icon={currentSessionCommittee ? 'check' : undefined}
        />
      </td>
      <td className='number'>
        {nextSessionInCommittee}
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
