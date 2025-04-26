import { storageUtil } from "@/utils/storage"
import { useEffect, useState } from "react"
export const useVolume = () => {
    const { getVolume, setVolume } = storageUtil()

    const [isVolumeOpen, setIsVolumeOpen] = useState(Number(getVolume()) > 0)

    useEffect(() => {
        setVolume(Number(isVolumeOpen))
    }, [isVolumeOpen])

    return { isVolumeOpen, setIsVolumeOpen }
}
