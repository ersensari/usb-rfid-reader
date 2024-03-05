import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import { dataSlice } from './dataSlice'

export const store = configureStore({
  reducer: {
    data: dataSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      enableMapSet: true,      
    }),
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch

export default store
