const products1 = require('./inventory/products-1')
const products2 = require('./inventory/products-2')
const departments = require('./inventory/departments')
const { sgtin96, sgln96 } = require('anko-rfid-tags-manager')
const Memcached = require('memcached')

const memcached = new Memcached('localhost:11211', { retries: 10, retry: 10000, remove: true });

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

const init = async () => {
  await _hashMapToMemcached(products1)
  await _hashMapToMemcached(products2)
  return true
}

const _hashMapToMemcached = (hashMap) => {
  // Check if input is a HashMap
  if (typeof hashMap !== 'object' || hashMap === null) {
    throw new Error('Input must be a HashMap');
  }

  return Promise.all(Object.entries(hashMap).map(([key, p]) => {
    const dept = getDepartment(p?.dp || '')

    const product =
    {
      keycode: p.kc,
      department: p.dp ?? 'unknown',
      name: p.name,
      barcode,
      epc: id,
      isApparel: dept?.Apparel_GM === 'APPAREL' || false,
    }
    console.log(product);
    const memcachedData = { key, value: JSON.stringify(product) };
    memcached.set(key, memcachedData, 0, (err, result) => {
      console.log(`${key} - ${result ? 'writed' : 'error'}`);
    });
  }))

  // Initialize an empty array to store promises
  // const promises = [];
  // // Iterate over HashMap entries
  // for (const [key, value] of Object.entries(hashMap)) {
  //   memcached.get(key, (err, data) => {
  //     if (data) return
  //     // Prepare Memcached formatted data
  //     const memcachedData = { key, value: JSON.stringify(value) };

  //     // Create a Promise to store data in Memcached
  //     promises.push(memcached.set(key, memcachedData));
  //   })
  // }

  // Return a Promise that resolves when all data is stored in Memcached
  // return Promise.all(promises);
}

const getBarcode = async (epc) => {
  console.log(epc);
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
  const ids = await Promise.all(epcs.map(async (e) => await getBarcode(e)))
  return new Promise((resolve, reject) => {
    if (!ids) {
      reject(unknownProduct)
      return
    }
    memcached.getMulti(ids, (err, data) => {
      resolve(data)
    })
  })

}

const getProduct = (id) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(unknownProduct)
      return
    }

    getBarcode(id).then((barcode) => {
      memcached.get(barcode, (err, data) => {
        if (err) reject(err)
        if (!data)
          reject(unknownProduct)
        resolve(JSON.parse(data.value))
      })
    })
  })
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

module.exports = { getBarcode, getDepartment, getDepartments, getProduct, init, getProducts }
