// Copyright 2017-2022 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useMemo, useState } from 'react';

import { DeriveEraExposure } from '@polkadot/api-derive/types';
import { useApi, useCall } from '@polkadot/react-hooks';
import { StorageKey } from '@polkadot/types';
import { AnyTuple, Codec } from '@polkadot/types/types';

import ActionsBanner from './ActionsBanner.js';
import CurrentList from './CurrentList.js';
import Summary from './Summary.js';
import { parseSessionBlockCount, ValidatorPerformance } from './useCommitteePerformance.js';

interface Props {
  session: number,
  era: number,
}

export interface EraValidatorPerformance {
  validatorPerformance: ValidatorPerformance;
  isCommittee: boolean;
}

function Performance ({ era, session }: Props): React.ReactElement<Props> {
  const { api } = useApi();

  const [sessionValidatorBlockCountLookup, setSessionValidatorBlockCountLookup] = useState<[string, number][]>([]);
  const [expectedBlockCountInSessions, setExpectedBlockCountInSessions] = useState<number | undefined>(undefined);
  const sessionValidators = useCall<Codec[]>(api.query.session.validators);
  const sessionValidatorsStrings = useMemo(() => {
    return sessionValidators?.map((validator) => validator.toString());
  }, [sessionValidators]);

  const eraExposure = useCall<DeriveEraExposure>(api.derive.staking.eraExposure, [era]);
  const eraValidators = useMemo(() => {
    if (eraExposure?.validators) {
      return Object.keys(eraExposure?.validators);
    }

    return [];
  }, [eraExposure]
  );

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

    const sessionPeriod = Number(api.consts.elections.sessionPeriod.toString());

    setExpectedBlockCountInSessions(sessionPeriod / sessionValidatorsStrings.length);

    return validatorPerformancesCommittee.concat(validatorPerformancesNonCommittee);
  },
  [eraValidators, sessionValidatorBlockCountLookup, api, sessionValidatorsStrings]

  );

  useEffect(() => {
    const interval = setInterval(() => {
      api && api.query.elections && api.query.elections.sessionValidatorBlockCount &&
      api.query.elections.sessionValidatorBlockCount.entries().then((value: [StorageKey<AnyTuple>, Codec][]) => {
        setSessionValidatorBlockCountLookup(parseSessionBlockCount(value));
      }
      ).catch(console.error);
    }, 1000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className='staking--Performance'>
      <Summary
        era={era}
        eraValidatorPerformances={eraValidatorPerformances}
        expectedBlockCount={expectedBlockCountInSessions}
        session={session}
      />
      <ActionsBanner />
      <CurrentList
        eraValidatorPerformances={eraValidatorPerformances}
        expectedBlockCount={expectedBlockCountInSessions}
        onlyCommittee={false}
      />
    </div>
  );
}

export default React.memo(Performance);
