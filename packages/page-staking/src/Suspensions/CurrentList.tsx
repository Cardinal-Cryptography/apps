// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EraValidators } from '../types.js';
import type { SuspensionEvent } from './index.js';

import React, { useMemo, useRef, useState } from 'react';

import { Table, Toggle } from '@polkadot/react-components';
import { useApi, useCall } from '@polkadot/react-hooks';

import Filtering from '../Filtering.js';
import useSessionInfo from '../Performance/useSessionInfo.js';
import { useTranslation } from '../translate.js';
import Address from './Address/index.js';

interface Props {
  suspensions: SuspensionEvent[] | undefined,
}

function CurrentList ({ suspensions }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const { t } = useTranslation();
  const [nameFilter, setNameFilter] = useState<string>('');
  const [activeOnly, setActiveOnly] = useState(true);
  const sessionInfo = useSessionInfo();
  const eraValidators = useCall<EraValidators>(api.query.elections.currentEraValidators);

  const headerRef = useRef<[string, string, number?][]>(
    [
      [t('suspensions'), 'start', 1],
      [t('start era'), 'expand'],
      [t('end era'), 'expand'],
      [t('reason'), 'expand'],
      [t('stats'), 'expand']
    ]
  );

  // Work-around for BanEvents containing reserved nodes
  const reservedValidators = useMemo(() => {
    if (eraValidators) {
      return eraValidators.reserved.map((accountId) => accountId.toString());
    }

    return [];
  }, [eraValidators]);

  const filteredSuspensions = useMemo(() => {
    return suspensions?.filter(
      ({ address, suspensionLiftsInEra }) =>
        !reservedValidators.find((value) => value === address) &&
      (!activeOnly || sessionInfo === undefined || suspensionLiftsInEra >= sessionInfo.currentEra)
    );
  }, [suspensions, sessionInfo, reservedValidators, activeOnly]);

  return (
    <Table
      empty={
        filteredSuspensions !== undefined &&
        filteredSuspensions.length === 0 &&
        t('No suspension events matching the filters found in the past 84 eras')
      }
      emptySpinner={
        <>
          {suspensions === undefined && <div>{t('Retrieving suspensions events')}</div>}
        </>
      }
      filter={
        <div className='staking--optionsBar'>
          <Filtering
            nameFilter={nameFilter}
            setNameFilter={setNameFilter}
          />
          <Toggle
            className='staking--buttonToggle'
            label={t('Active only')}
            onChange={setActiveOnly}
            value={activeOnly}
          />
        </div>
      }
      header={headerRef.current}
    >
      {filteredSuspensions?.map(({ address, era, suspensionLiftsInEra, suspensionReason }): React.ReactNode => (
        <Address
          address={address}
          era={era}
          filterName={nameFilter}
          key={`address-${address}-era-${era}`}
          suspensionLiftsInEra={suspensionLiftsInEra}
          suspensionReason={suspensionReason}
        />
      ))}
    </Table>
  );
}

export default React.memo(CurrentList);
