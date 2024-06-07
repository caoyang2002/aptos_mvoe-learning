import { Body } from '@/app/home/Body'
import ClientOnly from '@/components/ClientOnly'
export default function Home() {
  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-between p-24">
        <ClientOnly>
          <Body />
        </ClientOnly>
      </div>
    </>
  )
}
