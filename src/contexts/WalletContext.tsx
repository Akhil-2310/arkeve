'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAccount } from 'wagmi';
import type { Connector } from 'wagmi';
import { queryOrganizerByWallet, type ParsedOrganizer } from '@/lib/entities';

interface WalletContextType {
    address: `0x${string}` | null;
    connector: Connector | undefined;
    isConnected: boolean;
    isOrganizer: boolean;
    organizer: ParsedOrganizer | null;
    loading: boolean;
    refreshOrganizer: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
    address: null,
    connector: undefined,
    isConnected: false,
    isOrganizer: false,
    organizer: null,
    loading: true,
    refreshOrganizer: async () => { },
});

export function useWallet() {
    return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: ReactNode }) {
    const { address: wagmiAddress, connector, isConnected } = useAccount();
    const address = wagmiAddress ?? null;

    const [organizer, setOrganizer] = useState<ParsedOrganizer | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshOrganizer = useCallback(async () => {
        if (!address) {
            setOrganizer(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const org = await queryOrganizerByWallet(address.toLowerCase());
            setOrganizer(org);
        } catch (err) {
            console.error('Failed to query organizer:', err);
            setOrganizer(null);
        } finally {
            setLoading(false);
        }
    }, [address]);

    useEffect(() => {
        refreshOrganizer();
    }, [refreshOrganizer]);

    return (
        <WalletContext.Provider
            value={{
                address,
                connector,
                isConnected,
                isOrganizer: !!organizer,
                organizer,
                loading,
                refreshOrganizer,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}
