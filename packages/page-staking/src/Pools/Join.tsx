// Copyright 2017-2023 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { Params } from './types';

import React, { useMemo, useState } from 'react';

import { Button, InputAddress, InputBalance, Modal, TxButton } from '@polkadot/react-components';
import { useApi, useToggle } from '@polkadot/react-hooks';

import { useTranslation } from '../translate';
import useAmountError from './useAmountError';

interface Props {
  className?: string;
  isDisabled?: boolean;
  ownAccounts?: string[];
  params: Params;
  poolId: BN;
}

function Join ({ className, isDisabled, ownAccounts, params: { minJoinBond }, poolId }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const { api } = useApi();
  const [isOpen, toggleOpen] = useToggle();
  const [accountId, setAccount] = useState<string | null>(null);
  const [amount, setAmount] = useState<BN | undefined>();
  const isAmountError = useAmountError(accountId, amount, minJoinBond);
  const minJoinBondHint = useMemo(() => {
    let hint = 'The initial value to assign to the pool.';

    if (minJoinBond && !minJoinBond.isZero()) {
      hint += ' It is set to the minimum bond.';
    }

    return hint;
  },
  [minJoinBond]);

  if (isDisabled) {
    return null;
  }

  return (
    <>
      <Button
        icon='plus'
        isDisabled={!minJoinBond}
        label={t<string>('Join')}
        onClick={toggleOpen}
      />
      {isOpen && (
        <Modal
          className={className}
          header={t<string>('Join nomination pool')}
          onClose={toggleOpen}
          size='large'
        >
          <Modal.Content>
            <Modal.Columns hint={t<string>('The account that is to join the pool.')}>
              <InputAddress
                filter={ownAccounts}
                label={t<string>('join pool from')}
                onChange={setAccount}
                type='account'
                value={accountId}
                withExclude
              />
            </Modal.Columns>
            <Modal.Columns hint={minJoinBondHint}>
              <InputBalance
                autoFocus
                defaultValue={minJoinBond}
                isError={isAmountError}
                label={t<string>('initial value')}
                onChange={setAmount}
              />
            </Modal.Columns>
          </Modal.Content>
          <Modal.Actions>
            <TxButton
              accountId={accountId}
              icon='plus'
              isDisabled={!accountId || isAmountError}
              label={t<string>('Join')}
              onStart={toggleOpen}
              params={[amount, poolId]}
              tx={api.tx.nominationPools.join}
            />
          </Modal.Actions>
        </Modal>
      )}
    </>
  );
}

export default React.memo(Join);
