import './index.css'
import clsx from 'clsx'
import {
  Cell,
  Checkbox as AriaCheckbox,
  Collection,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  useTableOptions,
  type Selection,
} from 'react-aria-components'
import { useRef, useState } from 'react'
import { take } from 'lodash-es'
import { toast } from 'react-toastify'
import { useUserInfo } from '@/api/get-user'
import { useWithdrawRunesAdmin } from '@/api/withdraw-runes-admin'
import ShortenAddressCopy from '@/components/ShortenAddressCopy'
import useDocumentTitle from '@/hooks/useDocumentTitle'
import isAdmin from '@/utils/isAdmin'
import { ButtonSecondary } from '@/components/Button'
import useRunesBatch from '@/api/get-runes-batch'
import useUpdateRunesBatch from '@/api/update-runes-batch'
import useBTCWallet from '@/hooks/useBTCWallet'
import useDisconnectBtcOnUnmounted from '@/hooks/useDisconnectBtcOnUnmounted'
import type { Id } from 'react-toastify'
import type { CheckboxProps, ColumnProps, RowProps, TableHeaderProps } from 'react-aria-components'

const ALLOW_SELECT_COUNT = 20

export default function Admin() {
  useDocumentTitle('Admin')
  const { data: userInfo, isLoading: isLoadingUserInfo } = useUserInfo()
  const {
    data: tableData,
    isLoading: isLoadingTableData,
    refetch,
  } = useWithdrawRunesAdmin({
    enabled: isAdmin(userInfo?.ethAddress),
  })
  const tableLoading = isLoadingUserInfo || isLoadingTableData
  const [selectedKeys, setSelectedKeys] = useState<Set<number>>(new Set())
  const toastIdRef = useRef<Id | null>(null)
  const { mutateAsync: runsBatchAsync } = useRunesBatch()
  const { mutateAsync: updateRunsBatch } = useUpdateRunesBatch()
  const { connect, verifyNetwork, signPsbt, pushPsbt } = useBTCWallet()
  const [buttonLoading, setButtonLoading] = useState(false)

  const handleSelectionChange = (_selectedKeys: Selection) => {
    let finallySelectedKeys = new Set<number>()
    let hasOverLimit = false
    if (_selectedKeys === 'all') {
      const keys = tableData?.list.map((item) => item.id) || []
      if (keys.length > ALLOW_SELECT_COUNT) {
        finallySelectedKeys = new Set(take(keys, ALLOW_SELECT_COUNT))
        hasOverLimit = true
      } else {
        finallySelectedKeys = new Set(keys)
      }
    } else if (_selectedKeys.size > ALLOW_SELECT_COUNT) {
      const arr = Array.from(_selectedKeys as Set<number>)
      finallySelectedKeys = new Set(take(arr, ALLOW_SELECT_COUNT))
      hasOverLimit = true
    } else {
      finallySelectedKeys = _selectedKeys as Set<number>
    }

    setSelectedKeys(finallySelectedKeys)

    if (hasOverLimit && toastIdRef.current === null) {
      toastIdRef.current = toast.warn(`You can only select ${ALLOW_SELECT_COUNT} items at most`, {
        onClose: () => {
          toastIdRef.current = null
        },
      })
    }
  }

  const handleTransfer = async () => {
    try {
      setButtonLoading(true)
      const { network } = await connect('unisat')
      await verifyNetwork('unisat', network)
      const keys = Array.from(selectedKeys)
      const { messageToBeSigned } = await runsBatchAsync({
        withdrawRecordIdList: keys,
      })
      const psbtHex = await signPsbt('unisat', messageToBeSigned)
      const txId = await pushPsbt('unisat', psbtHex)
      await updateRunsBatch({
        broadcastTxHash: txId,
        withdrawRecordIdList: keys,
      })
      await refetch()
    } catch (error) {
      console.error(error)
    } finally {
      setButtonLoading(false)
    }
  }

  const renderSelectedItems = () => {
    const count = selectedKeys.size
    if (count <= 0) return null
    return `Selected ${count} item${count > 1 ? 's' : ''}`
  }

  useDisconnectBtcOnUnmounted()

  if (!isAdmin(userInfo?.ethAddress)) return null

  return (
    <div className={'mt-8'}>
      <div className={'flex justify-end mb-4 gap-4 items-center'}>
        <span className={'text-[--text-color]'}>{renderSelectedItems()}</span>
        <ButtonSecondary isLoading={buttonLoading} isDisabled={!selectedKeys.size} onPress={handleTransfer}>
          {'Transfer'}
        </ButtonSecondary>
      </div>
      <Table
        selectionMode={'multiple'}
        aria-label={'Withdraw Runes Data'}
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
      >
        <CheckableTableHeader>
          <CheckableColumn isRowHeader>{'ETH Address'}</CheckableColumn>
          <CheckableColumn>{'BTC Address'}</CheckableColumn>
          <CheckableColumn>{'Symbol'}</CheckableColumn>
          <CheckableColumn>{'Amount'}</CheckableColumn>
          <CheckableColumn>{'Network Fee'}</CheckableColumn>
          <CheckableColumn>{'Amount Received'}</CheckableColumn>
          <CheckableColumn>{'Runes ID'}</CheckableColumn>
        </CheckableTableHeader>
        <TableBody
          items={tableData?.list}
          renderEmptyState={
            tableLoading
              ? () => <span className={clsx({ 'loading text-2xl': tableLoading })} />
              : () => <p className={'mt-2 text-sm text-[#9e9e9e]'}>{'NO DATA'}</p>
          }
        >
          {(item) => (
            <CheckableRow id={item.id}>
              <Cell>
                <ShortenAddressCopy address={item.ethAddress} />
              </Cell>
              <Cell>
                <ShortenAddressCopy address={item.btcAddress} isBtcAddress />
              </Cell>
              <Cell>{item.symbol}</Cell>
              <Cell>{item.amount}</Cell>
              <Cell>{item.amountNetworkFee}</Cell>
              <Cell>{item.amountReceived}</Cell>
              <Cell>{item.runesId}</Cell>
            </CheckableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function CheckableTableHeader<T extends object>({ columns, children, className, ...restProps }: TableHeaderProps<T>) {
  const { selectionBehavior, selectionMode } = useTableOptions()

  return (
    <TableHeader className={className} {...restProps}>
      {selectionBehavior === 'toggle' && (
        <Column>{selectionMode === 'multiple' && <Checkbox slot={'selection'} />}</Column>
      )}
      <Collection items={columns}>{children}</Collection>
    </TableHeader>
  )
}

function CheckableRow<T extends object>({ id, columns, children, ...otherProps }: RowProps<T>) {
  const { selectionBehavior } = useTableOptions()

  return (
    <Row id={id} {...otherProps}>
      {selectionBehavior === 'toggle' && (
        <Cell>
          <Checkbox slot={'selection'} />
        </Cell>
      )}
      <Collection items={columns}>{children}</Collection>
    </Row>
  )
}

function CheckableColumn(props: ColumnProps) {
  const { children, ...restProps } = props
  return (
    <Column {...restProps}>
      {({ allowsSorting, sortDirection }) => (
        <>
          {children}
          {allowsSorting && (
            <span aria-hidden={'true'} className={'sort-indicator'}>
              {sortDirection === 'ascending' ? '▲' : '▼'}
            </span>
          )}
        </>
      )}
    </Column>
  )
}

function Checkbox({ children, ...props }: CheckboxProps) {
  return (
    <AriaCheckbox {...props}>
      {({ isIndeterminate }) => (
        <>
          <div className={'checkbox'}>
            <svg viewBox={'0 0 18 18'} aria-hidden={'true'}>
              {isIndeterminate ? <rect x={1} y={7.5} width={15} height={3} /> : <polyline points={'1 9 7 14 15 4'} />}
            </svg>
          </div>
          {children}
        </>
      )}
    </AriaCheckbox>
  )
}
