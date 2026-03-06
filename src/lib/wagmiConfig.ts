'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Define Arkiv Kaolin testnet as a custom chain
export const kaolin = defineChain({
    id: 60138453025,
    name: 'Arkiv Kaolin Testnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://kaolin.hoodi.arkiv.network/rpc'] },
    },
    blockExplorers: {
        default: {
            name: 'Arkiv Explorer',
            url: 'https://explorer.kaolin.hoodi.arkiv.network',
        },
    },
    testnet: true,
});

export const wagmiConfig = getDefaultConfig({
    appName: 'ArkEve',
    projectId: '54c238d52f1218087ae00073282addb8', // WalletConnect project ID (placeholder for dev)
    chains: [kaolin],
    ssr: true,
});
