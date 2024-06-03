import { updatePrice } from '@/state/price/actions'
import { createReducer } from '@reduxjs/toolkit'

export interface PriceState {
  readonly price: string | null
}

const initialState: PriceState = {
  price: null,
}

export default createReducer<PriceState>(initialState, (builder) =>
  builder.addCase(updatePrice, (state, { payload: { price } }) => {
    state.price = price
  }),
)
