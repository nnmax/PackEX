import LinkTab from '@/components/LinkTab'
import NavTabs from '@/components/NavTabs'

export default function PoolLayout(props: { activeTab?: 'all' | 'my'; children: React.ReactNode }) {
  const { children, activeTab } = props

  return (
    <div className={'px-16 py-8'}>
      <NavTabs>
        <LinkTab to={'/pool/all'} isSelected={activeTab === 'all'}>
          {'ALL POOLS'}
        </LinkTab>
        <LinkTab to={'/pool/my'} isSelected={activeTab === 'my'}>
          {'My Pools'}
        </LinkTab>
      </NavTabs>
      {children}
    </div>
  )
}
