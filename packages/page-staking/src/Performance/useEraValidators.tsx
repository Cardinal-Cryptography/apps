// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { EraValidators } from '../types.js';

import { useEffect, useState } from 'react';

import { useApi } from '@polkadot/react-hooks';

import { getApiAtBlock, getBlocksImportantForSession } from './utils.js';

export const useEraValidators = (session: number): string[] | undefined => {
  const { api } = useApi();

  const [validators, setValidators] = useState<string[]>();

  useEffect(() => {
    api.rpc.chain.getBlockHash().then((bestBlockHash) => {
      api.rpc.chain.getBlock(bestBlockHash).then((bestBlockSigned) => {
        const bestBlockNumber = bestBlockSigned.block.header.number.toNumber();
        const { firstBlockOfSelectedAuraSession } = getBlocksImportantForSession(session, api);

        if (firstBlockOfSelectedAuraSession <= bestBlockNumber) {
          getEraValidators(session, api)
            .then(setValidators)
            .catch(console.error);
        }
      }).catch(console.error);
    }).catch(console.error);
  }, [api, session]);

  return validators;
};

const getEraValidators = async (session: number, api: ApiPromise) => {
  const { firstBlockOfSelectedAuraSession } = getBlocksImportantForSession(session, api);

  const sessionApi = await getApiAtBlock(firstBlockOfSelectedAuraSession, api);
  const getEraValidators = sessionApi.query.elections.currentEraValidators as () => Promise<EraValidators>;
  const { nonReserved, reserved } = await getEraValidators();

  return [...reserved, ...nonReserved].map((accountId) => accountId.toString());
};
