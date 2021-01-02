import { useEffect } from "react"

type CleanupFunction = () => void

// Call the function only once after the first component render
export const useOnce = (fun: () => void | CleanupFunction) => {
    useEffect(() => {
        return fun()
    }, [])
}