// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {u32} from '@polkadot/types';

import {useEffect, useMemo, useState} from 'react';

import {createNamedHook, useApi} from '@polkadot/react-hooks';

export interface FutureCommittee extends FutureCommitteeResult {
  session: number;
}

interface FutureCommitteeResult {
  blockProducers: string[];
  finalityCommittee: string[];
}

interface PredictSessionCommitteeResult {
  ok: FutureCommitteeResult;
}

function useFutureSessionCommitteeImpl (sessions: number[]): FutureCommittee[] {
  const { api } = useApi();

  const [allPredictedCommettees, setAllPredictedCommettees] = useState<(FutureCommitteeResult | undefined)[]>([]);

  useEffect(() => {
    const predictSessionCommittee = api.call?.alephSessionApi?.predictSessionCommittee;

    if (!predictSessionCommittee) {
      console.error('api.call.alephSessionApi.predictSessionCommittee is undefined!');
    }

    const predictCommitteePromises = sessions.map((session) => predictSessionCommittee?.(session as unknown as u32));

    Promise.all(predictCommitteePromises).then((futureCommitteesEncoded) => {
      setAllPredictedCommettees(
        futureCommitteesEncoded.map((futureCommittee) => {
          if (!futureCommittee) {
            return undefined;
          }

          const predictSessionCommitteeOutput = futureCommittee.toString();

          try {
            const json = JSON.parse(futureCommittee.toString()) as PredictSessionCommitteeResult;

            if (json.ok === undefined) {
              console.error('Unexpected predictSessionCommittee output format! Got: ', json);
            } else {
              return json.ok;
            }
          } catch (parsingError) {
            console.error('Failed to parse predictSessionCommittee output: ',
              predictSessionCommitteeOutput,
              ', detailed error: ',
              parsingError);
          }

          return undefined;
        }));
    }).catch(console.error);
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [api, JSON.stringify(sessions)]
  );

  return useMemo(() => {
    if (allPredictedCommettees.length > 0) {
      const zipped: [number, (FutureCommitteeResult | undefined)][] = sessions.map(function (session, index) {
        return [session, allPredictedCommettees[index]];
      });

      return zipped.reduce(function (filtered: FutureCommittee[], [session, maybeFutureCommittee]) {
        if (maybeFutureCommittee !== undefined) {
          filtered.push({
            blockProducers: maybeFutureCommittee.blockProducers,
            finalityCommittee: maybeFutureCommittee.finalityCommittee,
            session: session
          });
        }
        return filtered;
      }, []);
    }

    return [];
  }, [allPredictedCommettees, sessions]);
}

export default createNamedHook('useFutureSessionCommittee', useFutureSessionCommitteeImpl);
