// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Dispatch, SetStateAction } from 'react';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Input } from '@polkadot/react-components';

import { useTranslation } from '../translate.js';

interface Props {
  minimumSessionNumber: number | undefined;
  maximumSessionNumber: number | undefined;
  selectedSession: number;
  onSessionChange: Dispatch<SetStateAction<number | undefined>>;
}

function ActionsRow ({ maximumSessionNumber, minimumSessionNumber, onSessionChange, selectedSession }: Props): React.ReactElement {
  const { t } = useTranslation();

  // used to clear input text
  const [inputValue, setInputValue] = useState('');
  const [parsedSessionNumber, setParsedSessionNumber] = useState<number | undefined>(undefined);

  useEffect(() => {
    setInputValue(selectedSession.toString());
    setParsedSessionNumber(selectedSession);
  }, [selectedSession]);

  const _onChangeKey = useCallback(
    (key: string): void => {
      setInputValue(key);

      let isInputSessionNumberCorrect = false;

      if (minimumSessionNumber && maximumSessionNumber) {
        const sessionNumber = parseInt(key);

        if (!isNaN(sessionNumber)) {
          if (minimumSessionNumber <= sessionNumber && sessionNumber <= maximumSessionNumber) {
            isInputSessionNumberCorrect = true;
          }
        }
      }

      isInputSessionNumberCorrect
        ? setParsedSessionNumber(Number(key))
        : setParsedSessionNumber(undefined);
    },
    [minimumSessionNumber, maximumSessionNumber]
  );

  const _onAdd = useCallback(
    (): void => {
      if (parsedSessionNumber) {
        onSessionChange(parsedSessionNumber);
      }
    },
    [parsedSessionNumber, onSessionChange]
  );

  const help = useMemo(() => {
    const constraints = [
      typeof minimumSessionNumber === 'number' && `${t('not smaller than')} ${minimumSessionNumber}`,
      typeof maximumSessionNumber === 'number' && `${t('not greater than')} ${maximumSessionNumber}`
    ];

    const msg = constraints.filter(Boolean).join(', ');

    return msg && ` - ${msg}`;
  },
  [t, maximumSessionNumber, minimumSessionNumber]
  );

  const _decrementSession = useCallback(
    (): void => {
      if (selectedSession === undefined || minimumSessionNumber === undefined) {
        return;
      }

      const nextSession = Math.max(minimumSessionNumber, selectedSession - 1);

      setInputValue(nextSession.toString());
      setParsedSessionNumber(nextSession);
      onSessionChange(nextSession);
    },
    [minimumSessionNumber, selectedSession, onSessionChange]
  );

  const _incrementSession = useCallback(
    (): void => {
      if (!maximumSessionNumber) {
        return;
      }

      const nextSession = Math.min(maximumSessionNumber, (selectedSession || maximumSessionNumber) + 1);

      setInputValue(nextSession.toString());
      setParsedSessionNumber(nextSession);
      onSessionChange(nextSession);
    },
    [maximumSessionNumber, selectedSession, onSessionChange]
  );

  const isGoBackDisabled = minimumSessionNumber === undefined || selectedSession === minimumSessionNumber;
  const isGoForwardDisabled = maximumSessionNumber === undefined || selectedSession === maximumSessionNumber;

  return (
    <>
      <div className='performance--actionsrow-buttons'>
        <Button
          icon='chevron-left'
          isDisabled={isGoBackDisabled}
          label={t('Previous session')}
          onClick={_decrementSession}
        />
        <Button
          icon='chevron-right'
          isDisabled={isGoForwardDisabled}
          label={t('Next session')}
          onClick={_incrementSession}
        />
      </div>
      <div className='performance--actionsrow-value'>
        <Input
          autoFocus
          isError={!parsedSessionNumber}
          label={`${t('Session number')} ${help}`}
          onChange={_onChangeKey}
          onEnter={_onAdd}
          value={inputValue}
        />
      </div>
      <div className='performance--actionsrow-buttons'>
        <Button
          icon='play'
          isDisabled={!parsedSessionNumber}
          onClick={_onAdd}
        />
      </div>
    </>
  );
}

export default ActionsRow;
