// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { INumber } from '@polkadot/types/types';
import type { u32 } from '@polkadot/types-codec';
import type { FutureCommittee } from '../Performance/useFutureSessionCommittee.js';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getCommitteeManagement } from '@polkadot/react-api/getCommitteeManagement';
import {
  Button,
  CardSummary,
  InputAddressSimple,
  Spinner,
  SummaryBox,
  Table,
  ToggleGroup
} from '@polkadot/react-components';
import { useApi, useCall, useLenientThresholdPercentage, useNextTick } from '@polkadot/react-hooks';

import Address from '../Performance/Address/index.js';
import { calculatePercentReward } from '../Performance/BlockProductionCommitteeList.js';
import useSessionCommitteePerformance from '../Performance/useCommitteePerformance.js';
import useFutureSessionCommittee from '../Performance/useFutureSessionCommittee.js';
import useSessionInfo from '../Performance/useSessionInfo.js';
import { useTranslation } from '../translate.js';
import Validator from './Validator.js';

interface Props {
  className?: string;
}

function doQuery (validatorId?: string | null): void {
  if (validatorId) {
    window.location.hash = `/staking/query/${validatorId}`;
  }
}

function Query ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const { value } = useParams<{ value: string }>();
  const [validatorId, setValidatorId] = useState<string | null>(value || null);
  const underperformedValidatorSessionCount = useCall<u32>(
    getCommitteeManagement(api).query.underperformedValidatorSessionCount,
    [value]
  );
  const lenientThresholdPercentage = useLenientThresholdPercentage();

  const sessionInfo = useSessionInfo();
  const isNextTick = useNextTick();

  const groups = [
    { text: t('Past performance'), value: 'past' },
    { text: t('Future committees'), value: 'future' },
  ];
  const [groupIndex, setGroupIndex] = useState(1);

  function range (size: number, startAt = 0) {
    return [...Array(size).keys()].map((i) => i + startAt);
  }

  const isAlephChain = useMemo(() => {
    return api.runtimeChain.toString().includes('Aleph Zero');
  }, [api]
  );

  const pastSessions = useMemo(() => {
    if (sessionInfo) {
      const maxSessionQueryDepth = 4 * sessionInfo.historyDepth;

      const minSessionNumber = Math.max(sessionInfo.minimumSessionNumber, sessionInfo.currentSession - maxSessionQueryDepth);
      const queryDepth = sessionInfo.currentSession - minSessionNumber;

      return range(queryDepth, sessionInfo.currentSession - queryDepth).reverse();
    }

    return [];
  }, [sessionInfo]
  );

  const sessionCommitteePerformance = useSessionCommitteePerformance(pastSessions);

  const filteredSessionPerformances = useMemo(() => {
    return sessionCommitteePerformance.map(({ expectedBlockCount, performance, sessionId }) => {
      return performance.filter((performance) => performance.accountId === value).map((performance) => {
        return [performance.blockCount, sessionId, expectedBlockCount];
      });
    }).flat();
  },
  [sessionCommitteePerformance, value]);

  const numberOfNonZeroPerformances = useMemo(() => {
    return sessionCommitteePerformance.filter(({ performance }) =>
      performance.length).length;
  },
  [sessionCommitteePerformance]);

  const futureSessions = useMemo(() => {
    if (sessionInfo) {
      return range(sessionInfo.maximumSessionNumber - sessionInfo.currentSession + 1, sessionInfo.currentSession);
    }

    return [];
  }, [sessionInfo]);

  const list = useMemo(
    () => isNextTick
      ? filteredSessionPerformances
      : [],
    [isNextTick, filteredSessionPerformances]
  );

  const eras = useCall<INumber[]>(api.derive.staking.erasHistoric);

  const labels = useMemo(
    () => eras?.map((e) => e.toHuman() as string),
    [eras]
  );

  const _onQuery = useCallback(
    () => doQuery(validatorId),
    [validatorId]
  );

  const headerRef = useRef<[string, string, number?][]>(
    [
      [t('session performance in last 4 eras'), 'start', 1],
      [t('session'), 'expand'],
      [t('blocks created'), 'expand'],
      [t('max % reward'), 'expand']
    ]
  );

  const futureSessionCommittee = useFutureSessionCommittee(futureSessions);
  const filteredSessionCommittee: FutureCommittee[] = useMemo(() => {
    if (value) {
      return futureSessionCommittee.filter((committee) => committee !== undefined && committee.blockProducers.includes(value));
    }

    return [];
  }, [futureSessionCommittee, value]);

  const futureSessionsList: FutureCommittee[] = useMemo(
    () => isNextTick
      ? filteredSessionCommittee
      : [],
    [isNextTick, filteredSessionCommittee]
  );

  const headerRefFutureCommittee = useRef<[string, string, number?][]>(
    [
      [t('future committee sessions'), 'start', 1],
      [t('session'), 'expand'],
      [t('blocks created'), 'expand'],
      [t('max % reward'), 'expand']
    ]
  );

  if (!labels) {
    return <Spinner />;
  }

  return (
    <div className={className}>
      <InputAddressSimple
        className='staking--queryInput'
        defaultValue={value}
        label={t('validator to query')}
        onChange={setValidatorId}
        onEnter={_onQuery}
      >
        <Button
          icon='play'
          isDisabled={!validatorId}
          onClick={_onQuery}
        />
      </InputAddressSimple>
      {/*TODO: this is not displayed very well in UI, add some style*/}
      {value && !!isAlephChain &&
        <ToggleGroup
          onChange={setGroupIndex}
          options={groups}
          value={groupIndex}
        />
      }
      {value && !!isAlephChain && groupIndex == 0 &&
      <SummaryBox className={className}>
        <CardSummary label={t('Underperformed Session Count')}>
          {underperformedValidatorSessionCount?.toString()}
        </CardSummary>
      </SummaryBox>
      }
      {value && !!isAlephChain && groupIndex == 0 &&
      <Table
        className={className}
        empty={numberOfNonZeroPerformances === pastSessions.length && <div>{t('No entries found')}</div>}
        emptySpinner={
          <>
            {(numberOfNonZeroPerformances !== pastSessions.length) && <div>{t('Querying past performances')}</div>}
          </>
        }
        header={headerRef.current}
      >
        {list?.map((performance): React.ReactNode => (
          <Address
            address={value}
            blocksCreated={performance[0]}
            filterName={''}
            key={performance[1]}
            rewardPercentage={calculatePercentReward(performance[0], performance[2], lenientThresholdPercentage, true)}
            session={performance[1]}
          />
        ))}
      </Table>}
       {value && !!isAlephChain && groupIndex == 1 &&
        <Table
          className={className}
          empty={filteredSessionCommittee.length === futureSessions.length && <div>{t('No entries found')}</div>}
          emptySpinner={
            <>
              {(filteredSessionCommittee.length !== pastSessions.length) && <div>{t('Querying future sessions')}</div>}
            </>
          }
          header={headerRefFutureCommittee.current}
        >
          {futureSessionsList?.map((committee): React.ReactNode => (
            <Address
              address={value}
              filterName={''}
              blocksCreated={0}
              rewardPercentage={"0.0"}
              key={committee.session}
              session={committee.session}
            />
          ))}
        </Table>}

      {value && (
        <Validator
          labels={labels}
          validatorId={value}
        />
      )}
    </div>
  );
}

export default React.memo(Query);
