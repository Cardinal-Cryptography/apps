// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import React, { useCallback, useMemo } from 'react';

import { AddressSmall, Icon, Spinner } from '@polkadot/react-components';
import { checkVisibility } from '@polkadot/react-components/util';
import { useAddressToDomain, useApi, useDeriveAccountInfo } from '@polkadot/react-hooks';

import { useTranslation } from '../../translate.js';

interface Props {
  address: string;
  filterName: string;
  session?: number;
  blocksCreated?: number,
  rewardPercentage?: string,
  isCommittee: boolean,
  nextSessionInCommittee?: number,
}

function useAddressCalls (_api: ApiPromise, address: string) {
  const accountInfo = useDeriveAccountInfo(address);

  return { accountInfo };
}

function queryAddress (address: string) {
  window.location.hash = `/staking/query/${address}`;
}

function Address ({ address, blocksCreated, filterName, isCommittee, nextSessionInCommittee, rewardPercentage, session }: Props): React.ReactElement<Props> | null {
  const { api } = useApi();
  const { t } = useTranslation();
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

  if (!isVisible) {
    return null;
  }

  return (
    <tr>
      <td className='address'>
        <AddressSmall value={address} />
      </td>
      {session && <td className='number'>
        {session}
      </td>}
      {isCommittee &&
        <>
          <td className='number'>
            {blocksCreated ?? <Spinner noLabel={true} />}
          </td>
          <td className='number'>
            {blocksCreated === undefined ? '' : rewardPercentage}
          </td>
        </>
      }
      {!isCommittee &&
        <>
          <td className='text-right'>
            {nextSessionInCommittee
              ? nextSessionInCommittee === -1
                ? t('Not present in any committee in the current era')
                : t('Next committee session {{session}}', { replace: { session: nextSessionInCommittee } })
              : <Spinner noLabel={true} />
            }
          </td>
          <td className='number'>
          0.0
          </td>
        </>
      }
      {!session && <td className='number'>
        <Icon
          className='staking--stats highlight--color'
          icon='chart-line'
          onClick={onQueryStats}
        />
      </td>}
    </tr>
  );
}

export default React.memo(Address);
