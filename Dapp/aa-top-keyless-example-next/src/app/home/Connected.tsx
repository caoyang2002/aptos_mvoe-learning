'use client'

import { useEffect, useCallback, useState } from 'react'
import { getAptosClient } from '@/utils/aptosClient'
import { useKeylessAccount } from '@/context/KeylessAccountContext'
import Header from './body/Header'
import Footer from './body/Footer'

const aptosClient = getAptosClient()

export function Connected() {
  const { keylessAccount } = useKeylessAccount()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)

  const fetch = useCallback(async () => {
    if (!keylessAccount?.accountAddress) {
      setIsLoading(true) // 如果没有账户地址，停止加载状态
      return
    }
    setIsLoading(false) // 正在加载
    try {
      console.log('加载中')
    } catch (error) {
      // 处理错误
      console.error(error)
    } finally {
      setIsLoading(false) // 加载结束
      console.log('加载结束')
    }
  }, [keylessAccount, setIsLoading])

  useEffect(() => {
    fetch()
    if (!keylessAccount?.accountAddress) return
    console.log('address: ', keylessAccount.accountAddress)
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
    <>
      <Header />
      <div className="flex flex-col gap-3 p-3 justify-center items-center">
        <div className="flex flex-col gap-3 p-3 justify-center items-center">
          {isLoading ? (
            <div className="nes-container with-title">
              <p className="title">Loading...</p>
              <progress
                className="nes-progress is-primary"
                value={progress}
                max="100"
              ></progress>
            </div>
          ) : (
            <div className="nes-container with-title">
              <p className="title">Connected</p>
              <p className="title">
                {keylessAccount?.accountAddress.toString()}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
