// Copyright 2017-2022 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, {useCallback, useMemo, useRef, useState} from 'react';
import { useParams } from 'react-router-dom';

import {Button, InputAddressSimple, Table} from '@polkadot/react-components';

import { useTranslation } from '../translate';
import Validator from './Validator';
import useCurrentSessionInfo from "@polkadot/app-staking/Performance/useCurrentSessionInfo";
import useSessionCommitteePerformance, {ValidatorPerformance} from "@polkadot/app-staking/Performance/useCommitteePerformance";
import Address from "@polkadot/app-staking/Performance/Address";
import {calculatePercentReward} from "@polkadot/app-staking/Performance/CurrentList";
import {useLoadingDelay} from "@polkadot/react-hooks";

interface Props {
  className?: string;
}

function Query ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { value } = useParams<{ value: string }>();
  const [validatorId, setValidatorId] = useState<string | null>(value || null);

  const [currentSession, currentEra, historyDepth, minimumSessionNumber] = useCurrentSessionInfo();
  const isLoading = useLoadingDelay();

  function range(size : number, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
  }

  const pastSessions = useMemo(() => {
      if (currentSession && currentEra && historyDepth && minimumSessionNumber) {
        const maxSessionQueryDepth = 4 * historyDepth;
        const minSessionNumber = Math.max(minimumSessionNumber, currentSession - maxSessionQueryDepth);
        const queryDepth = currentSession - minSessionNumber;
        console.log(queryDepth);
        return range(queryDepth, currentSession - queryDepth);
      }
      return [];
    }, [currentSession, currentEra, historyDepth, minimumSessionNumber]
  );

  const sessionCommitteePerformance = useSessionCommitteePerformance(pastSessions);

  const filteredSessionPerformances = useMemo(() => {
      return sessionCommitteePerformance.map(({performance, sessionId}) =>
        performance.filter((performance) => performance.accountId === value).map((performance) => {
          return [performance, sessionId];
        })).flat();
  },
   [sessionCommitteePerformance]);

  const numberOfNonZeroPerformances = useMemo(() => {
      return sessionCommitteePerformance.filter(({performance}) =>
        performance.length).length;
    },
    [sessionCommitteePerformance]);

  const list = useMemo(
    () => isLoading
      ? []
      : filteredSessionPerformances,
    [isLoading, filteredSessionPerformances]
  );


  const _onQuery = useCallback(
    (): void => {
      if (validatorId) {
        window.location.hash = `/staking/query/${validatorId}`;
      }
    },
    [validatorId]
  );

  const headerRef = useRef(
    [
      [t('session performance in last 4 eras'), 'start', 1],
      [t('session'), 'expand'],
      [t('blocks created'), 'expand'],
      [t('blocks expected'), 'expand'],
      [t('max % reward'), 'expand'],
    ]
  );

  console.log("list", list);
  return (
    <div className={className}>
      <InputAddressSimple
        className='staking--queryInput'
        defaultValue={value}
        help={t<string>('Display overview information for the selected validator, including blocks produced.')}
        label={t<string>('validator to query')}
        onChange={setValidatorId}
        onEnter={_onQuery}
      >
        <Button
          icon='play'
          isDisabled={!validatorId}
          onClick={_onQuery}
        />
      </InputAddressSimple>
      {value && <Table
        className={className}
        empty={numberOfNonZeroPerformances === pastSessions.length && <div>{t<string>('No entries found')}</div>}
        emptySpinner={
          <>
            {(numberOfNonZeroPerformances !== pastSessions.length) && <div>{t<string>('Querying past performances')}</div>}
          </>
        }
        header={headerRef.current}
      >
    {list && list.map((performance): React.ReactNode => (
        <Address
          address={(performance[0] as ValidatorPerformance).accountId}
          blocksCreated={(performance[0] as ValidatorPerformance).blockCount}
          blocksTarget={(performance[0] as ValidatorPerformance).expectedBlockCount}
          filterName={''}
          key={performance[1] as number}
          session={performance[1] as number}
          rewardPercentage={calculatePercentReward((performance[0] as ValidatorPerformance).blockCount, (performance[0] as ValidatorPerformance).expectedBlockCount)}
        />
      ))}
      </Table>}

      {value && (
        <Validator validatorId={value} />
      )}
    </div>
  );
}

export default React.memo(Query);
