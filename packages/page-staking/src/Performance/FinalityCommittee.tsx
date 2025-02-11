// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useRef, useState } from 'react';

import { CardSummary, SummaryBox, Table } from '@polkadot/react-components';
import { useNextTick } from '@polkadot/react-hooks';

import Filtering from '../Filtering.js';
import { useTranslation } from '../translate.js';
import FinalizerAddress from './FinalizerAddress/FinalizerAddress.js';
import Legend from './Legend.js';
import useAbftScores from './useAbftScores.js';
import { useFinalityCommittee } from './useFinalityCommittee.js';

interface Props {
  className?: string;
  session: number;
  currentSession: number;
}

export interface Finalizer {
  accountId: string;
  abftScore?: number;
}

function FinalityCommittee ({ className, currentSession, session }: Props) {
  const { t } = useTranslation();
  const finalityCommitteeAddresses = useFinalityCommittee(session, currentSession);
  const { abftScores, scoresEnabled } = useAbftScores(session);
  const isNextTick = useNextTick();
  const [nameFilter, setNameFilter] = useState<string>('');

  const finalizers: Finalizer[] = useMemo(() => {
    if (finalityCommitteeAddresses?.length) {
      return finalityCommitteeAddresses.map((accountId, index) => {
        if (abftScores?.points.length === finalityCommitteeAddresses.length) {
          return {
            abftScore: abftScores.points.at(index)?.toNumber(),
            accountId
          };
        }

        return {
          abftScore: undefined,
          accountId
        };
      });
    }

    return [];
  }, [abftScores, finalityCommitteeAddresses]
  );

  const headerRef = useRef<[string, string, number?][]>(
    [
      [t('finalizers'), 'start', 1],
      [t('ABFT score'), 'expand'],
      [t('stats'), 'expand']
    ]
  );

  const list = useMemo(
    () => isNextTick
      ? finalizers
      : [],
    [isNextTick, finalizers]
  );

  return (
    <>
      <SummaryBox>
        <section>
          <CardSummary label={t('finality committee size')}>
            <span className={finalityCommitteeAddresses ? '' : '--tmp'}>
              {finalityCommitteeAddresses?.length ?? '0'}
            </span>
          </CardSummary>
        </section>
      </SummaryBox>
      <Table
        className={className}
        empty={
          list && t('No active finalizers found')
        }
        emptySpinner={
          <>
            {!finalizers && <div>{t('Retrieving finalizers')}</div>}
          </>
        }
        filter={
          <div className='staking--optionsBar'>
            <Filtering
              nameFilter={nameFilter}
              setNameFilter={setNameFilter}
            />
          </div>
        }
        header={headerRef.current}
        legend={<Legend />}
      >
        {list.map(({ abftScore, accountId }): React.ReactNode => (
          <FinalizerAddress
            abftScore={abftScore}
            address={accountId}
            filterName={nameFilter}
            key={accountId}
            scoresEnabled={scoresEnabled}
          />
        ))}
      </Table>
    </>
  );
}

export default FinalityCommittee;
