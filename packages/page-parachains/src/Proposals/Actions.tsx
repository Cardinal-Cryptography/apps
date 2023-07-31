// Copyright 2017-2023 @polkadot/app-parachains authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { Button } from '@azero.dev/react-components';
import { useAccounts, useToggle } from '@azero.dev/react-hooks';

import { useTranslation } from '../translate.js';
import Propose from './Propose.js';

interface Props {
  className?: string;
}

function Actions (): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { hasAccounts } = useAccounts();
  const [showPropose, togglePropose] = useToggle();

  return (
    <>
      <Button.Group>
        <Button
          icon='plus'
          isDisabled={!hasAccounts}
          label={t<string>('Propose')}
          onClick={togglePropose}
        />
      </Button.Group>
      {showPropose && (
        <Propose onClose={togglePropose} />
      )}
    </>
  );
}

export default React.memo(Actions);
