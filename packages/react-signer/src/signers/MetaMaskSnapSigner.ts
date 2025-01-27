// Copyright 2017-2025 @polkadot/react-signer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Signer, SignerResult } from '@polkadot/api/types';
import type { SignerPayloadJSON } from '@polkadot/types/types';

import { signSignerPayload } from 'azero-wallet-adapter';

import { connectSnap } from '../snap.js';

let id = 0;

export class MetaMaskSnapSigner implements Signer {
  public async signPayload (payload: SignerPayloadJSON): Promise<SignerResult> {
    await connectSnap();

    const signingResult = await signSignerPayload({ payload });

    if (!signingResult.success) {
      throw new Error(signingResult.error);
    }

    const { signature } = signingResult.data;

    return {
      id: ++id,
      signature
    };
  }
}
