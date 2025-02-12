// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveStakingOverview } from '@polkadot/api-derive/types';
import type { AppProps as Props } from '@polkadot/react-components/types';
import type { ElectionStatus } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

import React, { useCallback, useMemo, useState } from 'react';
import { Route, Routes } from 'react-router';
import { useLocation } from 'react-router-dom';

import Pools from '@polkadot/app-staking2/Pools';
import useOwnPools from '@polkadot/app-staking2/Pools/useOwnPools';
import { styled, Tabs } from '@polkadot/react-components';
import { useAccounts, useApi, useAvailableSlashes, useCall, useCallMulti, useFavorites, useOwnStashInfos } from '@polkadot/react-hooks';
import { isFunction } from '@polkadot/util';

import Actions from './Actions/index.js';
import Bags from './Bags/index.js';
import FutureCommittee from './FutureCommittee/index.js';
import Payouts from './Payouts/index.js';
import PerformancePage from './Performance/index.js';
import Query from './Query/index.js';
import Slashes from './Slashes/index.js';
import SuspensionsPage from './Suspensions/index.js';
import Targets from './Targets/index.js';
import Validators from './Validators/index.js';
import { STORE_FAVS_BASE } from './constants.js';
import { useTranslation } from './translate.js';
import useNominations from './useNominations.js';
import useSortedTargets from './useSortedTargets.js';

const HIDDEN_ACC = ['actions', 'payout'];

const OPT_MULTI = {
  defaultValue: [false, undefined] as [boolean, BN | undefined],
  transform: ([eraElectionStatus, minValidatorBond]: [ElectionStatus | null, BN | undefined]): [boolean, BN | undefined] => [
    !!eraElectionStatus && eraElectionStatus.isOpen,
    minValidatorBond && !minValidatorBond.isZero()
      ? minValidatorBond
      : undefined
  ]
};

function StakingApp ({ basePath, className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const { areAccountsLoaded, hasAccounts } = useAccounts();
  const { pathname } = useLocation();
  const [withLedger, setWithLedger] = useState(false);
  const [favorites, toggleFavorite] = useFavorites(STORE_FAVS_BASE);
  const [loadNominations, setLoadNominations] = useState(false);
  const nominatedBy = useNominations(loadNominations);
  const stakingOverview = useCall<DeriveStakingOverview>(api.derive.staking.overview);
  const [isInElection, minCommission] = useCallMulti<[boolean, BN | undefined]>([
    api.query.staking.eraElectionStatus,
    api.query.staking.minCommission
  ], OPT_MULTI);
  const ownPools = useOwnPools();
  const ownStashes = useOwnStashInfos();
  const slashes = useAvailableSlashes();
  const targets = useSortedTargets(favorites, withLedger);

  const hasQueries = useMemo(
    () => hasAccounts && !!(api.query.imOnline?.authoredBlocks) && !!(api.query.staking.activeEra),
    [api, hasAccounts]
  );

  const hasStashes = useMemo(
    () => hasAccounts && !!ownStashes && (ownStashes.length !== 0),
    [hasAccounts, ownStashes]
  );

  const ownValidators = useMemo(
    () => (ownStashes || []).filter(({ isStashValidating }) => isStashValidating),
    [ownStashes]
  );

  const toggleLedger = useCallback(
    () => setWithLedger(true),
    []
  );

  const toggleNominatedBy = useCallback(
    () => setLoadNominations(true),
    []
  );

  const items = useMemo(() => [
    {
      isRoot: true,
      name: 'overview',
      text: t('Overview')
    },
    {
      name: 'actions',
      text: t('Accounts')
    },
    hasStashes && isFunction(api.query.staking.activeEra) && {
      name: 'payout',
      text: t('Payouts')
    },
    isFunction(api.query.nominationPools?.minCreateBond) && {
      name: 'pools',
      text: t('Pools')
    },
    {
      alias: 'returns',
      name: 'targets',
      text: t('Targets')
    },
    hasStashes && isFunction((api.query.voterBagsList || api.query.bagsList || api.query.voterList)?.counterForListNodes) && {
      name: 'bags',
      text: t('Bags')
    },
    {
      count: slashes.reduce((count, [, unapplied]) => count + unapplied.length, 0),
      name: 'slashes',
      text: t('Slashes')
    },
    {
      hasParams: true,
      name: 'query',
      text: t('Validator stats')
    },
    {
      name: 'performance',
      text: t('Performance')
    },
    {
      name: 'futureCommittee',
      text: t('Future Committee')
    },
    {
      name: 'suspensions',
      text: t('Suspensions')
    }
  ].filter((q): q is { name: string; text: string } => !!q), [api, hasStashes, slashes, t]);

  return (
    <StyledMain className={`${className} staking--App`}>
      <Tabs
        basePath={basePath}
        hidden={
          areAccountsLoaded && !hasAccounts
            ? HIDDEN_ACC
            : undefined
        }
        items={items}
      />
      <Routes>
        <Route path={basePath}>
          <Route
            element={
              <Bags ownStashes={ownStashes} />
            }
            path='bags'
          />
          <Route
            element={
              <Payouts
                historyDepth={targets.historyDepth}
                isInElection={isInElection}
                ownPools={ownPools}
                ownValidators={ownValidators}
              />
            }
            path='payout'
          />
          <Route
            element={
              <Pools ownPools={ownPools} />
            }
            path='pools'
          />
          <Route
            element={
              <Query />
            }
            path='query/:value?'
          />
          <Route
            element={
              <Slashes
                ownStashes={ownStashes}
                slashes={slashes}
              />
            }
            path='slashes'
          />
          <Route
            element={
              <Targets
                isInElection={isInElection}
                nominatedBy={nominatedBy}
                ownStashes={ownStashes}
                stakingOverview={stakingOverview}
                targets={targets}
                toggleFavorite={toggleFavorite}
                toggleLedger={toggleLedger}
                toggleNominatedBy={toggleNominatedBy}
              />
            }
            path='targets'
          />
          <Route
            element={<PerformancePage />}
            path='performance'
          />
          <Route
            element={<FutureCommittee />}
            path='futureCommittee'
          />
          <Route
            element={<SuspensionsPage />}
            path='suspensions'
          />
        </Route>
      </Routes>
      <Actions
        className={pathname === `${basePath}/actions` ? '' : '--hidden'}
        isInElection={isInElection}
        minCommission={minCommission}
        ownPools={ownPools}
        ownStashes={ownStashes}
        targets={targets}
      />
      <Validators
        className={basePath === pathname ? '' : '--hidden'}
        favorites={favorites}
        hasAccounts={hasAccounts}
        hasQueries={hasQueries}
        nominatedBy={nominatedBy}
        ownStashes={ownStashes}
        targets={targets}
        toggleFavorite={toggleFavorite}
        toggleNominatedBy={toggleNominatedBy}
      />
    </StyledMain>
  );
}

const StyledMain = styled.main`
  .staking--Chart {
    margin-top: 1.5rem;

    h1 {
      margin-bottom: 0.5rem;
    }

    .ui--Spinner {
      margin: 2.5rem auto;
    }
  }

  .staking--optionsBar {
    margin: 0.5rem 0 1rem;
    text-align: center;
    white-space: normal;

    .staking--buttonToggle {
      display: inline-block;
      margin-right: 1rem;
      margin-top: 0.5rem;
    }
  }

 .performance--actionsrow {
    align-items: flex-start;
    display: flex;

    .ui--Button {
      margin: 0.25rem;
    }

    &.head {
      flex: 1 1 100%;
      margin: 0 auto;
      max-width: 620px;
    }
  }

  .performance--actionsrow-value {
    flex: 1;
    min-width: 0;

    .ui--output {
      word-break: break-all;
    }
  }

  .performance--actionsrow-buttons {
    padding: 0.5rem 0.25rem;
  }

  .ui--Expander.stakeOver {
    .ui--Expander-summary {
      color: var(--color-error);
    }
  }
`;

export default React.memo(StakingApp);
