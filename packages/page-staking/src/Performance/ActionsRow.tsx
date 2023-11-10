// Copyright 2017-2023 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Dispatch, SetStateAction } from 'react';

import React, { useCallback, useMemo, useState } from 'react';

import { Button, Input } from '@polkadot/react-components';

import { useTranslation } from '../translate.js';

interface Props {
  currentSession: number | undefined;
  historyDepth: number | undefined;
  minimumSessionNumber: number | undefined;
  selectedSession: number;
  onSessionChange: Dispatch<SetStateAction<number | undefined>>;
}

function ActionsRow ({ currentSession, historyDepth, minimumSessionNumber, onSessionChange, selectedSession }: Props): React.ReactElement {
  const { t } = useTranslation();

  // used to clear input text
  const [inputValue, setInputValue] = useState('');
  const [parsedSessionNumber, setParsedSessionNumber] = useState<number | undefined>(undefined);

  const _onChangeKey = useCallback(
    (key: string): void => {
      setInputValue(key);

      let isInputSessionNumberCorrect = false;

      if (currentSession && historyDepth && minimumSessionNumber) {
        const sessionNumber = parseInt(key);

        if (!isNaN(sessionNumber)) {
          if (sessionNumber <= currentSession && minimumSessionNumber <= sessionNumber) {
            isInputSessionNumberCorrect = true;
          }
        }
      }

      isInputSessionNumberCorrect
        ? setParsedSessionNumber(Number(key))
        : setParsedSessionNumber(undefined);
    },
    [currentSession, minimumSessionNumber, historyDepth]
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
      typeof currentSession === 'number' && `${t('not greater than')} ${currentSession}`
    ];

    const msg = constraints.filter(Boolean).join(', ');

    return msg && ` - ${msg}`;
  },
  [t, currentSession, minimumSessionNumber]
  );

  const _decrementSession = useCallback(
    (): void => {
      const session = selectedSession || currentSession;

      if (session === undefined || minimumSessionNumber === undefined) {
        return;
      }

      const nextSession = Math.max(minimumSessionNumber, session - 1);

      setInputValue(nextSession.toString());
      setParsedSessionNumber(nextSession);
      onSessionChange(nextSession);
    },
    [currentSession, minimumSessionNumber, selectedSession, onSessionChange]
  );

  const _incrementSession = useCallback(
    (): void => {
      if (!currentSession) {
        return;
      }

      const nextSession = Math.min(currentSession, (selectedSession || currentSession) + 1);

      setInputValue(nextSession.toString());
      setParsedSessionNumber(nextSession);
      onSessionChange(nextSession);
    },
    [currentSession, selectedSession, onSessionChange]
  );

  const isGoBackDisabled = minimumSessionNumber === undefined || selectedSession === minimumSessionNumber;
  const isGoForwardDisabled = selectedSession === currentSession;

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
