// Copyright 2017-2025 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { useApi, useCall } from '@polkadot/react-hooks';

import FormatBalance from './FormatBalance.js';

interface Props {
  children?: React.ReactNode;
  className?: string;
  label?: React.ReactNode;
}

function TotalIssuance ({ children, className = '', label }: Props): React.ReactElement<Props> | null {
  const { api } = useApi();
  const azeroCap = useCall<string>(api.query.aleph.azeroCap);

  return (
    <div className={className}>
      {label || ''}
      <FormatBalance
        className={azeroCap ? '' : '--tmp'}
        value={azeroCap}
        withSi
      />
      {children}
    </div>
  );
}

export default React.memo(TotalIssuance);
