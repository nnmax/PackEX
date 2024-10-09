import { Currency, ETHER, Token } from '@nnmax/uniswap-sdk-v2'
import { useState, useMemo, useRef } from 'react'
import clsx from 'clsx'
import { Button, ListBox, ListBoxItem, Text } from 'react-aria-components'
import { isFunction, isSet } from 'lodash-es'
import { useAccount } from 'wagmi'
import ArrowDown from '@/components/Icons/ArrowDown'
import IconamoonSearchLight from '@/components/Icons/IconamoonSearchLight'
import { useAllTokens, useToken } from '@/hooks/Tokens'
import { isAddress } from '@/utils'
import ToggleButtonGroup from '@/components/ToggleButtonGroup'
import ToggleButton from '@/components/ToggleButton'
import Modal from '@/components/Modal'
import InternalNumberInput from '@/components/NumberInput'
import DoubleCurrencyLogo from '../DoubleLogo'
import CurrencyLogo from '../CurrencyLogo'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { useTokenComparator } from './sorting'
import { filterTokens } from './filtering'
import type { Pair } from '@nnmax/uniswap-sdk-v2'

const selectButtonClasses =
  'flex items-center min-w-32 self-end justify-between rounded-sm bg-[#0f0f0f] px-2 py-1 text-sm text-white relative before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-[18px] before:bg-[#242424] before:[clip-path:polygon(0_2px,100%_0,100%_100%,0_calc(100%-2px))]'

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  onCurrencySelect?: (currency: Token) => void
  currency?: Token | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  otherCurrency?: Token | null
  className?: string
  rhombus?: 'top' | 'bottom'
  errorRhombus?: boolean
  error?: string
  customFilter?: (token: Token) => boolean
  inputLoading?: boolean
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = 'Input',
  onCurrencySelect,
  currency,
  hideBalance = false,
  pair = null, // used for double token logo
  otherCurrency,
  className,
  rhombus,
  error,
  disableCurrencySelect,
  errorRhombus = true,
  customFilter,
  inputLoading,
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { address } = useAccount()
  const [selectedCurrencyBalance, loadingSelectedCurrencyBalance] = useCurrencyBalance(
    address ?? undefined,
    currency ?? undefined,
  )

  return (
    <div
      className={clsx('relative flex flex-col rounded-md bg-[#242424] p-6', className, {
        'border border-[#FF2323] rhombus-bg-[#FF2323]': errorRhombus && error,
        'before:top-rhombus': rhombus === 'top',
        'after:bottom-rhombus': rhombus === 'bottom',
      })}
    >
      {error && (
        <div
          aria-hidden
          className={clsx('absolute z-[1] rhombus-bg-[--body-bg] rhombus-w-[calc(50%-2px)]', {
            'top-rhombus -rhombus-top-px': rhombus === 'top',
            'bottom-rhombus -rhombus-bottom-px bottom-0': rhombus === 'bottom',
          })}
        />
      )}
      <div className={'flex justify-between gap-1'}>
        <InternalNumberInput
          value={value}
          disabled={!currency}
          onUserInput={onUserInput}
          label={label}
          maxDecimals={currency?.decimals}
          loading={inputLoading}
        />
        <Button
          isDisabled={disableCurrencySelect}
          type={'button'}
          className={selectButtonClasses}
          onPress={() => setModalOpen(true)}
        >
          {pair ? (
            <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={20} margin />
          ) : currency ? (
            <CurrencyLogo currency={currency} size={'20px'} />
          ) : null}
          <span>
            {pair
              ? pair.token0.symbol + ':' + pair.token1.symbol
              : (currency && currency.symbol && currency.symbol.length > 20
                  ? currency.symbol.slice(0, 4) +
                    '...' +
                    currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                  : currency?.symbol) || 'CHOOSE'}
          </span>
          {!disableCurrencySelect && <ArrowDown className={'text-lemonYellow'} aria-hidden />}
        </Button>
      </div>
      {!hideBalance && (
        <div className={'my-1.5 flex items-center justify-between text-xs'}>
          <span className={'text-[#FF2323]'}>{error ?? ''}</span>
          <div>
            <span>
              {'BALANCE:'}{' '}
              {loadingSelectedCurrencyBalance ? (
                <span className={'loading'} />
              ) : !!currency && selectedCurrencyBalance ? (
                selectedCurrencyBalance.toSignificant(6)
              ) : (
                ' -'
              )}
            </span>
            {!!currency && showMaxButton && (
              <Button className={'text-lemonYellow ml-2'} onPress={onMax}>
                {'MAX'}
              </Button>
            )}
          </div>
        </div>
      )}

      {!disableCurrencySelect && !!onCurrencySelect && (
        <ChooseModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCurrencySelect={onCurrencySelect}
          otherSelectedCurrency={otherCurrency}
          selectedCurrency={currency}
          showETH
          customFilter={customFilter}
        />
      )}
    </div>
  )
}

function ChooseModal(props: {
  open: boolean
  onClose: () => void
  selectedCurrency?: Token | null
  onCurrencySelect: (currency: Token) => void
  otherSelectedCurrency?: Token | null
  showETH?: boolean
  customFilter?: (token: Token) => boolean
}) {
  const { open, onClose, onCurrencySelect, otherSelectedCurrency, selectedCurrency, showETH, customFilter } = props

  const [searchQuery, setSearchQuery] = useState('')

  const isAddressSearch = isAddress(searchQuery)
  const searchToken = useToken(searchQuery)
  const allTokens = useAllTokens()

  const customFilterRef = useRef(customFilter)
  // eslint-disable-next-line react-compiler/react-compiler
  customFilterRef.current = customFilter
  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken] : []
    return filterTokens(
      // eslint-disable-next-line react-compiler/react-compiler
      isFunction(customFilterRef.current)
        ? // eslint-disable-next-line react-compiler/react-compiler
          Object.values(allTokens).filter((t) => customFilterRef.current!(t))
        : Object.values(allTokens),
      searchQuery,
    )
  }, [isAddressSearch, searchToken, allTokens, searchQuery])

  const tokenComparator = useTokenComparator(false)

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken) return [searchToken]
    const sorted = filteredTokens.sort(tokenComparator)
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0)
    if (symbolMatch.length > 1) return sorted

    return [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter((token) => token.symbol?.toLowerCase() === symbolMatch[0]),
      ...sorted.filter((token) => token.symbol?.toLowerCase() !== symbolMatch[0]),
    ]
  }, [filteredTokens, searchQuery, searchToken, tokenComparator])

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
  }

  const handleCurrencySelect = (currency: Token) => {
    onCurrencySelect(currency)
    onClose()
  }

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const s = e.currentTarget.value.toLowerCase().trim()
      if (s === 'eth') {
        handleCurrencySelect(ETHER as Token)
      } else if (filteredSortedTokens.length > 0) {
        if (
          filteredSortedTokens[0].symbol?.toLowerCase() === searchQuery.trim().toLowerCase() ||
          filteredSortedTokens.length === 1
        ) {
          handleCurrencySelect(filteredSortedTokens[0])
        }
      }
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} padding={'56px'} aria-label={'Choose Tokens'}>
      <div className={'relative h-9 rounded-md bg-[#B8B8B8]'}>
        <span className={'text-xl'}>
          <IconamoonSearchLight className={'absolute left-2 top-2 text-[#696969]'} />
        </span>
        <input
          className={
            'h-full w-full rounded-md bg-transparent pl-9 pr-2 text-sm text-[#0e0e0e] placeholder:text-xs placeholder:text-[#696969]'
          }
          type={'text'}
          placeholder={'SEARCH NAME OR PASTE ADDRESS'}
          value={searchQuery}
          onChange={handleInput}
          onKeyDown={handleEnter}
        />
      </div>
      <SuggestedTokens
        onSelect={handleCurrencySelect}
        selectedCurrency={selectedCurrency}
        showETH={showETH}
        customFilterRef={customFilterRef}
      />
      <hr className={'mb-2 mt-4 h-0.5 w-full border-none bg-[#494949]'} />

      <CurrencyList
        currencies={filteredSortedTokens}
        onCurrencySelect={handleCurrencySelect}
        otherCurrency={otherSelectedCurrency}
        selectedCurrency={selectedCurrency}
        showETH={showETH}
      />
    </Modal>
  )
}

function SuggestedTokens(props: {
  selectedCurrency?: Token | null
  onSelect: (currency: Token) => void
  showETH?: boolean
  customFilterRef: React.RefObject<((token: Token) => boolean) | undefined>
}) {
  const { onSelect, selectedCurrency, showETH, customFilterRef } = props
  const value = selectedCurrency instanceof Token ? selectedCurrency.address : ''
  const allTokens = useAllTokens()
  const options = Object.values(allTokens).filter((token) => {
    if (!token.commonFlag) return false
    return isFunction(customFilterRef.current) ? customFilterRef.current(token) : true
  })

  return (
    <ToggleButtonGroup
      className={'mt-2 flex flex-wrap gap-2 text-sm'}
      value={value}
      onChange={(changedValue) => {
        if (changedValue !== value) {
          if (changedValue === 'eth') {
            onSelect(ETHER as Token)
          } else {
            onSelect(options.find((option) => option.address === changedValue) as Token)
          }
        }
      }}
    >
      {showETH && (
        <ToggleButton
          className={'flex h-8 items-center gap-1 rounded bg-[#0F0F0F] px-1 py-1.5'}
          value={'eth'}
          key={'eth'}
          disabled={selectedCurrency === ETHER}
        >
          <CurrencyLogo currency={ETHER} style={{ marginRight: 8 }} />
          <span>{ETHER.symbol}</span>
        </ToggleButton>
      )}
      {options.map((token) => {
        return (
          <ToggleButton
            className={'flex h-8 items-center gap-1 rounded bg-[#0F0F0F] px-1 py-1.5'}
            value={token.address}
            key={token.address}
            disabled={selectedCurrency === token}
          >
            <CurrencyLogo currency={token} style={{ marginRight: 8 }} />
            <span>{token.symbol}</span>
          </ToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}

function currencyKey(currency: Token) {
  return currency === ETHER ? ETHER.symbol : currency.address
}

function CurrencyList(props: {
  currencies: Token[]
  selectedCurrency?: Token | null
  onCurrencySelect: (currency: Token) => void
  otherCurrency?: Token | null
  showETH?: boolean
}) {
  const { showETH, currencies, onCurrencySelect, otherCurrency, selectedCurrency } = props

  const items = useMemo(() => (showETH ? [Currency.ETHER as Token, ...currencies] : currencies), [currencies, showETH])

  return (
    <ListBox
      className={'max-h-[360px] overflow-y-auto p-1'}
      aria-label={'Choose Token'}
      selectedKeys={selectedCurrency ? new Set([selectedCurrency.address ?? Currency.ETHER.symbol]) : new Set([])}
      selectionMode={'single'}
      disabledKeys={otherCurrency ? new Set([otherCurrency.address ?? Currency.ETHER.symbol]) : new Set([])}
      items={items}
      onSelectionChange={(selectedKeys) => {
        if (isSet(selectedKeys)) {
          if (selectedKeys.size > 0) {
            const address = selectedKeys.values().next().value as string
            const found = items.find((item) => currencyKey(item) === address)
            onCurrencySelect(found!)
          } else if (selectedCurrency) {
            onCurrencySelect(selectedCurrency)
          }
        }
      }}
    >
      {(item) => {
        return (
          <ListBoxItem
            id={currencyKey(item)}
            textValue={item.symbol ?? Currency.ETHER.symbol}
            className={
              'flex h-[60px] cursor-pointer select-none items-center gap-4 rounded-sm px-4 py-3.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300 aria-selected:bg-lemonYellow data-[disabled]:opacity-50 data-[disabled]:pointer-events-none'
            }
          >
            <CurrencyLogo currency={item} size={'32px'} />
            <div className={'flex flex-col justify-between text-white'}>
              <Text slot={'label'} className={'text-sm'}>
                {item.symbol ?? Currency.ETHER.symbol}
              </Text>
              <Text slot={'description'} className={'text-xs'}>
                {item.name ?? Currency.ETHER.name}
              </Text>
            </div>
          </ListBoxItem>
        )
      }}
    </ListBox>
  )
}
