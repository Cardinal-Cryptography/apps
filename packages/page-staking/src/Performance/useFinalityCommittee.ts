// Copyright 2017-2025 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { AccountId32 } from '@polkadot/types/interfaces/runtime';
import type { Vec } from '@polkadot/types-codec';

import { useEffect, useState } from 'react';

import { useApi } from '@polkadot/react-hooks';

import { getApiAtBlock, getBlocksImportantForSession } from './utils.js';

export const useFinalityCommittee = (session: number, currentSession: number): string[] | undefined => {
  const { api } = useApi();

  const [committee, setCommittee] = useState<string[]>();

  useEffect(() => {
    if (session <= currentSession) {
      getFinalityCommittee(session, api)
        .then(setCommittee)
        .catch(console.error);
    }
  }, [api, session, currentSession]);

  return committee;
};

const getFinalityCommittee = async (session: number, api: ApiPromise) => {
  const { lastBlockOfPrecedingAlephBFTSession } = getBlocksImportantForSession(session, api);

  const getFinalityCommittee: () => Promise<Vec<AccountId32>> = (
    // Committee must be set on the last block of the preceding session.
    await getApiAtBlock(lastBlockOfPrecedingAlephBFTSession, api)).query.aleph.nextFinalityCommittee;

  return (await getFinalityCommittee()).map((accountId) => accountId.toHuman());
};
