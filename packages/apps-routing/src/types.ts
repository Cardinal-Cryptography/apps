// Copyright 2017-2023 @polkadot/apps-routing authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconName } from '@fortawesome/fontawesome-svg-core';
import type { ApiPromise } from '@polkadot/api';
import type { AppProps, BareProps } from '@azero.dev/react-components/types';

export type RouteGroup = 'accounts' | 'developer' | 'governance' | 'network' | 'files' | 'settings';

export interface RouteProps extends AppProps, BareProps {
  location: any;
}

export interface Route {
  // FIXME This is weird, we really expect the memo to be there...
  Component: React.ComponentType<RouteProps> | React.MemoExoticComponent<any>;
  Modal?: React.ComponentType<any> | React.MemoExoticComponent<any>;
  display: {
    isDevelopment?: boolean;
    isHidden?: boolean;
    isModal?: boolean;
    needsAccounts?: boolean;
    needsApi?: (string | string[])[];
    needsApiCheck?: (api: ApiPromise) => boolean;
    needsApiInstances?: boolean;
    needsSudo?: boolean;
    needsTeleport?: boolean;
  };
  group: RouteGroup;
  icon: IconName;
  isIgnored?: boolean;
  name: string;
  text: string;
  useCounter?: () => number | string | null;
  href?: string;
}

export type Routes = Route[];
