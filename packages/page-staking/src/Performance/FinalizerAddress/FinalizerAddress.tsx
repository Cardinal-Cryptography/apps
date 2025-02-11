// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import React, { useCallback, useMemo } from 'react';

import { AddressSmall, Badge, Icon } from '@polkadot/react-components';
import { checkVisibility } from '@polkadot/react-components/util';
import { useAddressToDomain, useApi, useDeriveAccountInfo } from '@polkadot/react-hooks';

interface Props {
  address: string;
  filterName: string;
  scoresEnabled: boolean;
  abftScore?: number,
}

function useAddressCalls (_api: ApiPromise, address: string) {
  const accountInfo = useDeriveAccountInfo(address);

  return { accountInfo };
}

function queryAddress (address: string) {
  window.location.hash = `/staking/query/${address}`;
}

function FinalizerAddress ({ abftScore, address, filterName, scoresEnabled }: Props): React.ReactElement<Props> | null {
  const { api } = useApi();
  const { accountInfo } = useAddressCalls(api, address);
  const { primaryDomain: domain } = useAddressToDomain(address);

  const isVisible = useMemo(
    () => accountInfo ? checkVisibility(api, address, { ...accountInfo, domain }, filterName) : true,
    [api, accountInfo, address, domain, filterName]
  );

  const onQueryStats = useCallback(
    () => queryAddress(address),
    [address]
  );

  const hoverText = useMemo(() => {
    if (abftScore !== undefined) {
      return abftScore === 1
        ? '1 unit behind'
        : `${abftScore} units behind`;
    }

    return null;
  }, [abftScore]);

  if (!isVisible) {
    return null;
  }

  return (
    <tr>
      <td className='address'>
        <AddressSmall value={address} />
      </td>
      <td className='number'>
        {!scoresEnabled && 'scores are not enabled'}
        {scoresEnabled && abftScore === undefined && 'scores not yet aggregated'}
        {abftScore !== undefined && abftScore <= 4 &&
          <Badge
            color={'green'}
            hover={hoverText}
            icon={'check'}
          />}
        {abftScore !== undefined && abftScore > 4 && abftScore <= 11 &&
          <Badge
            color={'orange'}
            hover={hoverText}
            icon={'warning'}
          />}
        {abftScore !== undefined && abftScore > 11 &&
          <Badge
            color={'red'}
            hover={hoverText}
            icon={'skull'}
          />}
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

export default React.memo(FinalizerAddress);
