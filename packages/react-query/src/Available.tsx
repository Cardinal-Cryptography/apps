// Copyright 2017-2023 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import React from 'react';

import { useApi, useCall } from '@azero.dev/react-hooks';

import FormatBalance from './FormatBalance.js';

interface Props {
  children?: React.ReactNode;
  className?: string;
  label?: React.ReactNode;
  params?: AccountId | AccountIndex | Address | string | Uint8Array | null;
}

function AvailableDisplay ({ children, className = '', label, params }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const allBalances = useCall<DeriveBalancesAll>(api.derive.balances?.all, [params]);

  return (
    <FormatBalance
      className={className}
      label={label}
      value={allBalances?.availableBalance}
    >
      {children}
    </FormatBalance>
  );
}

export default React.memo(AvailableDisplay);
