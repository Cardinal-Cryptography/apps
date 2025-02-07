// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Codec } from '@polkadot/types/types';

import { useMemo } from 'react';

import { createNamedHook, useCall } from '@polkadot/react-hooks';

// remove duplicates, this is identity mapping of there are no duplicates
export function removeDuplicates (arr: string[]): string[] {
  const map = new Map<string, boolean>();
  const unique: string[] = [];

  arr.forEach((item) => {
    if (!map.has(item)) {
      map.set(item, true);
      unique.push(item);
    }
  });

  return unique;
}

function useSessionValidatorsImpl (api: ApiPromise): string[] {
  const sessionValidators = useCall<Codec[]>(api.query.session.validators);

  return useMemo(() => {
    if (sessionValidators) {
      const validators = sessionValidators.map((validator) => validator.toString());

      // in aleph-node v15 version, every block slot has assigned upfront validator
      // hence, session.validators needs to be deduplicated
      return removeDuplicates(validators);
    }

    return [];
  }, [sessionValidators]);
}

export default createNamedHook('useSessionValidators', useSessionValidatorsImpl);
