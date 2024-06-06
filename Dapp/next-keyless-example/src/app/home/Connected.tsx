'use client'

import { useEffect, useCallback, useState } from 'react'
import { getAptosClient } from '@/utils/aptosClient'
import { useKeylessAccount } from '@/context/KeylessAccountContext'

const aptosClient = getAptosClient()

export function Connected() {
  const { keylessAccount } = useKeylessAccount()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    if (!keylessAccount?.accountAddress) return
  }, [keylessAccount?.accountAddress])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return currentProgress + 1
      })
    }, 25)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col gap-3 p-3 justify-center items-center">
      <div className="nes-container with-title">
        <p className="title">Loading...</p>
        <progress
          className="nes-progress is-primary"
          value={progress}
          max="100"
        ></progress>
      </div>
    </div>
  )
}
