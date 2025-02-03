// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';

import { MarkWarning, Spinner, SummaryBox, ToggleGroup } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';

import { useTranslation } from '../translate.js';
import ActionsRow from './ActionsRow.js';
import EraValidators from './EraValidators.js';
import FinalityCommittee from './FinalityCommittee.js';
import FutureBlockProductionCommitee from './FutureBlockProductionCommitee.js';
import HistoricPerformance from './HistoricPerformance.js';
import Performance from './Performance.js';
import SummarySession from './SummarySession.js';
import useSessionInfo from './useSessionInfo.js';

export enum PerformanceTabMode {
  Past = 1,
  Current = 2,
  Future= 3,
}

function PerformancePage (): React.ReactElement {
  const { api } = useApi();
  const { t } = useTranslation();

  const groups = [
    { text: t('Era validators'), value: 'validators' },
    { text: t('Block production committee'), value: 'block' },
    { text: t('Finality committee'), value: 'finality' }
  ];

  const [groupIndex, setGroupIndex] = useState(1);

  const [inputSession, setInputSession] = useState<number | undefined>(undefined);
  const [performanceTabMode, setPerformanceTabMode] = useState<PerformanceTabMode | undefined>(undefined);

  const sessionInfo = useSessionInfo();

  useEffect(() => {
    if (sessionInfo) {
      if (!inputSession) {
        setInputSession(sessionInfo.currentSession);
        setPerformanceTabMode(PerformanceTabMode.Current);
      } else if (inputSession < sessionInfo.currentSession) {
        setPerformanceTabMode(PerformanceTabMode.Past);
      } else if (inputSession > sessionInfo.currentSession) {
        setPerformanceTabMode(PerformanceTabMode.Future);
        setGroupIndex(1);
      } else if (inputSession === sessionInfo.currentSession) {
        setPerformanceTabMode(PerformanceTabMode.Current);
      }
    }
  }, [sessionInfo, inputSession]);

  if (!api.runtimeChain.toString().includes('Aleph Zero')) {
    return (
      <MarkWarning content={'Unsupported chain.'} />
    );
  }

  if (performanceTabMode === undefined ||
      sessionInfo === undefined ||
      inputSession === undefined) {
    return (
      <Spinner label={'loading data'} />
    );
  }

  return (
    <>
      <section>
        <SummaryBox>
          <section>
            <SummarySession
              performanceTabMode={performanceTabMode}
              session={inputSession}
            />
          </section>
        </SummaryBox>
      </section>
      <section className='performance--actionsrow'>
        <ActionsRow
          maximumSessionNumber={sessionInfo.maximumSessionNumber }
          minimumSessionNumber={sessionInfo.minimumSessionNumber}
          onSessionChange={setInputSession}
          selectedSession={inputSession}
        />
      </section>
      <section>
        <>
          {performanceTabMode !== PerformanceTabMode.Future &&
          <ToggleGroup
            onChange={setGroupIndex}
            options={groups}
            value={groupIndex}
          />}
        </>
      </section>
      <section>
        {groupIndex === 0 &&
          <EraValidators
            currentSession={sessionInfo.currentSession}
            session={inputSession}
          />
        }
        {groupIndex === 1 &&
          <>
            {performanceTabMode === PerformanceTabMode.Current &&
              (<Performance
                era={sessionInfo.currentEra}
              />)
            }
          </>
        }
        {groupIndex === 1 &&
          <>
            {performanceTabMode === PerformanceTabMode.Past &&
              (<HistoricPerformance
                session={inputSession}
              />)
            }
          </>
        }
        {groupIndex === 1 &&
            <>
              {performanceTabMode === PerformanceTabMode.Future &&
                (<FutureBlockProductionCommitee
                  session={inputSession}
                />)
              }
            </>
        }
        {groupIndex === 2 &&
          <FinalityCommittee
            currentSession={sessionInfo.currentSession}
            session={inputSession}
          />
        }
      </section>
    </>
  );
}

export default React.memo(PerformancePage);
