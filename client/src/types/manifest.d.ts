type ItemLocation = {
  Keycode: number
  SellFloorLocation: string
}

type Manifest = {
  store: number
  manifestNo: number
  despatchDate: Date
  dcNo: number
  items: ManifestItem[]
}

type ManifestItem = {
  keycode: number
  description: string
  department: Department
  quantity: number
  locations: ItemLocation[]
}

type ManifestLocation = {
  [manifestNo: number]: ItemLocation[]
}
