import Script from 'next/script'
import './globals.css'

export const metadata = {
  title: 'Pet To Human AI - Generate Human Lookalike Portrait',
  description: 'Upload your cat or dog photo, get a human portrait with equivalent age.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense 代码（你审核通过后替换） */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}