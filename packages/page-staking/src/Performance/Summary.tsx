// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EraValidatorPerformance } from './Performance.js';

import React, { useMemo } from 'react';

import { CardSummary, styled, SummaryBox } from '@polkadot/react-components';
import { formatNumber } from '@polkadot/util';

import { useTranslation } from '../translate.js';

interface Props {
  className?: string;
  eraValidatorPerformances: EraValidatorPerformance[];
  expectedBlockCount?: number;
}

function Summary (
  { className = '',
    eraValidatorPerformances,
    expectedBlockCount }: Props
): React.ReactElement<Props> {
  const { t } = useTranslation();
  const committeeLength = useMemo(() => {
    return eraValidatorPerformances.filter((perf) => perf.isCommittee).length;
  }, [eraValidatorPerformances]
  );

  return (
    <SummaryBox className={className}>
      <section>
        <CardSummary label={t('block production committee size')}>
          {formatNumber(committeeLength)}
        </CardSummary>
        {expectedBlockCount !== undefined &&
            <CardSummary label={t('expected block count')}>
              {formatNumber(expectedBlockCount)}
            </CardSummary>
        }
      </section>
    </SummaryBox>
  );
}

export default React.memo(styled(Summary)`
  .validator--Account-block-icon {
    display: inline-block;
    margin-right: 0.75rem;
    margin-top: -0.25rem;
    vertical-align: middle;
  }

  .validator--Summary-authors {
    .validator--Account-block-icon+.validator--Account-block-icon {
      margin-left: -1.5rem;
    }
  }
`);
