/* eslint-disable @typescript-eslint/no-var-requires */
import {
  submit,
  setLoading,
  setLoadingMessage,
  setFilter,
} from '../redux/dataSlice'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getManifestData, getPlanogramData } from '../utils/fileImports'
import Select, { SelectInstance } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import makeAnimated from 'react-select/animated'
import { getDepartments } from '../utils/departments'
import { useLocalStorage } from 'usehooks-ts'
import { uniq } from 'lodash-es'

type FilterType = { [key: string]: any }

const Filters = () => {
  const animatedComponents = makeAnimated()
  const selectRef = useRef<SelectInstance<any> | null>(null)
  const selectFilterRef = useRef<SelectInstance<CreatableSelect> | null>(null)

  const { isLoaded } = useAppSelector((state) => state.data)
  const dispatch = useAppDispatch()
  const [manifestFiles, setManifestFiles] = useState<FileList | null>(null)
  const [planogramFileLoading, setPlanogramFileLoading] =
    useState<boolean>(false)

  const [filterBoxOpened, setFilterBoxOpened] = useState(false)
  const [filterLocation, setFilterLocation] = useState<string | null>(null)
  const [filterEmptyLocations, setFilterEmptyLocations] =
    useState<boolean>(false)
  const [filterSuppressDuplicate, setFilterSuppressDuplicate] =
    useState<boolean>(true)

  const [filterDepartments, setFilterDepartments] = useState<number[] | null>(
    null
  )
  const [filterStatus, setFilterStatus] = useState<string | null>('all')

  const [departments, setDepartments] = useState<any[]>([])

  const toggleFilterBox = () => setFilterBoxOpened(!filterBoxOpened)

  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)

  const [savedFilters, setSavedFilters] = useLocalStorage<FilterType | null>(
    'savedFilters',
    null
  )

  const [planogramData, setPlanogramData] = useLocalStorage<Planogram[] | null>(
    'planogramData',
    null
  )

  // Load filters from local storage
  const loadFiltersLocalStorage = (_savedFilters: any) => {
    setFilterLocation(_savedFilters.filterLocation)
    setFilterEmptyLocations(_savedFilters.filterEmptyLocations)
    setFilterSuppressDuplicate(_savedFilters.filterSuppressDuplicate)
    setFilterDepartments(_savedFilters.filterDepartments)

    selectRef.current?.setValue(
      _savedFilters.filterDepartments
        ? departments.filter((x) =>
            _savedFilters.filterDepartments.includes(x.value)
          )
        : [],
      'select-option'
    )
  }

  const onDeleteFilterClick = () => {
    if (!selectedFilter || !savedFilters) return

    setSavedFilters((current) => {
      if (!current) return
      const { [selectedFilter]: _, ...rest } = current
      return rest
    })

    selectFilterRef.current?.clearValue()
  }
  const onSaveFilterClick = () => {
    const value = selectFilterRef.current?.props.value as any
    if (!value) return
    setSavedFilters({
      ...savedFilters,
      [value.label]: {
        filterLocation,
        filterEmptyLocations,
        filterSuppressDuplicate,
        filterDepartments,
        filterStatus,
      },
    })
  }
  const clearFilter = async () => {
    setFilterLocation(null)
    setFilterStatus('all')
    setFilterEmptyLocations(false)
    setFilterSuppressDuplicate(true)
    selectRef.current?.clearValue()

    dispatch(
      setFilter({
        keycode: null,
        location: filterLocation,
        onlyEmpty: filterEmptyLocations,
        suppressDuplicate: filterSuppressDuplicate,
        departments: filterDepartments,
        status: filterStatus,
      })
    )
  }

  const onFilterClick = async () => {
    dispatch(
      setFilter({
        keycode: null,
        location: filterLocation,
        onlyEmpty: filterEmptyLocations,
        suppressDuplicate: filterSuppressDuplicate,
        departments: filterDepartments,
        status: filterStatus,
      })
    )
  }

  // #region fetch manifest data from excel imports
  const fetchManifestData = useCallback(async () => {
    if (!manifestFiles) return []

    const manifestPromises = Array.from(manifestFiles).map(async (file) =>
      getManifestData(await file.arrayBuffer())
    )

    const manifestValues = await Promise.all(manifestPromises)
    const manifest = manifestValues.flatMap((x) => x)

    return manifest
  }, [manifestFiles])
  // #endregion fetch manifest data from excel imports

  // #region fetch planogram data from excel imports
  const fetchPlanogramData = async (planogramFile: File | null) => {
    if (!planogramFile) return
    setPlanogramFileLoading(true)
    const items = await getPlanogramData(await planogramFile.arrayBuffer())
    setPlanogramData(items)
    setPlanogramFileLoading(false)
  }
  // #endregion fetch planogram data from excel imports

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(setLoading(true))
    await clearFilter()

    try {
      // get manifest data
      dispatch(setLoadingMessage('Fetching manifest data...'))
      const manifest = await fetchManifestData()

      // compute data
      dispatch(setLoadingMessage('Computing data...'))
      dispatch(
        submit({
          manifest,
        })
      )
    } catch (error) {
      console.log(error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  useEffect(() => {
    const _departments = getDepartments()
    setDepartments(
      _departments.map((x) => ({ value: x.Code, label: x.Description }))
    )
  }, [])

  const optionFilters = useMemo<any[]>(() => {
    return savedFilters
      ? Object.keys(savedFilters).map((x) => ({
          value: savedFilters[x],
          label: x,
        }))
      : []
  }, [savedFilters])

  return (
    <div className="mb-4 w-full">
      <div className="flex justify-between max-lg:flex-col gap-4 p-4 bg-base-100 text-base-content">
        <form
          className="flex gap-4"
          encType="multipart/form-data"
          onSubmit={onSubmit}
        >
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Manifest</span>
            </label>
            <input
              type="file"
              className="file-input file-input-bordered w-full max-w-xs"
              multiple={true}
              accept=".xlsx, .xls"
              onChange={(e) => setManifestFiles(e.target.files)}
            />
          </div>
          <div className="form-control max-w-xs">
            <label className="label">
              <span className="label-text">&nbsp;</span>
            </label>
            <button className="btn btn-primary" type="submit">
              Submit
            </button>
          </div>
        </form>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text ml-4">
              Update Planogram Excel{' '}
              {planogramFileLoading ? (
                <div
                  className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  role="status"
                >
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                  </span>
                </div>
              ) : (
                <span className="badge badge-primary">
                  {planogramData?.length || 0} items
                </span>
              )}
            </span>
          </label>
          <input
            type="file"
            className="file-input file-input-bordered w-full max-w-xs"
            multiple={false}
            accept=".xlsx, .xls"
            onChange={(e) =>
              e.target.files && fetchPlanogramData(e.target.files[0])
            }
          />
        </div>
      </div>
      {isLoaded && (
        <>
          <div
            className={`${
              filterBoxOpened ? '' : 'hidden'
            } gap-4 p-4 bg-base-100 text-base-content`}
          >
            <div className="flex items-center font-bold">
              Filter The Results By:
            </div>
            <div className="flex">
              <div className="form-control w-full max-w-sm">
                <label className="label">
                  <span className="label-text">Department</span>
                </label>
                <Select
                  ref={selectRef}
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  defaultValue={filterDepartments}
                  isMulti
                  options={departments}
                  onChange={(e) =>
                    setFilterDepartments(e.map((x: any) => x.value))
                  }
                  classNames={{
                    control: (_state) => '!rounded-lg p-1',
                    container: () => 'input-primary',
                  }}
                />
              </div>
              <div className="divider divider-horizontal mx-14">AND</div>
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">Location</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-primary w-full max-w-xs"
                  onChange={(e) => setFilterLocation(e.target.value)}
                  value={filterLocation || ''}
                />
              </div>
              <div className="divider divider-horizontal mx-14">AND</div>
              <div>
                <div className="form-control w-full max-w-xs">
                  <label className="label">
                    <span className="label-text">Only Empty Locations</span>
                  </label>
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={filterEmptyLocations}
                    onChange={() =>
                      setFilterEmptyLocations(!filterEmptyLocations)
                    }
                  />
                </div>
                <div className="form-control w-full max-w-xs">
                  <label className="label">
                    <span className="label-text">Suppress Duplicates</span>
                  </label>
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={filterSuppressDuplicate}
                    onChange={() =>
                      setFilterSuppressDuplicate(!filterSuppressDuplicate)
                    }
                  />
                </div>
              </div>
              <div className="divider divider-horizontal mx-14">AND</div>
              <div>
                <div className="form-control w-full max-w-xs">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    className="select select-bordered w-full max-w-xs"
                    onChange={(x) => setFilterStatus(x.target.value)}
                  >
                    <option value="all">All</option>
                    {uniq(planogramData?.map((x) => x.status)).map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">&nbsp;</span>
              </label>
              <div className="flex gap-x-2">
                <CreatableSelect
                  ref={selectFilterRef}
                  closeMenuOnSelect={true}
                  isMulti={false}
                  isClearable
                  options={optionFilters}
                  onChange={(e: any) => {
                    if (e && !e.__isNew__) {
                      setSelectedFilter(e.label)
                      loadFiltersLocalStorage(e.value)
                    }
                  }}
                  classNames={{
                    control: () => '!rounded-lg p-1',
                    container: () => 'input-primary w-1/2',
                  }}
                />
                <button
                  className="btn btn-black btn-outline"
                  type="button"
                  onClick={onSaveFilterClick}
                >
                  <i className="i-mdi-content-save-all-outline"></i>
                  &nbsp; Save Filter
                </button>
                <button
                  className="btn btn-error btn-outline"
                  type="button"
                  onClick={onDeleteFilterClick}
                >
                  <i className="i-mdi-delete-outline"></i>
                  &nbsp; Delete Filter
                </button>
                <div className="flex gap-x-2 justify-end w-full">
                  <button
                    className="btn btn-black btn-outline"
                    type="button"
                    onClick={onFilterClick}
                  >
                    <i className="i-mdi-filter"></i>
                    &nbsp; Apply Filter
                  </button>
                  <button
                    className="btn btn-error btn-outline"
                    type="button"
                    onClick={clearFilter}
                  >
                    <i className="i-mdi-filter-off"></i>
                    &nbsp; Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col bg-base-100 h-8 items-center justify-center rounded-ee-2xl rounded-es-2xl">
            <div
              className="text-base-content text-center h-6 z-10 cursor-pointer hover:motion-safe:animate-bounce "
              onClick={() => toggleFilterBox()}
            >
              Filter
              <div
                className="flex items-baseline justify-center bg-base-100 rounded-full -m-4 p-2 h-8 w-16"
                onClick={() => toggleFilterBox()}
              >
                <i
                  className={`${
                    filterBoxOpened
                      ? 'i-mdi-chevron-double-up'
                      : 'i-mdi-chevron-double-down'
                  } text-xl mt-1`}
                ></i>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Filters
