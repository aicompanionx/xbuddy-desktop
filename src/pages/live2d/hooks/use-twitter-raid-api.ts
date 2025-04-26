import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TwitterRaidExecutionResult, TwitterRaidRequest, TwitterRaidResponse } from '@/service/preload/twitter-raid-api'
import { toast } from 'sonner'
import { sleep } from '@/utils/time'

export const useLive2DAPI = () => {
    const isStopRef = useRef(false)
    const raidStatusContainerRef = useRef<HTMLDivElement>(null)
    const { t } = useTranslation()
    const [raidResults, setRaidResults] = useState<TwitterRaidResponse | null>(null)
    const [isRaidStatusOpen, setIsRaidStatusOpen] = useState(false)
    const [targetCount, setTargetCount] = useState(0)
    const [raidCount, setRaidCount] = useState(0)
    const [processMessage, setProcessMessage] = useState('')
    const [executeRaidResult, setExecuteRaidResult] = useState<TwitterRaidExecutionResult | null>(null)
    const [tokenCA, setTokenCA] = useState<string>('')
    const [isLoginNeed, setIsLoginNeed] = useState(false)
    /**
     * Execute a Twitter raid with specified parameters
     * 
     * @param tokenCA - Contract address of the token
     * @param count - Number of raids to execute
     */
    const executeRaid = async (
        tokenCA: string,
    ): Promise<TwitterRaidExecutionResult | null> => {
        try {
            isStopRef.current = false

            setIsRaidStatusOpen(true)
            setProcessMessage(t('twitter.gettingChainInfo'))
            // Get token chain information
            const chainResponse = await window.electronAPI.getTokenChain(tokenCA)

            if (!chainResponse || !chainResponse.chain || isStopRef.current) {
                toast.error(t('twitter.chainError'))
                return null
            }

            setProcessMessage(t('twitter.gettingTokenDetails'))

            const chain = chainResponse.chain

            await sleep(500)

            if (isStopRef.current) {
                return null
            }

            // Get token details
            const tokenDetailResponse = await window.electronAPI.getTokenDetail(tokenCA, chain)

            if (isStopRef.current) {
                return null
            }

            console.log("tokenDetailResponse", tokenDetailResponse);
            const tokenDescription = tokenDetailResponse?.description || t('twitter.noDescription')

            setProcessMessage(t('twitter.buildingRequest'))

            await sleep(500)

            if (isStopRef.current) {
                return null
            }

            // Build request object
            const request: TwitterRaidRequest = {
                token_ca: tokenCA,
                token_name: tokenDetailResponse?.name || 'Token',
                token_symbol: tokenDetailResponse?.symbol || 'TKN',
                token_description: tokenDescription,
                logo_content: tokenDetailResponse?.logo_url || '',
                chain: chain
            }

            setProcessMessage(t('twitter.pushingRaid'))

            // Execute request
            const response = await window.electronAPI.pushRaid(request)

            if (isStopRef.current) {
                return null
            }

            console.log("response", response);
            setRaidResults(response)

            await sleep(500)

            if (isStopRef.current) {
                return null
            }

            setProcessMessage(t('twitter.executingRaid'))

            const result = await window.electronAPI.executeRaid(response)

            if (isStopRef.current) {
                return null
            }

            console.log("result", result);
            setProcessMessage(t('twitter.raidSuccess'))

            setExecuteRaidResult(result)

            return result
        } catch (error) {
            toast.error(t('twitter.raidError'))
            return null
        } finally {
            isStopRef.current = false
        }
    }

    /**
     * Stop a running raid
     */
    const stopRaid = async () => {
        isStopRef.current = true
        setIsRaidStatusOpen(false)
        setRaidResults(null)
        setExecuteRaidResult(null)
        setTargetCount(0)
        setRaidCount(0)
        setProcessMessage('')
        setTokenCA('')
        setIsLoginNeed(false)
        await window.electronAPI.stopRaid()
    }

    const loginContinue = async () => {
        await window.electronAPI.loginContinue()
        setIsLoginNeed(false)
    }


    useEffect(() => {
        // Set up the listener to receive process status updates
        const cleanup = window.electronAPI.onRaidStatus((result) => {

            console.log("message", result);

            // Update process message if not empty
            if (result.message && result.message?.message) {
                setProcessMessage(result.message.message);

                if (result.message.message === t('twitter.task') && raidCount < targetCount) {
                    setProcessMessage(t('twitter.start.raid'))
                    setRaidCount(raidCount + 1)
                    sleep(500).then(() => {
                        executeRaid(tokenCA)
                    })
                }
            }
        });

        // Clean up the listener when the component unmounts
        return () => {
            if (typeof cleanup === 'function') {
                cleanup();
            }
        };
    }, [raidCount, targetCount]);

    useEffect(() => {
        const cleanup = window.electronAPI.onLoginNeed(() => {
            setIsLoginNeed(true)
        })

        return () => {
            cleanup()
        }
    }, [])

    useEffect(() => {
        if (raidCount <= 0 && processMessage === t('twitter.task')) {
            setProcessMessage('')
            setIsRaidStatusOpen(false)
        }
    }, [raidCount])

    return {
        raidStatusContainerRef,
        raidResults,
        isRaidStatusOpen,
        setIsRaidStatusOpen,
        executeRaid,
        stopRaid,
        processMessage,
        executeRaidResult,
        targetCount,
        raidCount,
        setTargetCount,
        setRaidCount,
        loginContinue,
        tokenCA,
        setTokenCA,
        isLoginNeed,
    }
} 