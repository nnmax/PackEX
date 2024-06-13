export default function verify451Pathname(): void {
  if (window.location.pathname === '/451') {
    throw new Error('You are from a blocked IP')
  }
}
