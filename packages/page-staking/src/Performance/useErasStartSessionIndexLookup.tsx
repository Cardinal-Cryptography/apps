// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EraIndex } from '@polkadot/types/interfaces';
import type { Option, u32 } from '@polkadot/types-codec';

import { useMemo } from 'react';

import { createNamedHook, useApi, useCall } from '@polkadot/react-hooks';

 type SessionIndexEntry = [{ args: [EraIndex] }, Option<u32>];

export interface EraFirstSession {
  readonly era: number,
  readonly firstSession: number,
}

function useErasStartSessionIndexLookupImpl () {
  const { api } = useApi();

  const erasStartSessionIndex = useCall<SessionIndexEntry[]>(api.query.staking.erasStartSessionIndex.entries);

  return useMemo((): EraFirstSession[] => {
    const result: EraFirstSession[] = [];

    if (erasStartSessionIndex) {
      erasStartSessionIndex.filter(([, values]) => values.isSome)
        .forEach(([key, values]) => {
          const eraIndex = key.args[0];

          result.push({
            era: eraIndex.toNumber(),
            firstSession: values.unwrap().toNumber()
          });
        });

      result.sort((eraFirstSessionA, eraFirstSessionB) => {
        return eraFirstSessionA.era - eraFirstSessionB.era;
      });
    }

    return result;
  },
  [erasStartSessionIndex]
  );
}

export default createNamedHook('useErasStartSessionIndexLookup', useErasStartSessionIndexLookupImpl);
