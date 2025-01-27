// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Exposure } from '@polkadot/types/interfaces';
import type { SpStakingExposurePage, SpStakingIndividualExposure, SpStakingPagedExposureMetadata } from '@polkadot/types/lookup';
import type { Option } from '@polkadot/types-codec';
import type { BN } from '@polkadot/util';

import { useEffect, useMemo, useState } from 'react';

import { useApi, useIsMountedRef } from '@polkadot/react-hooks';

const useCombinedErasStakersPaged = (era?: BN, validators?: string[]): Exposure[] | undefined => {
  const { api } = useApi();
  const mountedRef = useIsMountedRef();

  const [validatorsMetadata, setValidatorsMetadata] = useState<Option<SpStakingPagedExposureMetadata>[]>();
  const [validatorsErasStakersPaged, setValidatorsErasStakersPaged] = useState<Option<SpStakingExposurePage>[]>();

  useEffect(() => {
    if (!era || !validators) {
      return;
    }

    const setValidatorsPagesIfMounted = (pageCounts: Option<SpStakingPagedExposureMetadata>[]) => {
      if (mountedRef.current) {
        setValidatorsMetadata(pageCounts);
      }
    };

    const unSubPromise = api.queryMulti(
      validators.map((validator) => [api.query.staking.erasStakersOverview, [era, validator]]),
      setValidatorsPagesIfMounted
    );

    return () => {
      unSubPromise.then((unSub) => unSub()).catch(() => undefined);
    };
  }, [api, era, mountedRef, validators]);

  useEffect(() => {
    if (!era || !validators || !validatorsMetadata) {
      return;
    }

    const setCombinedErasStakersPagedIfMounted = (exposures: Option<SpStakingExposurePage>[]) => {
      if (mountedRef.current) {
        setValidatorsErasStakersPaged(exposures);
      }
    };

    const queries = validatorsMetadata.flatMap((metadata, validatorIndex) => (
      Array.from(
        { length: metadata.isSome ? metadata.unwrap().pageCount.toNumber() : 0 },
        (_, pageIndex) => [
          api.query.staking.erasStakersPaged, [era, validators[validatorIndex], pageIndex]
        ] satisfies Parameters<ApiPromise['queryMulti']>[0][number]
      )
    ));

    const unSubPromise = api.queryMulti(
      queries,
      setCombinedErasStakersPagedIfMounted
    );

    return () => {
      unSubPromise.then((unSub) => unSub()).catch(() => undefined);
    };
  }, [api, era, mountedRef, validators, validatorsMetadata]);

  const combinedErasStakersPaged = useMemo(() => {
    if (!validatorsErasStakersPaged || !validatorsMetadata) {
      return undefined;
    }

    let currentExposuresIndex = 0;

    return validatorsMetadata.map((metadataOpt) => {
      if (!metadataOpt.isSome) {
        return api.createType<Exposure>('Exposure', {
          others: [],
          own: 0,
          total: 0
        });
      }

      const metadata = metadataOpt.unwrap();
      const pageCount = metadata.pageCount.toNumber();

      const exposure = api.createType<Exposure>('Exposure', {
        others: combineExposuresOthers(
          validatorsErasStakersPaged.slice(currentExposuresIndex, currentExposuresIndex + pageCount)
        ),
        own: metadata.own,
        total: metadata.total
      });

      currentExposuresIndex += pageCount;

      return exposure;
    });
  }, [api, validatorsMetadata, validatorsErasStakersPaged]);

  return combinedErasStakersPaged;
};

export default useCombinedErasStakersPaged;

const combineExposuresOthers = (exposures: Option<SpStakingExposurePage>[]) => (
  exposures.reduce<SpStakingIndividualExposure[]>((prev, nextOpt) => {
    if (!nextOpt.isSome) {
      return prev;
    }

    const next = nextOpt.unwrap();

    return [...prev, ...next.others];
  }, [])
);
