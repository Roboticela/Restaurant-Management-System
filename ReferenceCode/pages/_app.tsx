import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Head from 'next/head'

const DEFAULT_LOGO = `data:image/svg+xml;base64,${Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
  <path fill="#2DD4BF" d="M416 0C400 0 288 32 288 176V288c0 35.3 28.7 64 64 64h32V480c0 17.7 14.3 32 32 32s32-14.3 32-32V352 240 32c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7.1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7V480c0 17.7 14.3 32 32 32s32-14.3 32-32V255.6c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L191.6 12.5c-1.8-8-9.3-13.3-17.4-12.4S160 7.8 160 16V150.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L127.9 14.6C127.2 6.3 120.3 0 112 0s-15.2 6.3-15.9 14.6L83.7 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8V16z"/>
</svg>
`).toString('base64')}`;

function MyApp({ Component, pageProps }: AppProps) {
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await axios.get('/api/settings');
        if (response.data?.logo) {
          setLogo(response.data.logo);
        } else {
          setLogo(DEFAULT_LOGO);
        }
      } catch (error) {
        console.error('Error loading logo:', error);
        setLogo(DEFAULT_LOGO);
      }
    };

    loadLogo();

    // Disable right-click context menu (optional)
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Handle external links to open in default browser (optional)
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('http')) {
        e.preventDefault();
        // @ts-ignore
        if (window.electron) {
          // @ts-ignore
          window.electron.openExternal(target.getAttribute('href'));
        }
      }
    });
  }, []);

  return (
    <>
      <Head>
        <link rel="icon" type="image/svg+xml" href={logo || DEFAULT_LOGO} />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
