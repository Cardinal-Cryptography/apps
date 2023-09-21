// Copyright 2017-2023 @polkadot/app-storage authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ComponentType } from 'react';
import type { KeyringOptions, KeyringSectionOptions } from '@polkadot/ui-keyring/options/types';

import { resolveAddressToDomain } from '@azns/resolver-core';
import React, { useContext, useEffect, useState } from 'react';

import { ApiCtxRoot } from '@polkadot/react-api';
import { systemNameToChainId } from '@polkadot/react-hooks';

interface RequiredProps {
  options?: KeyringSectionOptions | null;
  optionsAll?: KeyringOptions;
}

const wrapWithAddressResolver = <Props extends RequiredProps>(Component: ComponentType<Props>): ComponentType<Omit<Props, 'addressToDomain'>> => {
  const Wrapped = (props: Props) => {
    const [addressToDomain, setAddressToDomain] = useState<Record<string, string | null | undefined>>({});
    const { api, systemChain } = useContext(ApiCtxRoot);

    const { options, optionsAll } = props;

    useEffect(() => {
      const chainId = systemNameToChainId.get(systemChain as string);

      if (!chainId) {
        return;
      }

      const allAddressesWithDuplicates = [...(options || []), ...(optionsAll?.allPlus || [])].flatMap(({ value }) => value ? [value] : []);
      const allAddresses = [...new Set(allAddressesWithDuplicates)];

      const unresolvedAddresses = allAddresses.filter((address) => !(address in addressToDomain));
      const domainPromises = unresolvedAddresses.map((address) => resolveAddressToDomain(address, { chainId, customApi: api }));

      if (!domainPromises.length) {
        return;
      }

      Promise.all(domainPromises).then(
        (results) => {
          const addressDomainTuples = results.flatMap(
            ({ error, primaryDomain }, index) => error
              ? []
              : [[unresolvedAddresses[index], primaryDomain] as [string, string | undefined | null]]
          );

          setAddressToDomain({ ...addressToDomain, ...Object.fromEntries(addressDomainTuples) });
        }
      ).catch(console.error);
    }, [addressToDomain, api, options, optionsAll, systemChain]);

    return (
      <Component
        {...props}
        addressToDomain={addressToDomain}
      />
    );
  };

  return Wrapped as ComponentType<Omit<Props, 'addressToDomain'>>;
};

export default wrapWithAddressResolver;
