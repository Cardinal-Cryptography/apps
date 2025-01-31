// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { u32 } from '@polkadot/types';

import { useEffect, useState } from 'react';

import { createNamedHook, useApi } from '@polkadot/react-hooks';

export interface FutureCommittee {
  blockProducers: string[];
  finalityCommittee: string[];
}

interface PredictSessionCommitteeResult {
  ok: FutureCommittee;
}

function useFutureSessionCommitteeImpl (sessions: number[]): (FutureCommittee | undefined)[] {
  const { api } = useApi();

  const [committees, setCommittees] = useState<(FutureCommittee | undefined)[]>([]);

  useEffect(() => {
    const predictSessionCommittee = api.call?.alephSessionApi?.predictSessionCommittee;

    if (!predictSessionCommittee) {
      console.error('api.call.alephSessionApi.predictSessionCommittee is undefined!');
    }

    const predictCommitteePromises = sessions.map((session) => predictSessionCommittee?.(session as unknown as u32));

    Promise.all(predictCommitteePromises).then((futureCommitteesEncoded) => {
      setCommittees(
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

  console.log(committees);

  return committees;
}

export default createNamedHook('useFutureSessionCommittee', useFutureSessionCommitteeImpl);
