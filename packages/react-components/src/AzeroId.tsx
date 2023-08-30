// Copyright 2017-2023 @polkadot/app-storage authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SupportedChainId } from '@azns/resolver-core';
import React, { useCallback, useId } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { externalAzeroIdLogoBlackSVG, externalAzeroIdLogoGreySVG, externalAzeroIdLogoPrimarySVG } from '@polkadot/apps-config/ui/logos/external';
import { systemNameToChainId, useAddressToDomain, useApi, useQueue, useTheme } from '@polkadot/react-hooks';

import Icon from './Icon.js';
import { styled } from './styled.js';
import Tooltip from './Tooltip.js';
import { useTranslation } from './translate.js';

type WrappedAzeroIdProps = {
  address?: string;
  className?: string;
  isRegisterLinkShown?: boolean;
};

type AzeroIdProps = WrappedAzeroIdProps & {
  chainId: SupportedChainId.AlephZero | SupportedChainId.AlephZeroTestnet,
};

const AzeroId = ({ address, chainId, className, isRegisterLinkShown }: AzeroIdProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { queueAction } = useQueue();

  const tooltipId = useId();

  const onCopy = useCallback(
    () => queueAction({
      action: t<string>('clipboard'),
      message: t<string>('domain copied'),
      status: 'queued'
    }),
    [queueAction, t]
  );

  const { hasError, isLoading, primaryDomain } = useAddressToDomain(address);

  if (primaryDomain) {
    const href = {
      [SupportedChainId.AlephZero]: `https://azero.id/id/${primaryDomain}`,
      [SupportedChainId.AlephZeroTestnet]: `https://tzero.id/id/${primaryDomain}`
    }[chainId];

    return (
      <Container
        className={className}
      >
        <StyledLink
          href={href}
          rel='noreferrer'
          target='_blank'
        >
          <Logo
            data-for={tooltipId}
            data-tip={true}
            src={theme.theme === 'dark' ? externalAzeroIdLogoPrimarySVG : externalAzeroIdLogoBlackSVG}
          />
          <Tooltip
            className='accounts-badge'
            text={<div>{t('AZERO.ID Primary Domain')}</div>}
            trigger={tooltipId}
          />
        </StyledLink>
        <CopyToClipboard
          onCopy={onCopy}
          text={primaryDomain}
        >
          <ClickableText
            type='button'
          >
            <AzeroIdDomain
              domain={primaryDomain}
              isCopyShown
              isLogoShown={false}
            />
          </ClickableText>
        </CopyToClipboard>
      </Container>
    );
  }

  if (!isRegisterLinkShown) {
    return null;
  }

  if (isLoading || hasError) {
    return <Placeholder className={`--tmp ${className || ''}`} />;
  }

  const href = {
    [SupportedChainId.AlephZero]: 'https://azero.id/',
    [SupportedChainId.AlephZeroTestnet]: 'https://tzero.id/'
  }[chainId];

  return (
    <Container className={className}>
      <StyledLink
        href={href}
        rel='noreferrer'
        target='_blank'
      >
        <Logo
          data-for={tooltipId}
          data-tip={true}
          src={externalAzeroIdLogoGreySVG}
        />
        {t('Register on-chain domain')}
      </StyledLink>
    </Container>
  );
};

const WrappedAzeroId = ({ address, className, isRegisterLinkShown = true }: WrappedAzeroIdProps) => {
  const { systemChain } = useApi();

  const chainId = systemNameToChainId.get(systemChain);

  if (!chainId) {
    return null;
  }

  return (
    <AzeroId
      address={address}
      chainId={chainId}
      className={className}
      isRegisterLinkShown={isRegisterLinkShown}
    />
  );
};

export const AzeroIdDomain = ({ className, domain, isCopyShown = false, isLogoShown = true }: {className?: string, domain: string, isLogoShown?: boolean, isCopyShown?: boolean}) => {
  const theme = useTheme();

  return (
    <DomainContainer className={className}>
      {isLogoShown && (
        <Logo
          src={theme.theme === 'dark' ? externalAzeroIdLogoPrimarySVG : externalAzeroIdLogoBlackSVG}
        />
      )}
      <span>
        {domain.split(/(?=\.)/).map((domainPart, index) => <span key={index}>{domainPart}<wbr /></span>)}
        {isCopyShown && <SmallIcon icon='copy' />}
      </span>
    </DomainContainer>
  );
};

export const AZERO_ID_ROW_HEIGHT = '16px';

const Placeholder = styled.p`
  width: 160px;
  height: ${AZERO_ID_ROW_HEIGHT};
`;

const Container = styled.p`
  display: flex;
  align-items: center;

  margin: 0;

  color: #8B8B8B;
  font-size: var(--font-size-small);
`;

const StyledLink = styled.a`
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  width: 16px;
  height: ${AZERO_ID_ROW_HEIGHT};
  margin-right: 5px;
`;

const ClickableText = styled.button`
  text-align: left;
  background-color: inherit;
  color: inherit;
  padding: 0;
  border: unset;


  cursor: copy;
`;

const DomainContainer = styled.div`
  word-break: break-word;

  display: flex;
  align-items: center;
`;

const SmallIcon = styled(Icon)`
  width: 10px;
  height: 10px;

  margin-left: 5px;
`;

export default WrappedAzeroId;
