// Copyright 2017-2023 @polkadot/apps-routing authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TFunction } from 'i18next';
import type { Route } from './types.js';

import Component, { useCounter } from '@azero.dev/app-referenda';

export default function create (t: TFunction): Route {
  return {
    Component,
    display: {
      needsApi: [
        'tx.referenda.submit',
        'tx.convictionVoting.vote',
        'consts.referenda.tracks'
      ]
    },
    group: 'governance',
    icon: 'person-booth',
    name: 'referenda',
    text: t<string>('nav.referenda', 'Referenda', { ns: 'apps-routing' }),
    useCounter
  };
}
