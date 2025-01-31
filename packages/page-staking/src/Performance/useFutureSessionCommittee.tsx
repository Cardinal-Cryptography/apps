// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {u32} from '@polkadot/types';
import { useEffect, useState } from 'react';

import { createNamedHook, useApi } from '@polkadot/react-hooks';

export interface FutureCommittee {
  blockProducers: string[];
  finalityCommittee: string[];
}

function useFutureSessionCommitteeImpl (sessions: number[]): (FutureCommittee | undefined)[] {
  const { api } = useApi();

  const [committees, setCommittees] = useState<(FutureCommittee | undefined)[]>([]);

  useEffect(() => {
    let predictSessionCommittee = api.call?.alephSessionApi?.predictSessionCommittee;
    if (!predictSessionCommittee) {
      console.error('api.call.alephSessionApi.predictSessionCommittee is undefined!');
    }
    let predictCommitteePromises = sessions.map((session) => predictSessionCommittee?.(session as unknown as u32));

    Promise.all(predictCommitteePromises).then((futureCommitteesEncoded) => {
      setCommittees(
        futureCommitteesEncoded.map((futureCommittee) => {
          if (!futureCommittee) {
            return undefined;
          }
          let predictSessionCommitteeOutput = futureCommittee.toString();
          try {
            let json = JSON.parse(futureCommittee.toString());
            if (json.ok == undefined) {
              console.error("Unexpected predictSessionCommittee output format! Got: ", json)
            } else {
              const futureCommittee = json.ok as FutureCommittee;
              return futureCommittee;
            }
          } catch (parsingError) {
            console.error("Failed to parse predictSessionCommittee output: ",
              predictSessionCommitteeOutput,
              ", detailed error: ",
              parsingError);
          }
          return undefined;
        }));
      });
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [api, JSON.stringify(sessions)]
  );

  console.log(committees);
  return committees;
}

export default createNamedHook('useFutureSessionCommittee', useFutureSessionCommitteeImpl);
