// Copyright 2017-2025 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PerformanceTabMode } from './index.js';

import React from 'react';

import { CardSummary } from '@polkadot/react-components';
import { formatNumber } from '@polkadot/util';

import { useTranslation } from '../translate.js';
import useEraSessionBoundaries from './useEraSessionBoundaries.js';

interface Props {
  className?: string;
  session: number;
  performanceTabMode: PerformanceTabMode;
}

function SummarySession ({ className, performanceTabMode, session }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  // there's a bug here that if user waits long enough not refreshing page, ie to current era + 1, then
  // displayed era in this summary would be incorrect for era + 1 sessions
  const eraSessionBoundaries = useEraSessionBoundaries(session);

  const era = eraSessionBoundaries?.era;

  const sessionLabel: string[] = [
    'past session',
    'current session',
    'future session'
  ];

  return (
    <>
      <CardSummary label={t(sessionLabel[performanceTabMode - 1])}>
                  #{formatNumber(session)}
      </CardSummary>
      <CardSummary
        className={className}
        label={t('era')}
      >
                  #{formatNumber(era)}
      </CardSummary>
    </>
  );
}

export default React.memo(SummarySession);
