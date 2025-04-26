export const hasAddress = (address: string) => {
    const trimmedText = address.trim();

    if (trimmedText.length < 32) {
        return { isValid: false, address: null };
    }

    const ethAddressMatch = trimmedText.match(/0x[0-9a-fA-F]{40}/);

    const solAddressMatch = trimmedText.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);

    if (ethAddressMatch) {
        return { isValid: true, address: ethAddressMatch[0] };
    }

    if (solAddressMatch) {
        return { isValid: true, address: solAddressMatch[0] };
    }

    return { isValid: false, address: null };
}
