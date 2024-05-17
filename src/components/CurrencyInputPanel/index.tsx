import { ChainId, Currency, ETHER, Pair, Token } from '@nnmax/uniswap-sdk-v2'
import { useState, useRef, useMemo } from 'react'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import ArrowDown from '@/components/Icons/ArrowDown'
import { useActiveWeb3React } from '../../hooks'
import clsx from 'clsx'
import { Button, Input, Label, ListBox, ListBoxItem, NumberField, Text } from 'react-aria-components'
import Dialog from '@/components/Dialog'
import IconamoonSearchLight from '@/components/Icons/IconamoonSearchLight'
import { FixedSizeList } from 'react-window'
import { useAllTokens, useToken } from '@/hooks/Tokens'
import { isAddress } from '@/utils'
import { filterTokens } from '@/components/SearchModal/filtering'
import { useTokenComparator } from '@/components/SearchModal/sorting'
import { SUGGESTED_BASES } from '@/constants'
import ToggleButtonGroup from '@/components/ToggleButtonGroup'
import ToggleButton from '@/components/ToggleButton'
import { isSet } from 'lodash-es'

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
  hideInput?: boolean
  otherCurrency?: Token | null
  id?: string
  showCommonBases?: boolean
  className?: string
  rhombus?: 'top' | 'bottom'
  insufficientBalance?: boolean
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
  insufficientBalance,
  disableCurrencySelect,
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  return (
    <div
      className={clsx('relative flex flex-col rounded-md bg-[#242424] p-6', className, {
        'border border-[#FF2323] rhombus-bg-[#FF2323]': insufficientBalance,
        'before:top-rhombus': rhombus === 'top',
        'after:bottom-rhombus': rhombus === 'bottom',
      })}
    >
      {insufficientBalance && (
        <div
          aria-hidden
          className={clsx('absolute z-[1] rhombus-bg-[--body-bg] rhombus-w-[calc(50%-2px)]', {
            'top-rhombus -rhombus-top-px': rhombus === 'top',
            'bottom-rhombus -rhombus-bottom-px bottom-0': rhombus === 'bottom',
          })}
        />
      )}
      <div className={'flex justify-between gap-1'}>
        <NumberField
          value={Number(value)}
          minValue={0}
          isDisabled={!currency}
          onChange={(changedValue) => onUserInput(changedValue.toString())}
        >
          <Label className={'mb-2 text-xs text-[#9E9E9E] block'}>{label}</Label>
          <Input
            placeholder={'0'}
            className={'w-full bg-transparent text-white outline-none reset-input-number placeholder:text-[#9e9e9e]'}
          />
        </NumberField>
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
      {!!account && !hideBalance && (
        <div className={'my-1.5 flex items-center justify-between text-xs'}>
          <span className={'text-[#FF2323]'}>{insufficientBalance ? 'INSUFFICIENT FUNDS' : ''}</span>
          <div>
            <span>
              {'BALANCE: ' + (!!currency && selectedCurrencyBalance ? selectedCurrencyBalance.toSignificant(6) : ' -')}
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
}) {
  const { open, onClose, onCurrencySelect, otherSelectedCurrency, selectedCurrency } = props

  const [searchQuery, setSearchQuery] = useState('')
  const fixedList = useRef<FixedSizeList>()
  const { chainId } = useActiveWeb3React()

  const isAddressSearch = isAddress(searchQuery)
  const searchToken = useToken(searchQuery)
  const allTokens = useAllTokens()

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken] : []
    return filterTokens(Object.values(allTokens), searchQuery)
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
    fixedList.current?.scrollTo(0)
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
    <Dialog open={open} onClose={onClose} panelClassName={'!max-w-[480px]'}>
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
      <SuggestedTokens chainId={chainId} onSelect={handleCurrencySelect} selectedCurrency={selectedCurrency} />
      <hr className={'mb-2 mt-4 h-0.5 w-full border-none bg-[#494949]'} />

      <CurrencyList
        currencies={filteredSortedTokens}
        onCurrencySelect={handleCurrencySelect}
        showETH
        otherCurrency={otherSelectedCurrency}
        selectedCurrency={selectedCurrency}
      />
    </Dialog>
  )
}

function SuggestedTokens(props: {
  chainId?: ChainId
  selectedCurrency?: Token | null
  onSelect: (currency: Token) => void
}) {
  const { chainId, onSelect, selectedCurrency } = props
  const value = selectedCurrency instanceof Token ? selectedCurrency.address : ''
  const options = chainId ? SUGGESTED_BASES[chainId] : []

  return (
    <ToggleButtonGroup
      className={'mt-2 flex flex-wrap gap-2 text-sm'}
      value={value}
      onChange={(changedValue) => {
        if (changedValue !== value) {
          onSelect(options.find((option) => option.address === changedValue) as Token)
        }
      }}
    >
      {(chainId ? SUGGESTED_BASES[chainId] : []).map((token) => {
        return (
          <ToggleButton
            className={'flex h-8 items-center gap-1 rounded bg-[#0F0F0F] px-1 py-1.5'}
            value={token.address}
            key={token.address}
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
  showETH: boolean
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
            onCurrencySelect(found as Token)
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
