// Copyright 2017-2023 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { useApi } from '@azero.dev/react-hooks';

import { useTranslation } from './translate.js';

interface Props {
  children?: React.ReactNode;
  className?: string;
  label?: React.ReactNode;
}

function Chain ({ children, className = '', label }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { systemChain } = useApi();

  return (
    <div className={className}>
      {label || ''}{systemChain || t<string>('Unknown')}{children}
    </div>
  );
}

export default React.memo(Chain);
