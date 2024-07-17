/**
 * Given a URI that may be ipfs, ipns, http, or https protocol, return the fetch-able http(s) URLs for the same content
 * @param uri to convert to fetch-able http url
 */
export default function uriToHttp(uri: string): string[] {
  const protocol = uri.split(':')[0].toLowerCase()
  switch (protocol) {
    case 'https':
      return [uri]
    case 'http': {
      const localhost = ['localhost', '127.0.0.1', '[::1]']
      try {
        const u = new URL(uri)
        if (localhost.includes(u.hostname)) {
          return [uri]
        }
      } catch (error) {
        /* empty */
      }
      return ['https' + uri.substr(4), uri]
    }
    case 'ipfs': {
      const hash = uri.match(/^ipfs:(\/\/)?(.*)$/i)?.[2]
      return [`https://cloudflare-ipfs.com/ipfs/${hash}/`, `https://ipfs.io/ipfs/${hash}/`]
    }
    case 'ipns': {
      const name = uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2]
      return [`https://cloudflare-ipfs.com/ipns/${name}/`, `https://ipfs.io/ipns/${name}/`]
    }
    default:
      return []
  }
}
