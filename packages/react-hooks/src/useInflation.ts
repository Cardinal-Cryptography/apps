// Copyright 2017-2025 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { BN } from '@polkadot/util';
import type { Inflation } from './types.js';

import { useEffect, useState } from 'react';

import { getInflationParams } from '@polkadot/apps-config';
import { BN_MILLION, BN_ZERO, isFunction } from '@polkadot/util';

import { createNamedHook } from './createNamedHook.js';
import { useApi } from './useApi.js';
import { useCall } from './useCall.js';

const EMPTY: Inflation = { inflation: 0, stakedFraction: 0, stakedReturn: 0 };

function calcInflationRewardCurve (minInflation: number, stakedFraction: number, idealStake: number, idealInterest: number, falloff: number) {
  return (minInflation + (
    stakedFraction <= idealStake
      ? (stakedFraction * (idealInterest - (minInflation / idealStake)))
      : (((idealInterest * idealStake) - minInflation) * Math.pow(2, (idealStake - stakedFraction) / falloff))
  ));
}

function calcInflationOnNonAleph (api: ApiPromise, stakedFraction: number, numAuctions: BN): Inflation {
  const { auctionAdjust, auctionMax, falloff, maxInflation, minInflation, stakeTarget } = getInflationParams(api);

  const idealStake = stakeTarget - (Math.min(auctionMax, numAuctions.toNumber()) * auctionAdjust);
  const idealInterest = maxInflation / idealStake;

  const inflationInPercentage = 100 * calcInflationRewardCurve(minInflation, stakedFraction, idealStake, idealInterest, falloff);

  const stakedReturn = stakedFraction
    ? (inflationInPercentage / stakedFraction)
    : 0;

  return {
    inflation: inflationInPercentage,
    stakedFraction,
    stakedReturn
  };
}

function calcInflationOnAleph (yearlyInflationInPercentage: number, stakedFraction: number) {
  const baseStakedReturn = stakedFraction !== 0
    ? (yearlyInflationInPercentage / stakedFraction)
    : 0;

  // Here we multiply stakedReturn by 0.9, as in case of Aleph Zero chain 10% of return goes to treasury
  const stakedReturn = baseStakedReturn * 0.9;

  return {
    inflation: yearlyInflationInPercentage,
    stakedFraction,
    stakedReturn
  };
}

function useYearlyInflation () {
  const { api } = useApi();

  const [yearlyInflation, setYearlyInflation] = useState<number>();

  const getYearlyInflation = api.call?.alephSessionApi?.yearlyInflation;

  useEffect(() => {
    getYearlyInflation?.().then((val) => {
      setYearlyInflation(val.toNumber() / 1_000_000_000);
    }).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isSupported: isFunction(getYearlyInflation), yearlyInflation };
}

function useInflationImpl (totalStaked?: BN): Inflation {
  const { api } = useApi();

  const totalIssuance = useCall<BN>(api.query.balances?.totalIssuance);
  const auctionCounter = useCall<BN>(api.query.auctions?.auctionCounter);
  const { isSupported: isYearlyInflationApiSupported, yearlyInflation } = useYearlyInflation();

  const [inflation, setInflation] = useState<Inflation>(EMPTY);

  useEffect((): void => {
    const numAuctions = api.query.auctions
      ? auctionCounter
      : BN_ZERO;

    if (
      numAuctions === undefined ||
      totalStaked === undefined ||
      totalIssuance === undefined ||
      (isYearlyInflationApiSupported && yearlyInflation === undefined)
    ) {
      return;
    }

    const stakedFraction = totalStaked.isZero() || totalIssuance.isZero()
      ? 0
      : totalStaked.mul(BN_MILLION).div(totalIssuance).toNumber() / BN_MILLION.toNumber();

    const inflation = isYearlyInflationApiSupported && yearlyInflation !== undefined
      ? calcInflationOnAleph(yearlyInflation * 100, stakedFraction)
      : calcInflationOnNonAleph(api, stakedFraction, numAuctions);

    setInflation(inflation);
  }, [api, auctionCounter, isYearlyInflationApiSupported, totalIssuance, totalStaked, yearlyInflation]);

  return inflation;
}

export const useInflation = createNamedHook('useInflation', useInflationImpl);
