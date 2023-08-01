// Copyright 2017-2022 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useMemo } from 'react';

import { ApiPromise } from '@polkadot/api';
import { AddressSmall, Icon } from '@azero.dev/react-components';
import { checkVisibility } from '@azero.dev/react-components/util';
import { useApi, useDeriveAccountInfo } from '@azero.dev/react-hooks';

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

  const onQueryStats = useCallback(
    () => queryAddress(address),
    [address]
  );

  const isVisible = useMemo(
    () => accountInfo ? checkVisibility(api, address, accountInfo, filterName) : true,
    [api, accountInfo, address, filterName]
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
