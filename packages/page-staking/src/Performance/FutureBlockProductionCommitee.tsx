// Copyright 2017-2025 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EraValidatorPerformance } from './Performance.js';

import React, { useMemo } from 'react';

import { styled } from '@polkadot/react-components';

import ActionsBanner from './ActionsBanner.js';
import BlockProductionCommitteeList from './BlockProductionCommitteeList.js';
import Summary from './Summary.js';
import useFutureSessionCommittee from './useFutureSessionCommittee.js';

interface Props {
  session: number,
}

function FutureBlockProductionCommitee ({ session }: Props): React.ReactElement<Props> {
  const futureSessionCommittee = useFutureSessionCommittee([session]);

  const eraValidatorPerformances: EraValidatorPerformance[] = useMemo(() => {
    if (futureSessionCommittee && futureSessionCommittee.length > 0 && futureSessionCommittee[0]) {
      return futureSessionCommittee[0].producers.map((account) => {
        return {
          isCommittee: true,
          validatorPerformance: {
            accountId: account,
            blockCount: 0
          }
        };
      }
      );
    }

    return [];
  },
  [futureSessionCommittee]

  );

  return (
    <div className='staking--Performance'>
      <Summary
        eraValidatorPerformances={eraValidatorPerformances}
      />
      <ActionsBanner />
      <StyledBlockProductionCommitteeList
        eraValidatorPerformances={eraValidatorPerformances}
      />
    </div>
  );
}

const StyledBlockProductionCommitteeList = styled(BlockProductionCommitteeList)`
  margin-bottom: 64px;
`;

export default React.memo(FutureBlockProductionCommitee);
