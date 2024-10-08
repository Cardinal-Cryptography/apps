// Copyright 2017-2024 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiTypes, AugmentedCall, DecoratedCallBase } from '@polkadot/api-base/types';
import type { Perbill } from '@polkadot/types/interfaces/runtime';
import type { Observable } from '@polkadot/types/types';

declare module '@polkadot/api-base/types/calls' {
  interface AugmentedCalls<ApiType extends ApiTypes> {
    /** 0xbc9d89904f5b923f/1 */
    alephSessionApi?: {
      /**
       * The API to query account nonce (aka transaction index)
       **/
      yearlyInflation?: AugmentedCall<ApiType, () => Observable<Perbill>>;
      /**
       * Generic call
       **/
      [key: string]: DecoratedCallBase<ApiType> | undefined;
    };
  }
}

export interface TOptions {
  ns?: string;
  replace?: Record<string, unknown>
}

export type TFunction = (keyOrText: string, textOrOptions?: string | TOptions, options?: TOptions) => string;
