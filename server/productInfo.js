const products1 = require('./inventory/products-1')
const products2 = require('./inventory/products-2')
const departments = require('./inventory/departments')
const { sgtin96, sgln96 } = require('anko-rfid-tags-manager')

const unknownProduct = {
  keycode: 'unknown',
  department: 'unknown',
  barcode: 'unknown',
  name: 'unknown',
  epc: '',
  isApparel: null,
}

const unknownDepartment = {
  Code: 0,
  Description: 'unknown',
  Apparel_GM: 'unknown',
}

const getProduct = async function (id) {
  if (!id) {
    return unknownProduct
  }
  const barcode = await getBarcode(id)

  const product = products1.get(barcode) ?? products2.get(barcode)
  const dept = await getDepartment(product?.dp || '')

  return product
    ? {
      keycode: product.kc,
      department: dept?.Description ?? 'unknown',
      name: product.name,
      barcode,
      epc: id,
      image:product.image
    }
    : { ...unknownProduct, epc: id, barcode }
}

const getBarcode = async (epc) => {
  let parseResult = null
  try {
    parseResult = await sgtin96.parse96BitEPC(epc)
  } catch (err) {
    try {
      parseResult = await sgln96.parse96BitsEPC(epc)
    } catch (error) {
      parseResult = null
      console.log('epc not correct')
    }
  }
  const barcode = parseResult?.barcode || 'unknown'

  return barcode
}

const getProducts = async (epcs) => {
  return await Promise.all(epcs.map((e) => getProduct(e.epc)))
}

const getDepartment = (id) => {
  if (!id) {
    return unknownDepartment
  }

  return departments.get(parseInt(id)) ?? unknownDepartment
}

const getDepartments = async () => {
  return departments
}

module.exports = { getBarcode, getDepartment, getDepartments, getProduct, getProducts }
