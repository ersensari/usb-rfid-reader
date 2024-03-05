import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generateApiUrlsByFilter } from '../redux/dataSlice'

import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { utils, writeFile } from 'xlsx'
import { format as formatDate } from 'date-fns'
import { groupBy, sumBy, uniq, map, uniqBy } from 'lodash-es'
import Barcode from 'react-barcode'
import { useLocalStorage } from 'usehooks-ts'

//import useStateRef from 'react-usestateref'
const LocationList = () => {
  const dispatch = useAppDispatch()

  const { manifest, apiUrls, isLoaded, filters } = useAppSelector(
    (state) => state.data
  )

  const [activeTab, setActiveTab] = useState(0)
  const [activeManifest, setActiveManifest] = useState<Manifest | undefined>(
    undefined
  )

  const [locationLoading, setLocationLoading] = useState(false)
  //const locationRef = useRef<ManifestLocation | null>(null)
  const [locations, setLocations] = useLocalStorage<ManifestLocation | null>(
    'locations',
    null
  )
  const [planogramData, _setPlanogramData] = useLocalStorage<
    Planogram[] | null
  >('planogramData', null)

  const exportToExcel = useCallback(() => {
    const tableHeader = document.getElementById(
      `manifest-table-header-${activeTab}`
    )
    const wbHeader = utils.table_to_sheet(tableHeader)
    const tableContent = document.getElementById(
      `manifest-table-content-${activeTab}`
    )
    const wbContent = utils.table_to_sheet(tableContent)

    let a = utils.sheet_to_json(wbHeader, { header: 1 })
    let b = utils.sheet_to_json(wbContent, { header: 1 })

    a = a.concat(['']).concat(b)

    let worksheet = utils.json_to_sheet(a, { skipHeader: true })

    const new_workbook = utils.book_new()
    utils.book_append_sheet(new_workbook, worksheet, 'Manifest Locations')
    writeFile(new_workbook, 'ManifestLocations.xlsx')
  }, [activeTab])

  const fetchLocations = async () => {
    if (activeManifest) {
      const kcHasLocations =
        locations && locations[activeManifest.manifestNo]
          ? locations[activeManifest.manifestNo].map((x) => x.Keycode)
          : []
      // const _locations = locationRef.current
      //   ? locationRef.current[activeManifest.manifestNo]
      //   : []
      const urls = apiUrls.find(
        (url) =>
          url.manifestNo === activeManifest.manifestNo &&
          !kcHasLocations.some((kc) =>
            url.uris.map((u) => u.keycode).includes(kc)
          )
      )

      if (urls?.uris) {
        await fetch(
          `http://${window.location.hostname}:5000/api/getLocations`,
          {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(urls.uris),
          }
        )
          .then(async (res) => await res.json())
          .then((locations: ItemLocation[]) => {
            setLocations((prev) => ({
              ...prev,
              ...{
                [activeManifest.manifestNo]: uniqBy(
                  [
                    ...((prev && prev[activeManifest.manifestNo]) || []),
                    ...locations,
                  ],
                  'Keycode'
                ),
              },
            }))
          })
      }
    }
  }

  useEffect(() => {
    if (isLoaded && manifest.length > 0) {
      setActiveTab(manifest[0].manifestNo)
    }
  }, [isLoaded])

  useEffect(() => {
    if (isLoaded && manifest.length > 0) {
      setActiveManifest(manifest.find((m) => m.manifestNo === activeTab))
    }
  }, [activeTab])

  // Fetching locations
  useEffect(() => {
    if (!isLoaded) return
    setLocationLoading(true)
    fetchLocations().then(() => {
      setLocationLoading(false)
      console.log('Location process has been done')
    })
  }, [apiUrls])

  const manifestTabs = useMemo(() => {
    return manifest.map((m) => (
      <a
        key={m.manifestNo}
        className={
          activeTab === m.manifestNo
            ? 'tab tab-lifted font-bold tab-active rounded-t-2xl'
            : 'tab tab-lifted font-bold'
        }
        onClick={() => setActiveTab(m.manifestNo)}
      >
        {m.manifestNo}
      </a>
    ))
  }, [manifest, activeTab])

  const manifestTabHeader = useMemo(() => {
    return (
      <tr>
        <th>
          Store: <span className="font-normal">{activeManifest?.store}</span>
        </th>
        <th>
          Manifest No:{' '}
          <span className="font-normal">{activeManifest?.manifestNo}</span>
        </th>
        <th>
          Despatch Date:{' '}
          <span className="font-normal">
            {formatDate(
              activeManifest?.despatchDate || new Date(),
              'dd/MM/yyyy'
            )}
          </span>
        </th>
        <th>
          DC No: <span className="font-normal">{activeManifest?.dcNo}</span>
        </th>
        <td className="w-full"></td>
      </tr>
    )
  }, [activeManifest])

  const manifestTabContent = useMemo(() => {
    if (!activeManifest) return null

    const _locations = locations ? locations[activeManifest.manifestNo] : []
    // const _locations = locationRef.current
    //   ? locationRef.current[activeManifest.manifestNo]
    //   : []

    //filters
    console.log(filters.status);
    
    const filteredPlanogramKeycodes =
      !filters.status || filters.status !== 'all' 
        ? planogramData
            ?.filter((x: Planogram) =>
              activeManifest.store < 8000
                ? x.status ===
                  (filters.status ? parseInt(filters.status) : null)
                : x.statusNz ===
                  (filters.status ? parseInt(filters.status) : null)
            )
            .map((x) => x.keycode)
        : null
console.log(filteredPlanogramKeycodes);

    let filteredManifestItems = activeManifest.items.filter(
      (i) =>
        (!filters.onlyEmpty ||
          (_locations &&
            _locations?.filter((x) => x.Keycode === i.keycode)?.length ===
              0)) &&
        (!filters.keycode || i.keycode === parseInt(filters.keycode)) &&
        (!filters.location ||
          (_locations &&
            _locations?.some(
              (l) =>
                l.Keycode === i.keycode &&
                (!filters.location ||
                  filters.location.indexOf(l.SellFloorLocation) >= 0)
            ))) &&
        (!filters.departments ||
          filters.departments.length === 0 ||
          filters.departments.includes(i.department.Code)) &&
          
        (!filteredPlanogramKeycodes ||
          filteredPlanogramKeycodes.includes(i.keycode))
    )

    if (filters.suppressDuplicate)
      filteredManifestItems = map(
        groupBy(filteredManifestItems, 'keycode'),
        (items) => ({
          ...items[0],
          quantity: sumBy(items, (v: ManifestItem) => v.quantity),
        })
      )

    return filteredManifestItems.map((i, index) => {
      const _itemLocations = uniq(
        _locations
          ?.filter((l) => l.Keycode === i.keycode)
          .map((x) => x.SellFloorLocation)
      )

      return (
        <tr key={`${index}-${activeManifest.manifestNo}`}>
          <td>
            <Barcode
              value={i.keycode.toString()}
              height={30}
              displayValue={false}
              format="CODE128"
            />
          </td>
          <td>{i.keycode}</td>
          <td>{i.description}</td>
          <td>{i.department.Code}</td>
          <td>{i.department.Description}</td>
          <td>{i.quantity}</td>
          <td>{_itemLocations.join(', ')}</td>
        </tr>
      )
    })
  }, [locations, activeManifest, filters])

  useEffect(() => {
    dispatch(generateApiUrlsByFilter())
  }, [filters])

  const progressBar = useMemo(() => {
    if (!activeManifest) return
    const urls = apiUrls.find(
      (url) => url.manifestNo === activeManifest.manifestNo
    )
    if (!locationLoading || !urls?.uris?.length) return null
    return (
      <>
        <div className="flex items-end gap-2">
          <div className="w-full">
            <div className="ml-3">
              Fetching locations of {urls?.uris?.length} items
            </div>
            <progress className="progress progress-secondary w-full"></progress>{' '}
          </div>
        </div>
      </>
    )
  }, [locationLoading])

  const printDocument = useCallback(async () => {
    if (!activeManifest) return
    const input = document.getElementById('printDoc') as HTMLElement
    const params = [
      'height=' + screen.height,
      'width=' + screen.width,
      'fullscreen=yes',
    ].join(',')

    const mywindow = window.open('', 'PRINT', params) as Window

    mywindow.document.write(
      `<html><head>
      <style type="text/css" media="print">
      @page {
        size:landscape;
      }
      .table {
        display: table;
      }
      .table {
        position: relative;
        text-align: left;
      }
      .table th:first-child {
        position: sticky;
        left: 0px;
        z-index: 11;
      }
      .table :where(th, td) {
        white-space: nowrap;
        padding: 1rem/* 16px */;
        vertical-align: middle;
      }
      .table tr.active th,
        .table tr.active td,
        .table tr.active:nth-child(even) th,
        .table tr.active:nth-child(even) td {
        --tw-bg-opacity: 1;
        background-color: hsl(var(--b3, var(--b2)) / var(--tw-bg-opacity));
      }
      .table tr.active th,
        .table tr.active td,
        .table tr.active:nth-child(even) th,
        .table tr.active:nth-child(even) td {
        --tw-bg-opacity: 1;
        background-color: hsl(var(--b3, var(--b2)) / var(--tw-bg-opacity));
      }
      .table tr.active th,
        .table tr.active td,
        .table tr.active:nth-child(even) th,
        .table tr.active:nth-child(even) td {
        --tw-bg-opacity: 1;
        background-color: hsl(var(--b3, var(--b2)) / var(--tw-bg-opacity));
      }
      .table tr.active th,
        .table tr.active td,
        .table tr.active:nth-child(even) th,
        .table tr.active:nth-child(even) td {
        --tw-bg-opacity: 1;
        background-color: hsl(var(--b3, var(--b2)) / var(--tw-bg-opacity));
      }
      .table tr.hover:hover th,
        .table tr.hover:hover td,
        .table tr.hover:nth-child(even):hover th,
        .table tr.hover:nth-child(even):hover td {
        --tw-bg-opacity: 1;
        background-color: hsl(var(--b3, var(--b2)) / var(--tw-bg-opacity));
      }
      .table tr.hover:hover th,
        .table tr.hover:hover td,
        .table tr.hover:nth-child(even):hover th,
        .table tr.hover:nth-child(even):hover td {
        --tw-bg-opacity: 1;
        background-color: hsl(var(--b3, var(--b2)) / var(--tw-bg-opacity));
      }
      .table tr.hover:hover th,
        .table tr.hover:hover td,
        .table tr.hover:nth-child(even):hover th,
        .table tr.hover:nth-child(even):hover td {
        --tw-bg-opacity: 1;
        background-color: hsl(var(--b3, var(--b2)) / var(--tw-bg-opacity));
      }
      .table tr.hover:hover th,
        .table tr.hover:hover td,
        .table tr.hover:nth-child(even):hover th,
        .table tr.hover:nth-child(even):hover td {
        --tw-bg-opacity: 1;
        background-color: hsl(var(--b3, var(--b2)) / var(--tw-bg-opacity));
      }
      .table:where(:not(.table-zebra)) :where(thead, tbody, tfoot) :where(tr:not(:last-child) :where(th, td)) {
        border-bottom-width: 1px;
        --tw-border-opacity: 1;
        border-color: hsl(var(--b2, var(--b1)) / var(--tw-border-opacity));
      }
      .table :where(thead, tfoot) :where(th, td) {
        --tw-bg-opacity: 1;
        background-color: hsl(var(--b2, var(--b1)) / var(--tw-bg-opacity));
        font-size: 0.75rem/* 12px */;
        line-height: 1rem/* 16px */;
        font-weight: 700;
        text-transform: uppercase;
      }
      .table :where(tbody th, tbody td) {
        --tw-bg-opacity: 1;
        background-color: hsl(var(--b1) / var(--tw-bg-opacity));
      }
      :where(.table *:first-child) :where(*:first-child) :where(th, td):first-child {
        border-top-left-radius: var(--rounded-box, 1rem);
      }
      :where(.table *:first-child) :where(*:first-child) :where(th, td):last-child {
        border-top-right-radius: var(--rounded-box, 1rem);
      }
      :where(.table *:last-child) :where(*:last-child) :where(th, td):first-child {
        border-bottom-left-radius: var(--rounded-box, 1rem);
      }
      :where(.table *:last-child) :where(*:last-child) :where(th, td):last-child {
        border-bottom-right-radius: var(--rounded-box, 1rem);
      }
      </style>
      <title>
        ${document.title} - ${activeManifest.manifestNo}
      </title>`
    )
    mywindow.document.write('</head><body >')
    mywindow.document.write(input.innerHTML)
    mywindow.document.write('</body></html>')

    mywindow.document.close() // necessary for IE >= 10
    mywindow.focus() // necessary for IE >= 10*/

    mywindow.print()
    mywindow.close()
  }, [activeManifest])

  // useEffect(() => {
  //   if (apiUrls.length > 0)
  //     console.log(JSON.stringify(apiUrls[0]?.uris.map((x) => x.uri)))
  // }, [apiUrls])

  return (
    <>
      {isLoaded && (
        <div className="bg-white rounded-2xl">
          <div className="tabs w-full bg-base-200 rounded-2xl rounded-b-none ml-0">
            {manifestTabs}
          </div>
          <div className="card w-full shadow-xl rounded-t-none border-l">
            <div className="card-actions justify-end mr-10 mt-5">
              <button className="btn btn-accent" onClick={printDocument}>
                <i className="i-mdi-printer-outline h-6 w-6" />
                Print
              </button>
              <button className="btn btn-accent" onClick={exportToExcel}>
                E<i className="i-mdi-file-excel-box-outline h-6 w-6" />
                cel
              </button>
            </div>

            <div className="card-body" id="printDoc">
              {progressBar}
              <table
                className="table w-full"
                id={`manifest-table-header-${activeTab}`}
              >
                <thead>{manifestTabHeader}</thead>
              </table>
              <table
                className="table w-full"
                id={`manifest-table-content-${activeTab}`}
              >
                <thead>
                  <tr>
                    <th></th>
                    <th>Keycode</th>
                    <th>Description</th>
                    <th>Department Code</th>
                    <th>Department</th>
                    <th>Quantity</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>{manifestTabContent}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(LocationList)
