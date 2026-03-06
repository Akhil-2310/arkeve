import { createPublicClient, createWalletClient, http, custom, type EIP1193Provider } from '@arkiv-network/sdk';
import { kaolin } from '@arkiv-network/sdk/chains';
import type { Connector } from 'wagmi';

// Kaolin Testnet Configuration
export const KAOLIN_RPC = 'https://kaolin.hoodi.arkiv.network/rpc';
export const KAOLIN_EXPLORER = 'https://explorer.kaolin.hoodi.arkiv.network';
export const KAOLIN_FAUCET = 'https://kaolin.hoodi.arkiv.network/faucet/';

// Public client for read-only queries (no wallet needed)
export const publicClient = createPublicClient({
  chain: kaolin,
  transport: http(KAOLIN_RPC),
});

// Create an Arkiv wallet client from the wagmi connector provider.
export async function getArkivWalletClient(connector: Connector, address: `0x${string}`) {
  const provider = (await connector.getProvider()) as EIP1193Provider;

  return createWalletClient({
    chain: kaolin,
    transport: custom(provider),
    account: address,
  });
}
