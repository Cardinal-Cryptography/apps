// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EraFirstSession } from './useErasStartSessionIndexLookup.js';

import { useMemo } from 'react';

import { createNamedHook } from '@polkadot/react-hooks';

import useErasStartSessionIndexLookup from './useErasStartSessionIndexLookup.js';

export interface EraSessionBoundaries extends EraFirstSession {
  eraEndSession?: number;
}

// / Returns given era start first end last session. If session is undefined, assume it's current session.
function useEraSessionBoundariesImpl (session?: number): EraSessionBoundaries | undefined {
  const erasStartSessionIndexLookup = useErasStartSessionIndexLookup();

  function calculatePastEraBoundaries (session: number, eraToFirstSessionLookup: EraFirstSession[]): EraSessionBoundaries | undefined {
    for (let i = 0; i < eraToFirstSessionLookup.length; i++) {
      const eraIndex = eraToFirstSessionLookup[i].era;
      const currentEraSessionStart = eraToFirstSessionLookup[i].firstSession;
      const currentEraSessionEnd = i + 1 < eraToFirstSessionLookup.length ? eraToFirstSessionLookup[i + 1].firstSession - 1 : undefined;

      if (currentEraSessionStart <= session && currentEraSessionEnd && session <= currentEraSessionEnd) {
        return {
          era: eraIndex,
          eraEndSession: currentEraSessionEnd,
          firstSession: currentEraSessionStart
        };
      }
    }

    return undefined;
  }

  function calculateCurrentEraBoundaries (eraToFirstSessionLookup: EraFirstSession[]): EraSessionBoundaries {
    const lastErasStartSessionIndexLookup = eraToFirstSessionLookup.length - 1;

    return eraToFirstSessionLookup[lastErasStartSessionIndexLookup];
  }

  return useMemo((): EraFirstSession | undefined => {
    if (session && erasStartSessionIndexLookup.length > 0) {
      const pastEraBoundaries = calculatePastEraBoundaries(session, erasStartSessionIndexLookup);

      if (!pastEraBoundaries) {
        return calculateCurrentEraBoundaries(erasStartSessionIndexLookup);
      }

      return pastEraBoundaries;
    } else if (erasStartSessionIndexLookup.length > 0) {
      return calculateCurrentEraBoundaries(erasStartSessionIndexLookup);
    }

    return undefined;
  }, [session, erasStartSessionIndexLookup]);
}

export default createNamedHook('useEraSessionBoundaries', useEraSessionBoundariesImpl);
