// Copyright 2017-2025 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, {useMemo} from 'react';

import { CardSummary } from '@polkadot/react-components';
import { formatNumber } from '@polkadot/util';

import { useTranslation } from '../translate.js';
import {PerformanceTabMode} from "./index.js";
import useEraSessionBoundaries from "./useEraSessionBoundaries.js";

interface Props {
  className?: string;
  session: number;
  performanceTabMode: PerformanceTabMode;
}

function SummarySession ({ className, session, performanceTabMode }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const eraSessionBoundaries = useEraSessionBoundaries(session);

  const era = useMemo(() => {
    if (eraSessionBoundaries) {
      return eraSessionBoundaries.era;
    }
    return undefined;
  }, [eraSessionBoundaries]);


  const sessionLabel: string[] = [
    'past session',
    'current session',
    'future session',
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
