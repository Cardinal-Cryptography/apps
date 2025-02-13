// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Option, Struct, Vec } from '@polkadot/types';
import type { SessionIndex } from '@polkadot/types/interfaces';
import type { u16, u32 } from '@polkadot/types-codec';

import { useEffect, useState } from 'react';

import { getCommitteeManagement } from '@polkadot/react-api/getCommitteeManagement';
import { createNamedHook, useApi, useCall } from '@polkadot/react-hooks';

interface Score extends Struct {
  sessionId: SessionIndex,
  nonce: u32,
  points: Vec<u16>
}

const OPT_BOND = {
  transform: (value: Option<Score>): Score | undefined =>
    value.isSome
      ? value.unwrap()
      : undefined
};

function AbftScoresImpl (session: number) {
  const { api } = useApi();

  const [scoresEnabled, setScoresEnabled] = useState<boolean>(false);
  const sessionPeriod = Number(getCommitteeManagement(api).consts.sessionPeriod.toString());

  useEffect(() => {
    api.rpc.chain.getBlockHash(sessionPeriod * session + 1)
      .then((firstBlockSessionHash) => {
        api.at(firstBlockSessionHash.toString()).then((apiAtFirstBlock) => {
          if (apiAtFirstBlock.query.aleph.abftScores !== undefined) {
            apiAtFirstBlock.query.aleph.finalityVersion()
              .then((finalityVersion) =>
                setScoresEnabled(Number(finalityVersion.toString()) >= 5))
              .catch(console.error);
          }
        }).catch(console.error);
      })
      .catch(console.error);
  }, [api, session, sessionPeriod]);

  return {
    abftScores: useCall<Score | undefined>(scoresEnabled && api.query.aleph.abftScores, [session], OPT_BOND),
    scoresEnabled
  };
}

export default createNamedHook('AbftScores', AbftScoresImpl);
