// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { u16, Vec } from '@polkadot/types';
import type { EraIndex, EventRecord, Hash, SessionIndex } from '@polkadot/types/interfaces';
import type { Perbill } from '@polkadot/types/interfaces/runtime';
import type { Codec } from '@polkadot/types/types';
import type { SuspensionEvent } from './index.js';

import { useEffect, useMemo, useState } from 'react';

import { COMMITTEE_MANAGEMENT_NAMES, getCommitteeManagement } from '@polkadot/react-api/getCommitteeManagement';
import { createNamedHook, useApi, useCall } from '@polkadot/react-hooks';

import useErasStartSessionIndexLookup from '../Performance/useErasStartSessionIndexLookup.js';

interface ProductionBanConfig {
  minimalExpectedPerformance: Perbill,
  underperformedSessionCountThreshold: SessionIndex,
  cleanSessionCounterDelay: SessionIndex,
  banPeriod: EraIndex,
}

interface FinalityBanConfig {
  minimalExpectedPerformance: u16,
  underperformedSessionCountThreshold: SessionIndex,
  cleanSessionCounterDelay: SessionIndex,
  banPeriod: EraIndex,
}

function parseEvents (events: EventRecord[], productionBanConfigPeriod: number, finalizationBanConfigPeriod: number): SuspensionEvent[] {
  return events.filter(({ event }) => COMMITTEE_MANAGEMENT_NAMES.includes(event.section) && event.method === 'BanValidators')
    .map(({ event }) => {
      const raw = event.data[0] as unknown as Codec[][];

      return raw.map((value) => {
        const address = value[0].toString();
        const reasonAndEra = value[1].toHuman() as unknown as Record<string, Codec>;

        const reasonTypeAndValue = reasonAndEra.reason as unknown as Record<string, string>;
        const reasonType = Object.keys(reasonTypeAndValue)[0];
        const reasonValue = Object.values(reasonTypeAndValue)[0];
        const era = Number(reasonAndEra.start.toString());

        if (reasonType === 'OtherReason') {
          return {
            address,
            era,
            suspensionLiftsInEra: era + productionBanConfigPeriod,
            suspensionReason: reasonValue
          };
        } else if (reasonType === 'InsufficientProduction') {
          return {
            address,
            era,
            suspensionLiftsInEra: era + productionBanConfigPeriod,
            suspensionReason: `Insufficient block production in at least ${reasonValue} sessions`
          };
        } else if (reasonType === 'InsufficientFinalization') {
          return {
            address,
            era,
            suspensionLiftsInEra: era + finalizationBanConfigPeriod,
            suspensionReason: `Insufficient finalization in at least ${reasonValue} sessions`
          };
        } else {
          return {
            address,
            era,
            suspensionLiftsInEra: era + productionBanConfigPeriod,
            suspensionReason: `${reasonType} : ${reasonValue}`
          };
        }
      });
    }).flat();
}

function useSuspensions (): SuspensionEvent[] | undefined {
  const { api } = useApi();
  // below logic is not able to detect kicks in blocks in which elections has failed,
  // as staking.erasStartSessionIndex is not populated (new era does not start)
  const erasStartSessionIndexLookup = useErasStartSessionIndexLookup();
  const [electionBlockHashes, setElectionBlockHashes] = useState<Hash[] | undefined>(undefined);
  const [eventsInBlocks, setEventsInBlocks] = useState<SuspensionEvent[] | undefined>(undefined);
  const [suspensionEvents, setSuspensionEvents] = useState<SuspensionEvent[] | undefined>(undefined);
  const productionBanConfig = useCall<ProductionBanConfig>(getCommitteeManagement(api).query.productionBanConfig);

  const currentProductionBanPeriod = productionBanConfig?.banPeriod;
  const finalityBanConfig = useCall<FinalityBanConfig>(getCommitteeManagement(api).query.finalityBanConfig);
  const currentFinalityBanPeriod = finalityBanConfig?.banPeriod;

  const erasElectionsSessionIndexLookup = useMemo((): [number, number][] => {
    return erasStartSessionIndexLookup
      .filter(({ firstSession }) => firstSession > 0)
      .map(({ era, firstSession }) => [era, firstSession - 1]);
  },
  [erasStartSessionIndexLookup]
  );

  useEffect(() => {
    if (!(api && getCommitteeManagement(api).consts) || erasStartSessionIndexLookup.length === 0) {
      return;
    }

    const sessionPeriod = Number(getCommitteeManagement(api).consts.sessionPeriod.toString());
    const promises = erasElectionsSessionIndexLookup.map(([, electionSessionIndex]) => {
      return api.rpc.chain.getBlockHash(electionSessionIndex * sessionPeriod);
    });

    Promise.all(promises)
      .then((blockHashes) => setElectionBlockHashes(blockHashes))
      .catch(console.error);
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [api, JSON.stringify(erasElectionsSessionIndexLookup)]
  );

  useEffect(() => {
    if (electionBlockHashes === undefined || currentProductionBanPeriod === undefined || currentFinalityBanPeriod === undefined) {
      return;
    }

    const promisesApiAtFirstBlock = electionBlockHashes.map((hash) => api.at(hash.toString()));

    Promise.all(promisesApiAtFirstBlock).then((apis) => {
      const promisesSystemEvents = apis.map((promise) => promise.query.system.events());

      Promise.all(promisesSystemEvents)
        .then((events: Vec<EventRecord>[]) => {
          const parsedEvents = parseEvents(
            events.map((vecOfEvents) => vecOfEvents.toArray()).flat(),
            currentProductionBanPeriod.toNumber(),
            currentFinalityBanPeriod.toNumber()
          );

          setEventsInBlocks(parsedEvents);
        }).catch(console.error);
    }).catch(console.error);
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [api, JSON.stringify(electionBlockHashes), currentProductionBanPeriod, currentFinalityBanPeriod]
  );

  useEffect(() => {
    if (!currentProductionBanPeriod || !currentFinalityBanPeriod || !eventsInBlocks) {
      return;
    }

    setSuspensionEvents(eventsInBlocks.reverse());
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [api, JSON.stringify(eventsInBlocks), currentProductionBanPeriod]
  );

  return suspensionEvents;
}

export default createNamedHook('useSuspensions', useSuspensions);
