// Copyright 2017-2025 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { CardSummary } from '@polkadot/react-components';
import { formatNumber } from '@polkadot/util';

interface Props {
  session: number;
}

function SummarySession ({ session }: Props): React.ReactElement<Props> {
  return (
    <>
      <CardSummary label={'session'}>
                  #{formatNumber(session)}
      </CardSummary>
    </>
  );
}

export default React.memo(SummarySession);
