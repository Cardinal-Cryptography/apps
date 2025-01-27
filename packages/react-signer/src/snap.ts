// Copyright 2017-2025 @polkadot/react-signer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActionStatus } from '@polkadot/react-components/Status/types';

import * as snap from 'azero-wallet-adapter';

import { keyring } from '@polkadot/ui-keyring';
import { settings } from '@polkadot/ui-settings';

const rpcUrlMapper: Record<string, string> = {
  'wss://ws.azero.dev': 'https://rpc.azero.dev/',
  'wss://ws.dev.azero.dev': 'https://dev.rpc.azero.dev/',
  'wss://ws.test.azero.dev': 'https://test.rpc.azero.dev/'
};

export const connectSnap = async (onStatusChange?: (status: ActionStatus) => void): Promise<void> => {
  try {
    const rpcUrl = rpcUrlMapper[settings.apiUrl];

    if (!rpcUrl) {
      onStatusChange && onStatusChange({
        action: 'From snap',
        message: 'No RPC URL found',
        status: 'error'
      });
      console.error(`No RPC URL found for ${settings.apiUrl}`);

      return;
    }

    if (!hasMetaMask()) {
      onStatusChange && onStatusChange({
        action: 'From snap',
        message: 'MetaMask not found',
        status: 'error'
      });
      console.error('MetaMask not found');

      return;
    }

    const snapId = snap.getSnapId();
    // We pin a specific version of the snap to avoid breaking changes
    const version = '0.3.6';
    const installed = await snap.isInstalled(snapId, version);

    if (!installed) {
      await snap.connect(snapId, { version });
    }

    await snap.setRpcUrl({ rpcUrl });

    const accountResult = await snap.getAccount();

    if (!accountResult.success) {
      onStatusChange && onStatusChange({
        action: 'From snap',
        message: 'Account import failed',
        status: 'error'
      });
      console.error(accountResult.error);

      return;
    }

    const { address } = accountResult.data;

    keyring.addExternal(address, { isSnap: true });

    onStatusChange && onStatusChange({
      action: 'From snap',
      message: 'Account imported',
      status: 'success'
    });

    console.log('Added MetaMask snap account: ', address);
  } catch (e) {
    onStatusChange && onStatusChange({
      action: 'From snap',
      message: 'Account import failed',
      status: 'error'
    });
    console.error(e);
  }
};

type WindowWithEthereum = Window & { ethereum?: { isMetaMask?: boolean } };

export const hasMetaMask = () => !!(window as WindowWithEthereum)?.ethereum?.isMetaMask;
