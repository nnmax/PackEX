import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import './index.css'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" dir="ltr">
      <head>
        <title>PackEX</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f0f0f" />
        <Meta />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
