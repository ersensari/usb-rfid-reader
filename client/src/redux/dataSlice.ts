import { createSlice } from '@reduxjs/toolkit'
import { type PayloadAction } from '@reduxjs/toolkit'
import { getStore } from '../utils/store'
import { uniqBy } from 'lodash-es'
interface DataState {
  loading: boolean
  loadingMessage: string
  certError: boolean
  isLoaded: boolean
  manifest: Array<Manifest>
  apiUrls: ItemLocationApi[]
  filters: FilterCriteria
}

const initialState: DataState = {
  loading: false,
  loadingMessage: 'Computing Data...',
  certError: false,
  isLoaded: false,
  manifest: [],
  apiUrls: [],
  filters: {
    keycode: null,
    location: null,
    onlyEmpty: false,
    suppressDuplicate: true,
    departments: null,
    status: 'all',
  },
}

interface Payload {
  manifest: Array<Manifest>
}

type ItemLocationApi = {
  manifestNo: number
  uris: ItemLocationApiUrl[]
}
type ItemLocationApiUrl = {
  keycode: number
  uri: string
}

type FilterCriteria = {
  keycode: string | null
  location: string | null
  onlyEmpty: boolean
  suppressDuplicate: boolean
  departments: number[] | null
  status: string | null
}

const serverPrefixes = new Map<string, string>([
  ['NZ', 'KZ'],
  ['VIC', 'KV'],
  ['SA', 'KS'],
  ['NSW', 'KN'],
  ['QLD', 'KQ'],
  ['WA', 'KW'],
  ['TAS', 'KT'],
])

const getUrl = (
  keycode: number,
  serverPrefix: string,
  storeNo: number
): ItemLocationApiUrl => ({
  keycode,
  uri: `https://${serverPrefix}${storeNo}na001:33380/api/str/ProductInfo/SellFloorLocations?keycode=${keycode}`,
})

const getApiUrls = (manifests: Manifest[]): ItemLocationApi[] => {
  return manifests.reduce((urls, m) => {
    const store = getStore(m.store)
    if (store) {
      const serverPrefix = serverPrefixes.get(
        store.LOCALE === 'AU' ? store.STATE : store.LOCALE
      )
      urls.push({
        manifestNo: m.manifestNo,
        uris: m.items.map((i) =>
          getUrl(i.keycode, serverPrefix || '', m.store)
        ),
      })
    }
    return urls
  }, [] as ItemLocationApi[])
}

export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setLoading: (state: DataState, action: PayloadAction<boolean>) => {
      state.loading = action.payload
      state.isLoaded = !action.payload
    },
    setLoadingMessage: (state: DataState, action: PayloadAction<string>) => {
      state.loadingMessage = action.payload
    },
    setCertError: (state: DataState, action: PayloadAction<boolean>) => {
      state.certError = action.payload
    },
    setFilter: (state: DataState, action: PayloadAction<FilterCriteria>) => {
      state.filters = action.payload
    },
    submit: (state, action: PayloadAction<Payload>) => {
      if (action.payload) {
        state.manifest = action.payload.manifest
        //state.apiUrls = getApiUrlsByFilter(state.manifest,state.filters)
        state.isLoaded = true
      }
    },
    generateApiUrlsByFilter: (state) => {
      const apiUrls = state.manifest.reduce((urls, m) => {
        const store = getStore(m.store)
        if (store) {
          const serverPrefix = serverPrefixes.get(
            store.LOCALE === 'AU' ? store.STATE : store.LOCALE
          )

          const planogramData: Planogram[] = window.localStorage.getItem(
            'planogramData'
          )
            ? JSON.parse(window.localStorage.getItem('planogramData') || '')
            : []

          const filteredPlanogramKeycodes =
            !state.filters.status || state.filters.status !== 'all'
              ? planogramData
                  .filter((x: Planogram) =>
                    store.LOCALE === 'AU'
                      ? x.status ===
                        (state.filters.status
                          ? parseInt(state.filters.status)
                          : null)
                      : x.statusNz ===
                        (state.filters.status
                          ? parseInt(state.filters.status)
                          : null)
                  )
                  .map((x) => x.keycode)
              : null

          urls.push({
            manifestNo: m.manifestNo,
            uris: uniqBy(
              m.items.filter(
                (i) =>
                  !state.filters.departments ||
                  state.filters.departments.length === 0 ||
                  state.filters.departments.includes(i.department.Code) ||
                  !filteredPlanogramKeycodes ||
                  filteredPlanogramKeycodes.includes(i.keycode)
              ),
              'keycode'
            ).map((i) => getUrl(i.keycode, serverPrefix || '', m.store)),
          })
        }
        return urls
      }, [] as ItemLocationApi[])

      state.apiUrls = apiUrls
    },
  },
})

export const {
  submit,
  setLoading,
  setCertError,
  setLoadingMessage,
  setFilter,
  generateApiUrlsByFilter,
} = dataSlice.actions
export default dataSlice.reducer
