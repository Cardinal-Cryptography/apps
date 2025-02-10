// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useRef, useState } from 'react';

import { Table } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';

import Filtering from '../Filtering.js';
import { useEraValidators } from '../Performance/useEraValidators.js';
import useFutureSessionCommittee from '../Performance/useFutureSessionCommittee.js';
import { useTranslation } from '../translate.js';
import useSessionValidators from '../useSessionValidators.js';
import Address from './Address/index.js';

interface Props {
  currentSession: number;
  maximumSessionNumber: number;
}

interface ListEntry {
  accountId: string;
  currentSessionCommittee: boolean;
  nextSessionInCommittee?: number;
}

function range (size: number, startAt = 0) {
  return [...Array(size).keys()].map((i) => i + startAt);
}

function FutureValidators ({ currentSession, maximumSessionNumber }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const { t } = useTranslation();

  const [nameFilter, setNameFilter] = useState<string>('');

  const sessionValidators = useSessionValidators(api);

  const eraValidatorsAddresses = useEraValidators(currentSession);
  const eraValidators = useMemo(() => {
    if (eraValidatorsAddresses && eraValidatorsAddresses.length > 0) {
      return eraValidatorsAddresses;
    }

    return [];
  }, [eraValidatorsAddresses]
  );

  const futureSessions = useMemo(() => {
    if (currentSession < maximumSessionNumber) {
      return range(maximumSessionNumber - currentSession, currentSession + 1);
    }

    return [];
  }, [currentSession, maximumSessionNumber]);
  const futureSessionCommittee = useFutureSessionCommittee(futureSessions ?? []);

  const validatorsList: ListEntry[] = useMemo(() => {
    if (futureSessionCommittee.length > 0 && sessionValidators && sessionValidators.length > 0) {
      return eraValidators.map((accountId) => {
        const nextCommittee = futureSessionCommittee.find((futureCommittee) => {
          return futureCommittee.producers.find((producer) => producer === accountId) !== undefined;
        });

        return {
          accountId,
          currentSessionCommittee: sessionValidators.includes(accountId),
          nextSessionInCommittee: nextCommittee?.session
        };
      }).sort((a, b) => {
        return Number(b.currentSessionCommittee) - Number(a.currentSessionCommittee);
      });
    }

    return [];
  }, [futureSessionCommittee, eraValidators, sessionValidators]);

  const headerRef = useRef<[string, string, number?][]>(
    [
      [t('validators'), 'start', 1],
      [t('current session committee'), 'expand'],
      [t('next session committee'), 'expand'],
      [t('stats'), 'expand']
    ]
  );

  return (
    <Table
      empty={
        validatorsList && t('No active validators found')
      }
      emptySpinner={
        <>
          {!validatorsList && <div>{t('Preparing validator list')}</div>}
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
    >
      {validatorsList.map(({ accountId, currentSessionCommittee, nextSessionInCommittee }): React.ReactNode => (
        <Address
          address={accountId}
          currentSessionCommittee={currentSessionCommittee}
          filterName={nameFilter}
          key={accountId}
          nextSessionInCommittee={nextSessionInCommittee}
        />
      ))}
    </Table>
  );
}

export default React.memo(FutureValidators);
