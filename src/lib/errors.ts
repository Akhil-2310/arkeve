/**
 * Parse blockchain / Arkiv errors into user-friendly messages.
 */
export function parseTransactionError(err: unknown): string {
    const message =
        err instanceof Error ? err.message : String(err);

    // User rejected in MetaMask
    if (
        message.includes('User rejected') ||
        message.includes('user rejected') ||
        message.includes('ACTION_REJECTED') ||
        message.includes('User denied')
    ) {
        return 'Transaction cancelled. You rejected the signature request in your wallet.';
    }

    // RPC / network errors
    if (message.includes('RPC endpoint returned HTTP client error')) {
        return 'Network error. The data may be too large — try using a smaller image or shorter description.';
    }

    if (
        message.includes('insufficient funds') ||
        message.includes('Insufficient funds')
    ) {
        return 'Insufficient funds. Make sure your wallet has enough tokens on the Kaolin network.';
    }

    // Chain / network mismatch
    if (
        message.includes('chain') ||
        message.includes('network') ||
        message.includes('chainId')
    ) {
        return 'Wrong network. Please switch to the Kaolin network in your wallet.';
    }

    // Timeout
    if (message.includes('timeout') || message.includes('Timeout')) {
        return 'Request timed out. Please check your internet connection and try again.';
    }

    // Generic but still informative
    if (message.length > 200) {
        return 'Transaction failed. Please make sure you are connected to the Kaolin network and try again.';
    }

    return message;
}
