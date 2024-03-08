import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { type PayloadAction } from '@reduxjs/toolkit'
interface DataState {
  loading: boolean
  loadingMessage: string
  messageType: string
}

const initialState: DataState = {
  loading: false,
  loadingMessage: '',
  messageType: 'alert-success',
}

interface Payload {
  zfile: File
}

export const upload = createAsyncThunk(
  'data/upload',
  async (action: Payload) => {
    if (action.zfile) {
      const data = new FormData()
      data.append('file', action.zfile)
      const res = await fetch(
        `${window.location.protocol}//${window.location.hostname}/api/upload`,
        {
          method: 'POST',
          body: data,
        }
      )

      return { status: res.status, data: await res.json() }
    }
  }
)

export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setLoading: (state: DataState, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setLoadingMessage: (state: DataState, action: PayloadAction<string>) => {
      state.loadingMessage = action.payload
    },
  },
  extraReducers(builder) {
    builder
      .addCase(upload.pending, (state, _action) => {
        state.loading = true
        state.loadingMessage = 'Uploading File...'
        state.messageType = 'alert-success'
      })
      .addCase(upload.fulfilled, (state, action) => {
        state.loading = false
        state.loadingMessage = action.payload?.data.message
        state.messageType =
          action.payload?.status === 200 ? 'alert-success' : 'alert-error'
      })
      .addCase(upload.rejected, (state, action) => {
        state.loading = false
        state.loadingMessage = action.error.message || ''
        state.messageType = 'alert-error'
      })
  },
})

export const { setLoading, setLoadingMessage } = dataSlice.actions
export default dataSlice.reducer
