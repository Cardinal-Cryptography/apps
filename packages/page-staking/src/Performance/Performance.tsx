// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StorageKey } from '@polkadot/types';
import type { AnyTuple, Codec } from '@polkadot/types/types';
import type { ValidatorPerformance } from './useCommitteePerformance.js';

import React, { useEffect, useMemo, useState } from 'react';

import { getCommitteeManagement } from '@polkadot/react-api/getCommitteeManagement';
import { styled } from '@polkadot/react-components';
import { useApi, useCall } from '@polkadot/react-hooks';

import ActionsBanner from './ActionsBanner.js';
import BlockProductionCommitteeList from './BlockProductionCommitteeList.js';
import Summary from './Summary.js';
import { parseSessionBlockCount } from './useCommitteePerformance.js';
import { useEraValidators } from './useEraValidators.js';

interface Props {
  currentSession: number,
  maximumSessionNumber: number,
}

export interface EraValidatorPerformance {
  validatorPerformance: ValidatorPerformance;
  isCommittee: boolean;
}

function range (size: number, startAt = 0) {
  return [...Array(size).keys()].map((i) => i + startAt);
}

function Performance ({ currentSession, maximumSessionNumber }: Props): React.ReactElement<Props> {
  const { api } = useApi();

  const [sessionValidatorBlockCountLookup, setSessionValidatorBlockCountLookup] = useState<[string, number][]>([]);
  const [expectedBlockCountInSessions, setExpectedBlockCountInSessions] = useState<number | undefined>(undefined);
  const sessionValidators = useCall<Codec[]>(api.query.session.validators);

  const sessionValidatorsStrings = useMemo(() => {
    return sessionValidators?.map((validator) => validator.toString());
  }, [sessionValidators]);

  const eraValidatorsAddresses = useEraValidators(currentSession, currentSession);

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

  const eraValidatorPerformances: EraValidatorPerformance[] = useMemo(() => {
    if (!sessionValidatorsStrings) {
      return [];
    }

    const validatorPerformancesCommittee =
      sessionValidatorsStrings.map((validator) => {
        const maybeBlockCount = sessionValidatorBlockCountLookup.find((elem) => elem[0] === validator);

        return {
          isCommittee: true,
          validatorPerformance: {
            accountId: validator,
            blockCount: maybeBlockCount !== undefined ? maybeBlockCount[1] : 0
          }
        };
      });

    const nonCommitteeAccountIds = eraValidators.filter((validator) => !sessionValidatorsStrings.find((value) => validator === value));
    const validatorPerformancesNonCommittee = nonCommitteeAccountIds.map((accountId) => {
      return {
        isCommittee: false,
        validatorPerformance: {
          accountId,
          blockCount: 0
        }
      };
    });

    const sessionPeriod = Number(getCommitteeManagement(api).consts.sessionPeriod.toString());

    setExpectedBlockCountInSessions(sessionPeriod / sessionValidatorsStrings.length);

    return validatorPerformancesCommittee.concat(validatorPerformancesNonCommittee);
  },
  [api, eraValidators, sessionValidatorBlockCountLookup, sessionValidatorsStrings]

  );

  useEffect(() => {
    const interval = setInterval(() => {
      getCommitteeManagement(api).query.sessionValidatorBlockCount.entries().then((value: [StorageKey<AnyTuple>, Codec][]) => {
        setSessionValidatorBlockCountLookup(parseSessionBlockCount(value));
      }
      ).catch(console.error);
    }, 1000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className='staking--Performance'>
      <Summary
        eraValidatorPerformances={eraValidatorPerformances}
        expectedBlockCount={expectedBlockCountInSessions}
      />
      <ActionsBanner />
      <StyledBlockProductionCommitteeList
        eraValidatorPerformances={eraValidatorPerformances}
        expectedBlockCount={expectedBlockCountInSessions}
        futureSessions={futureSessions}
      />
    </div>
  );
}

const StyledBlockProductionCommitteeList = styled(BlockProductionCommitteeList)`
  margin-bottom: 64px;
`;

export default React.memo(Performance);
