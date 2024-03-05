/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorkSheet, read, utils } from 'xlsx'
import { getDepartment } from './departments'
import { parse as parseDate } from 'date-fns'
import { enAU } from 'date-fns/locale'
export const getManifestData = async (
  buffer: ArrayBuffer
): Promise<Manifest> => {
  const workbook = read(buffer)

  const worksheet: WorkSheet = workbook.Sheets[workbook.SheetNames[0]]
  const store = worksheet['B5'].v
  const dcNo = worksheet['K5'].v
  const manifestNo = worksheet['E5'].v
  const despatchDate = parseDate(worksheet['H5'].w, 'dd/MM/yyyy', new Date(), {
    locale: enAU,
  })

  const rowStartIndex = 7
  const numberOfRows = utils.decode_range(worksheet['!ref'] || '').e.r - 2

  worksheet['!ref'] = `A${rowStartIndex}:F${numberOfRows}`
  const data = utils.sheet_to_json(worksheet)

  const items = await Promise.all(
    data.map(async (row: any) => {
      return {
        keycode: parseInt(row['Keycode']),
        description: row['Product Description'],
        department: getDepartment(parseInt(row['Dept No'])),
        quantity: parseInt(row['Total QTY']),
      } as ManifestItem
    })
  )

  const manifest: Manifest = {
    store,
    dcNo,
    despatchDate,
    manifestNo,
    items,
  }

  return manifest
}
export const getPlanogramData = async (
  buffer: ArrayBuffer
): Promise<Planogram[]> => {
  const workbook = read(buffer)

  const worksheet: WorkSheet = workbook.Sheets[workbook.SheetNames[0]]
  const rowStartIndex = 1
  const numberOfRows = utils.decode_range(worksheet['!ref'] || '').e.r

  worksheet['!ref'] = `A${rowStartIndex}:L${numberOfRows+1}`
  const data = utils.sheet_to_json(worksheet)

  const items = await Promise.all(
    data.map(async (row: any) => {
      return {
        keycode: parseInt(row['product_id']),
        status: parseInt(row['uom']),
        statusNz: parseInt(row['KEYCODE_STATUS_NZ']),
      } as Planogram
    })
  )

  return items
}
