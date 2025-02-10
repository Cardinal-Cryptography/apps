// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SessionCommitteeV14, SessionCommitteeV15, SessionNotWithinRange } from '@polkadot/apps-config/src/types.js';
import type { AccountId32 } from '@polkadot/types/interfaces';

import { useEffect, useMemo, useState } from 'react';

import { createNamedHook, useApi } from '@polkadot/react-hooks';

export interface FutureCommittee extends FutureCommitteeResult {
  session: number;
}

interface FutureCommitteeResult {
  producers: string[];
  finalizers: string[];
}

function instanceOfSessionCommitteeV15 (object: SessionCommitteeV15<AccountId32> | SessionCommitteeV14<AccountId32>): object is SessionCommitteeV15<AccountId32> {
  return 'finalizers' in object && 'producers' in object;
}

function instanceOfSessionCommitteeV14 (object: SessionCommitteeV15<AccountId32> | SessionCommitteeV14<AccountId32>): object is SessionCommitteeV14<AccountId32> {
  return 'finalityCommittee' in object && 'blockProducers' in object;
}

function instanceOfSessionNotWithinRange (object: FutureCommitteeResult | SessionNotWithinRange): object is SessionNotWithinRange {
  return 'lowerLimit' in object && 'upperLimit' in object;
}

function useFutureSessionCommitteeImpl (sessions: number[]): FutureCommittee[] {
  const { api } = useApi();

  const [allPredictedCommittees, setAllPredictedCommittees] = useState<(FutureCommitteeResult | undefined | SessionNotWithinRange)[]>([]);

  useEffect(() => {
    const predictSessionCommittee = api.call?.alephSessionApi?.predictSessionCommittee;

    if (!predictSessionCommittee) {
      console.error('api.call.alephSessionApi.predictSessionCommittee is undefined!');

      return undefined;
    }

    const predictCommitteePromises = sessions.map((session) => predictSessionCommittee?.(session));

    Promise.all(predictCommitteePromises).then((futureCommitteesEncoded) => {
      setAllPredictedCommittees(
        futureCommitteesEncoded.map((futureCommittee) => {
          if (!futureCommittee) {
            return undefined;
          }

          if (futureCommittee.isErr) {
            const err = futureCommittee.asErr;

            if (!err.isSessionNotWithinRange) {
              return undefined;
            }

            return err.asSessionNotWithinRange;
          }

          const result = futureCommittee.asOk;

          if (instanceOfSessionCommitteeV14(result)) {
            const resultV14Version = result;

            return {
              finalizers: resultV14Version.finalityCommittee.map((accountId) => accountId.toString()),
              producers: resultV14Version.blockProducers.map((accountId) => accountId.toString())
            };
          }

          if (instanceOfSessionCommitteeV15(result)) {
            const resultV15Version = result;

            return {
              finalizers: resultV15Version.finalizers.map((accountId) => accountId.toString()),
              producers: resultV15Version.producers.map((accountId) => accountId.toString())
            };
          }

          return undefined;
        }));
    }).catch(console.error);
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [api, JSON.stringify(sessions)]
  );

  return useMemo(() => {
    if (allPredictedCommittees.length > 0) {
      const zipped: [number, (FutureCommitteeResult | undefined | SessionNotWithinRange)][] = sessions.map(function (session, index) {
        return [session, allPredictedCommittees[index]];
      });

      return zipped.reduce(function (filtered: FutureCommittee[], [session, maybeFutureCommittee]) {
        if (maybeFutureCommittee !== undefined) {
          if (instanceOfSessionNotWithinRange(maybeFutureCommittee)) {
            const err = maybeFutureCommittee;

            console.error(`predictSessionCommittee called for session ${session} that is not within range [${err.lowerLimit.toString()}; ${err.upperLimit.toString()}]`);
          } else {
            const futureCommittee = maybeFutureCommittee;

            filtered.push({
              finalizers: futureCommittee.finalizers,
              producers: futureCommittee.producers,
              session
            });
          }
        } else {
          console.error(`predictSessionCommittee called for session ${session} returned unexpected error!`);
        }

        return filtered;
      }, []);
    }

    return [];
  }, [allPredictedCommittees, sessions]);
}

export default createNamedHook('useFutureSessionCommittee', useFutureSessionCommitteeImpl);
