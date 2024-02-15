// Copyright 2017-2024 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveSessionProgress } from '@polkadot/api-derive/types';

import { useMemo } from 'react';

import { createNamedHook, useApi, useCall } from '@polkadot/react-hooks';

function useCurrentSessionInfoImpl () {
  const { api } = useApi();

  const sessionInfo = useCall<DeriveSessionProgress>(api.derive.session.progress);
  const currentSession = useMemo(() => {
    return sessionInfo?.currentIndex.toNumber();
  },
  [sessionInfo]
  );

  const currentEra = useMemo(() => {
    return sessionInfo?.currentEra.toNumber();
  },
  [sessionInfo]
  );
  const historyDepth = api.consts.staking.historyDepth?.toNumber();
  const minimumSessionNumber = useMemo(() => {
    if (currentSession && historyDepth && sessionInfo) {
      return Math.max(currentSession - historyDepth * sessionInfo.sessionsPerEra.toNumber(), 1);
    }

    return undefined;
  },
  [historyDepth, currentSession, sessionInfo]
  );

  return [currentSession, currentEra, historyDepth, minimumSessionNumber];
}

export default createNamedHook('useCurrentSessionInfo', useCurrentSessionInfoImpl);
