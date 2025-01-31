// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveSessionProgress } from '@polkadot/api-derive/types';

import { useMemo } from 'react';

import { createNamedHook, useApi, useCall } from '@polkadot/react-hooks';

import useEraSessionBoundaries from './useEraSessionBoundaries.js';

export interface SessionInfo {
  // Current era number, ie now when query is made; correlated with currentSession
  currentEra: number,

  // Current session number, ie now when query is made; correlated with currentEra
  currentSession: number,

  // how many eras behind pallet staking keeps data
  historyDepth: number,

  // how many session ahead we can predict block production committee - always no more till the end of the currentEra
  maximumSessionNumber: number,

  // how many sessions behind we can query performance - related to historyDepth
  minimumSessionNumber: number,
}

function useSessionInfoImpl (): SessionInfo | undefined {
  const { api } = useApi();
  const currentEraBoundaries = useEraSessionBoundaries(undefined);

  const sessionInfoBase = useCall<DeriveSessionProgress>(api.derive.session.progress);
  const currentSession = useMemo(() => {
    return sessionInfoBase?.currentIndex.toNumber();
  }, [sessionInfoBase]);

  const currentEra = useMemo(() => {
    return sessionInfoBase?.currentEra.toNumber();
  }, [sessionInfoBase]);

  const historyDepth = api.consts.staking.historyDepth?.toNumber();
  const minimumSessionNumber = useMemo(() => {
    if (currentSession && historyDepth && sessionInfoBase) {
      // This is not strictly true if era was forced in the past historyDepth eras
      return Math.max(currentSession - historyDepth * sessionInfoBase.sessionsPerEra.toNumber(), 1);
    }

    return undefined;
  }, [historyDepth, currentSession, sessionInfoBase]);

  const maximumSessionNumber = useMemo(() => {
    if (currentEraBoundaries && sessionInfoBase) {
      return currentEraBoundaries.firstSession + sessionInfoBase.sessionsPerEra.toNumber() - 1;
    }

    return undefined;
  }, [currentEraBoundaries, sessionInfoBase]);

  if (currentSession && currentEra && minimumSessionNumber && maximumSessionNumber) {
    return {
      currentEra,
      currentSession,
      historyDepth,
      maximumSessionNumber,
      minimumSessionNumber
    };
  }

  return undefined;
}

export default createNamedHook('useSessionInfo', useSessionInfoImpl);
