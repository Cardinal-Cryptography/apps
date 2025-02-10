// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveSessionProgress } from '@polkadot/api-derive/types';
import type { Option, u32 } from '@polkadot/types-codec';

import { useMemo } from 'react';

import { createNamedHook, useApi, useCall } from '@polkadot/react-hooks';

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

  const currentEraFirstSession = useCall<Option<u32>>(api.query.staking.erasStartSessionIndex, [currentEra]);
  const maximumSessionNumber = useMemo(() => {
    if (currentEraFirstSession && currentEraFirstSession.isSome && sessionInfoBase && currentSession) {
      return currentEraFirstSession.unwrap().toNumber() + sessionInfoBase.sessionsPerEra.toNumber() - 1;
    }

    return undefined;
  }, [currentEraFirstSession, sessionInfoBase, currentSession]);

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
