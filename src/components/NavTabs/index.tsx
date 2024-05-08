import clsx from 'clsx'

export default function NavTabs(props: { children: React.ReactNode; tabListClassName?: string }) {
  const { children, tabListClassName } = props

  return (
    <div role={'navigation'} className={'relative'}>
      <div role={'tablist'} className={clsx('flex h-8 flex-row gap-x-10 text-sm text-white', tabListClassName)}>
        {children}
      </div>
    </div>
  )
}
