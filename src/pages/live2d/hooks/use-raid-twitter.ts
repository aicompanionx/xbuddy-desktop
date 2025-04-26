import { useQuery } from "@tanstack/react-query"

export const useRaidTwitter = (ca: string) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['raid-twitter', ca],
        queryFn: () => {
            return window.electronAPI.getTokenChain(ca)
        }
    })

    const { data: tokenDetail, isLoading: tokenDetailLoading, error: tokenDetailError } = useQuery({
        queryKey: ['raid-twitter-detail', ca, data?.chain],
        queryFn: () => {
            return window.electronAPI.getTokenDetail(ca, data?.chain)
        }
    })

    const { data: raidContent, isLoading: raidContentLoading, error: raidContentError } = useQuery({
        queryKey: ['raid-twitter-content', ca, data?.chain],
        queryFn: () => {
            return window.electronAPI.pushRaid({
                token_name: tokenDetail?.name,
                token_symbol: tokenDetail?.symbol,
                token_ca: ca,
                token_description: tokenDetail?.description,
                logo_content: tokenDetail?.logo_url,
                chain: data?.chain
            })
        }
    })

    return { data, isLoading, error, tokenDetail, tokenDetailLoading, tokenDetailError, raidContent, raidContentLoading, raidContentError }
}

