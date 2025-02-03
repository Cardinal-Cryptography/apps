// Copyright 2017-2025 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiTypes, AugmentedCall, DecoratedCallBase } from '@polkadot/api-base/types';
import type { Struct, Vec } from '@polkadot/types';
import type { SessionIndex } from '@polkadot/types/interfaces';
import type { AccountId32, Perbill } from '@polkadot/types/interfaces/runtime';
import type { AnyNumber, Codec, Observable } from '@polkadot/types/types';
import type { Enum, Result, u8 } from '@polkadot/types-codec';

export interface SessionCommitteeV15<T extends Codec> extends Struct {
  readonly finalizers: Vec<T>;
  readonly producers: Vec<T>;
}

export interface SessionCommitteeV14<T extends Codec> extends Struct {
  readonly finalityCommittee: Vec<T>;
  readonly blockProducers: Vec<T>;
}

export interface SessionNotWithinRange extends Struct {
  readonly lowerLimit: SessionIndex;
  readonly upperLimit: SessionIndex;
}

interface SessionValidatorError extends Enum {
  readonly isOther: boolean;
  readonly asOther: Vec<u8>;
  readonly isSessionNotWithinRange: boolean;
  readonly asSessionNotWithinRange: SessionNotWithinRange;
  readonly type: 'Other' | 'SessionNotWithinRange';
}

declare module '@polkadot/api-base/types/calls' {
  interface AugmentedCalls<ApiType extends ApiTypes> {
    /** 0xbc9d89904f5b923f/1 */
    alephSessionApi?: {
      /**
       * The API to query account nonce (aka transaction index)
       **/
      yearlyInflation?: AugmentedCall<ApiType, () => Observable<Perbill>>;
      /**
      Predict finality and block production committee
       **/
      predictSessionCommittee?: AugmentedCall<ApiType, (session: SessionIndex | AnyNumber | Uint8Array) => Observable<Result<SessionCommitteeV15<AccountId32> | SessionCommitteeV14<AccountId32>, SessionValidatorError>>>; /**
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
