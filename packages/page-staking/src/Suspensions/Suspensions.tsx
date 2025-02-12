// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { u8, u64, Vec } from '@polkadot/types';
import type { EventRecord, Hash } from '@polkadot/types/interfaces';
import type { Codec } from '@polkadot/types/types';
import type { u32 } from '@polkadot/types-codec';
import type { SuspensionEvent } from './index.js';

import { useEffect, useMemo, useState } from 'react';

import { COMMITTEE_MANAGEMENT_NAMES, getCommitteeManagement } from '@polkadot/react-api/getCommitteeManagement';
import { createNamedHook, useApi, useCall } from '@polkadot/react-hooks';

import useErasStartSessionIndexLookup from '../Performance/useErasStartSessionIndexLookup.js';

type SuspensionReasons = [string, string, number][];

interface BanReason {
  insufficientUptime?: u32,
  otherReason?: Vec<u8>,
}

interface BanInfo {
  reason: BanReason,
  start: u32,
}

function parseEvents (events: EventRecord[]): SuspensionReasons {
  return events.filter(({ event }) => COMMITTEE_MANAGEMENT_NAMES.includes(event.section) && event.method === 'BanValidators')
    .map(({ event }) => {
      const raw = event.data[0] as unknown as Codec[][];

      const reasons: SuspensionReasons = raw.map((value) => {
        const account = value[0].toString();
        const banInfo = value[1].toJSON() as unknown as BanInfo;

        const reason = banInfo.reason;
        const era = Number(banInfo.start.toString());

        if (reason.otherReason !== undefined) {
          return [account, reason.otherReason.toString(), era];
        } else if (reason.insufficientUptime !== undefined) {
          return [account, 'Insufficient uptime in at least ' + reason.insufficientUptime.toString() + ' sessions', era];
        } else {
          return [account, 'Unknown ban reason', era];
        }
      });

      return reasons;
    }).flat();
}

interface BanConfig {
  minimalExpectedPerformance: u64,
  underperformedSessionCountThreshold: u32,
  cleanSessionCounterDelay: u32,
  banPeriod: u32,
}

function useSuspensions (): SuspensionEvent[] | undefined {
  const { api } = useApi();
  // below logic is not able to detect kicks in blocks in which elections has failed,
  // as staking.erasStartSessionIndex is not populated (new era does not start)
  const erasStartSessionIndexLookup = useErasStartSessionIndexLookup();
  const [electionBlockHashes, setElectionBlockHashes] = useState<Hash[] | undefined>(undefined);
  const [eventsInBlocks, setEventsInBlocks] = useState<SuspensionReasons | undefined>(undefined);
  const [suspensionEvents, setSuspensionEvents] = useState<SuspensionEvent[] | undefined>(undefined);
  const banConfig = useCall<BanConfig>(getCommitteeManagement(api).query.banConfig);
  const currentBanPeriod = useMemo(() => {
    return banConfig?.banPeriod;
  },
  [banConfig]
  );

  const erasElectionsSessionIndexLookup = useMemo((): [number, number][] => {
    return erasStartSessionIndexLookup
      .filter(([, firstSession]) => firstSession > 0)
      .map(([era, firstSession]) => [era, firstSession - 1]);
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
    if (electionBlockHashes === undefined) {
      return;
    }

    const promisesApiAtFirstBlock = electionBlockHashes.map((hash) => api.at(hash.toString()));

    Promise.all(promisesApiAtFirstBlock).then((apis) => {
      const promisesSystemEvents = apis.map((promise) => promise.query.system.events());

      Promise.all(promisesSystemEvents)
        .then((events: Vec<EventRecord>[]) => {
          const parsedEvents = parseEvents(events.map((vecOfEvents) => vecOfEvents.toArray()).flat());

          setEventsInBlocks(parsedEvents);
        }).catch(console.error);
    }).catch(console.error);
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [api, JSON.stringify(electionBlockHashes)]
  );

  useEffect(() => {
    if (!currentBanPeriod) {
      return;
    }

    const events = eventsInBlocks?.map(([address, suspensionReason, era]) => {
      return {
        address,
        era,
        suspensionLiftsInEra: era + currentBanPeriod.toNumber(),
        suspensionReason
      };
    }).reverse();

    setSuspensionEvents(events);
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [api, JSON.stringify(eventsInBlocks), currentBanPeriod]
  );

  return suspensionEvents;
}

export default createNamedHook('useSuspensions', useSuspensions);
