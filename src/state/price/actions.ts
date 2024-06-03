import { createAction } from '@reduxjs/toolkit'

export const updatePrice = createAction<{ price: string }>('price/updatePrice')
