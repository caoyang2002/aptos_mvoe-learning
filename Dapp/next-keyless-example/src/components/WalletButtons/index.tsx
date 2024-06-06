'use client'

import GoogleLogo from '../GoogleLogo'
import useEphemeralKeyPair from '@/hooks/useEphemeralKeyPair'
import { useKeylessAccount } from '@/context/KeylessAccountContext'
// import { KeylessAccountProvider } from '@/context/KeylessAccountContext'
// // import { useKeylessAccount } from "@/context/KeylessAccountContext";
// // import { collapseAddress } from "@/utils/address";
// // import { toast } from "sonner";

// const { keylessAccount, setKeylessAccount } = useKeylessAccount()
const buttonStyles =
  'nes-btn flex items-center justify-center md:gap-4 py-2 flex-nowrap whitespace-nowrap'

export default function WalletButtons() {
  const ephemeralKeyPair = useEphemeralKeyPair()

  const redirectUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')

  const searchParams = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    redirect_uri:
      typeof window !== 'undefined'
        ? `${window.location.origin}/callback`
        : (process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000'
            : process.env.NEXT_PUBLIC_VERCEL_URL) + '/callback',
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: ephemeralKeyPair.nonce,
  })

  redirectUrl.search = searchParams.toString()
  console.log('redirectUrl: ', redirectUrl.search)

  // const disconnect = () => {
  //   setKeylessAccount(null)
  //   // toast.success("Successfully disconnected account");
  // }

  // if (keylessAccount) {
  //   return (
  //     <div className="flex items-center justify-center m-auto sm:m-0 sm:px-4">
  //       <button
  //         className={buttonStyles}
  //         onClick={disconnect}
  //         title="Disconnect Wallet"
  //       >
  //         <GoogleLogo />
  //         <span title={keylessAccount.accountAddress.toString()}>
  //           {/* {collapseAddress(keylessAccount.accountAddress.toString())} */}
  //         </span>
  //       </button>
  //     </div>
  //   )
  // }

  return (
    <>
      {/* <KeylessAccountProvider> */}
      <div className="flex items-center justify-center m-auto sm:m-0 sm:px-4">
        <a href={redirectUrl.toString()} className="hover:no-underline">
          <button className={buttonStyles}>
            <GoogleLogo />

            <p>Sign in with Google</p>
          </button>
        </a>
      </div>
      {/* </KeylessAccountProvider> */}
    </>
  )
}
