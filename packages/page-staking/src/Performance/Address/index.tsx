// Copyright 2017-2022 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useMemo } from 'react';

import { ApiPromise } from '@polkadot/api';
import { AddressSmall, Icon, Spinner } from '@polkadot/react-components';
import { checkVisibility } from '@polkadot/react-components/util';
import { useApi, useDeriveAccountInfo } from '@polkadot/react-hooks';

interface Props {
  address: string;
  filterName: string;
  session?: number;
  blocksCreated?: number,
  blocksTarget: number,
  rewardPercentage?: string,
}

function useAddressCalls (api: ApiPromise, address: string) {
  const accountInfo = useDeriveAccountInfo(address);

  return { accountInfo };
}


function Address ({ address, blocksCreated, blocksTarget, filterName, rewardPercentage, session }: Props): React.ReactElement<Props> | null {
  const { api } = useApi();
  const { accountInfo } = useAddressCalls(api, address);

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
        {blocksCreated ?? <Spinner noLabel={true} />}
      </td>
    </tr>
  );
}

export default React.memo(Address);
