import Head from 'next/head'

export default function Home() {
  return (
    <div>
      <Head>
        <title>我的 Next.js 应用</title>
      </Head>
      <header>
        <h1>我的网站</h1>
      </header>
      <main>
        <h2>欢迎来到我的网站</h2>
        <p>这里是网站的主要内容。</p>
      </main>
      <footer>
        <p>版权所有 &copy; 2023</p>
      </footer>
    </div>
  )
}
