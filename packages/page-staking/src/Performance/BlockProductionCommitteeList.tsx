// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EraValidatorPerformance } from './Performance.js';

import React, { useMemo, useRef, useState } from 'react';

import { Table, Toggle } from '@polkadot/react-components';
import { useLenientThresholdPercentage, useNextTick, useSavedFlags } from '@polkadot/react-hooks';

import Filtering from '../Filtering.js';
import { useTranslation } from '../translate.js';
import Address from './Address/index.js';
import useFutureSessionCommittee from './useFutureSessionCommittee.js';

interface Props {
  className?: string;
  eraValidatorPerformances: EraValidatorPerformance[];
  expectedBlockCount?: number;
  futureSessions?: number[];
}

interface ListEntry {
  eraValidatorPerformance: EraValidatorPerformance;
  nextSessionInCommittee?: number;
}

export function calculatePercentReward (blocksCreated: number | undefined, blocksTargetValue: number | undefined, lenientThresholdPercentage: number | undefined, isCommittee: boolean) {
  if (blocksCreated === undefined || blocksTargetValue === undefined || lenientThresholdPercentage === undefined) {
    return '';
  }

  let rewardPercentage = 0;

  if (!isCommittee) {
    rewardPercentage = 100;
  } else if (blocksTargetValue > 0) {
    rewardPercentage = 100 * blocksCreated / blocksTargetValue;

    if (rewardPercentage >= lenientThresholdPercentage) {
      rewardPercentage = 100;
    }
  }

  return rewardPercentage.toFixed(1);
}

function BlockProductionCommitteeList ({ className, eraValidatorPerformances, expectedBlockCount, futureSessions }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const [nameFilter, setNameFilter] = useState<string>('');

  const futureSessionCommittee = useFutureSessionCommittee(futureSessions ?? []);

  const lenientThresholdPercentage = useLenientThresholdPercentage();

  const isNextTick = useNextTick();

  const DEFAULT_FLAGS = {
    withNextCommittee: false
  };

  const [toggles, setToggle] = useSavedFlags('staking:performance', DEFAULT_FLAGS);

  const validatorsList: ListEntry[] = useMemo(() => {
    if (futureSessionCommittee.length > 0) {
      return eraValidatorPerformances.map((performance) => {
        const nextCommittee = futureSessionCommittee.find((futureCommittee) => {
          return futureCommittee.producers.find((producer) => producer === performance.validatorPerformance.accountId) !== undefined;
        });

        return {
          eraValidatorPerformance: performance,
          nextSessionInCommittee: nextCommittee !== undefined ? nextCommittee.session : -1
        };
      });
    }

    return eraValidatorPerformances.map((performance) => {
      return {
        eraValidatorPerformance: performance,
        nextSessionInCommittee: undefined
      };
    });
  }, [futureSessionCommittee, eraValidatorPerformances]);

  const list = useMemo(
    () => isNextTick
      ? toggles.withNextCommittee
        ? validatorsList
        : validatorsList.filter((entry) => entry.eraValidatorPerformance.isCommittee)
      : [],
    [isNextTick, validatorsList, toggles]
  );

  const headerRef = useRef<[string, string, number?][]>(
    [
      [t('validators'), 'start', 1],
      [t('blocks created'), 'expand'],
      [t('max % reward'), 'expand'],
      [t('stats'), 'expand']
    ]
  );

  return (
    <Table
      className={className}
      empty={
        validatorsList && t('No active validators found')
      }
      emptySpinner={
        <>
          {!list && <div>{t('Preparing validator list')}</div>}
        </>
      }
      filter={
        <div className='staking--optionsBar'>
          <Filtering
            nameFilter={nameFilter}
            setNameFilter={setNameFilter}
          >
            {futureSessions !== undefined && <Toggle
              className='staking--buttonToggle'
              label={t('display next committee')}
              onChange={setToggle.withNextCommittee}
              value={toggles.withNextCommittee}
            />}
          </Filtering>
        </div>
      }
      header={headerRef.current}
    >
      {list.map(({ eraValidatorPerformance, nextSessionInCommittee }): React.ReactNode => (
        <Address
          address={eraValidatorPerformance.validatorPerformance.accountId}
          blocksCreated={eraValidatorPerformance.validatorPerformance.blockCount}
          filterName={nameFilter}
          isCommittee={eraValidatorPerformance.isCommittee}
          key={eraValidatorPerformance.validatorPerformance.accountId}
          nextSessionInCommittee={nextSessionInCommittee}
          rewardPercentage={calculatePercentReward(eraValidatorPerformance.validatorPerformance.blockCount, expectedBlockCount, lenientThresholdPercentage, eraValidatorPerformance.isCommittee)}
        />
      ))}
    </Table>
  );
}

export default React.memo(BlockProductionCommitteeList);
