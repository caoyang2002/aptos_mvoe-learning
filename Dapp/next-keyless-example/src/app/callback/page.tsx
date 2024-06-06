'use client' // 确保以下代码只在客户端执行
import { jwtDecode } from 'jwt-decode'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getLocalEphemeralKeyPair } from '@/hooks/useEphemeralKeyPair'
import { getAptosClient } from '@/utils/aptosClient'
import { useKeylessAccount } from '@/context/KeylessAccountContext'
import { EphemeralKeyPair, Account } from '@aptos-labs/ts-sdk'
import { KeylessAccountProvider } from '../../context/KeylessAccountContext'

const parseJWTFromURL = (url: string): string | null => {
  const urlObject = new URL(url)
  const fragment = urlObject.hash.substring(1)
  const params = new URLSearchParams(fragment)
  console.log('id_token: ', params.get('id_token'))
  return params.get('id_token')
}

const CallbackPage = () => {
  const { setKeylessAccount } = useKeylessAccount()
  const { push } = useRouter()
  const [progress, setProgress] = useState<number>(0)
  const [hasError, setHasError] = useState<boolean>(false)

  useEffect(() => {
    // 仅在客户端执行
    async function deriveAccount() {
      const jwt = parseJWTFromURL(window.location.href)
      if (!jwt) {
        setHasError(true)
        setProgress(100)
        console.log('No JWT found in URL. Please try logging in again.')
        return
      }
      const payload = jwtDecode<{ nonce: string }>(jwt)
      const jwtNonce = payload.nonce
      const ephemeralKeyPair = getLocalEphemeralKeyPair(jwtNonce)

      if (!ephemeralKeyPair) {
        setHasError(true)
        setProgress(100)
        console.log(
          'No ephemeral key pair found for the given nonce. Please try logging in again.'
        )
        return
      }
      await createKeylessAccount(jwt, ephemeralKeyPair)

      setProgress(100)
      push('/')
    }
    deriveAccount()
  }, [])

  const createKeylessAccount = async (
    jwt: string,
    ephemeralKeyPair: EphemeralKeyPair
  ) => {
    const aptosClient = getAptosClient()
    const keylessAccount = await aptosClient.deriveKeylessAccount({
      jwt,
      ephemeralKeyPair,
    })
    console.log('Keyless Account: ', keylessAccount.accountAddress.toString())
    setKeylessAccount(keylessAccount)
  }

  return (
    <KeylessAccountProvider>
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="relative flex justify-center items-center border rounded-lg px-8 py-2 shadow-sm cursor-not-allowed tracking-wider">
          <span className="absolute flex h-3 w-3 -top-1 -right-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Redirecting...
        </div>
      </div>
    </KeylessAccountProvider>
  )
}

export default CallbackPage
