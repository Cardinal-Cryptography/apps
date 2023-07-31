// Copyright 2017-2023 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveProposalExternal } from '@polkadot/api-derive/types';

import React, { useRef } from 'react';

import { Table } from '@azero.dev/react-components';
import { useApi, useCall } from '@azero.dev/react-hooks';

import { useTranslation } from '../translate.js';
import External from './External.js';

interface Props {
  className?: string;
}

function Externals ({ className }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const { api } = useApi();
  const external = useCall<DeriveProposalExternal | null>(api.derive.democracy.nextExternal);

  const headerRef = useRef<([React.ReactNode?, string?, number?] | false)[]>([
    [t<string>('external'), 'start'],
    [t<string>('proposer'), 'address'],
    [t<string>('locked')],
    []
  ]);

  return (
    <Table
      className={className}
      empty={external === null && t<string>('No external proposal')}
      header={headerRef.current}
    >
      {external && <External value={external} />}
    </Table>
  );
}

export default React.memo(Externals);
