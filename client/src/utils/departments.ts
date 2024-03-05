const departments = Array.of<Department>(
  ...[
    {
      Code: 90,
      Description: "Men's Underwear/Socks",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 93,
      Description: "Men's Sleepwear",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 37,
      Description: 'Accessories',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 9,
      Description: "Men's Footwear, including Men's Active Footwear",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 1,
      Description: "Women's Footwear, including Womens Active Footwear",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 81,
      Description: 'Kids Footwear, including Kids Active Footwear',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 91,
      Description: "Men's Tops",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 92,
      Description: "Men's Bottoms",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 96,
      Description: "Men's Work Dept",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 6,
      Description: 'Girlswear 1-9',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 8,
      Description: 'Girlswear 7-16',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 16,
      Description: 'Boyswear 7-16',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 19,
      Description: 'Schoolwear Apparel',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 26,
      Description: 'Boyswear 1-9',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 30,
      Description: 'Babywear',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 34,
      Description: 'Kids Underwear & Socks',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 57,
      Description: 'Kids Accessories',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 88,
      Description: 'Kids Sleepwear',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 2,
      Description: "Women's Seasonal",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 4,
      Description: "Women's Knit Tops",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 60,
      Description: "Women's Leisure",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 5,
      Description: "Women's Bottoms",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 52,
      Description: "Women's Dresses & Woven Tops",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 70,
      Description: "Women's Plus Sizes/Curve/Maternity",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 10,
      Description: "Women's Sleepwear",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 13,
      Description: "Women's Hosiery & Socks",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 11,
      Description: "Women's Briefs/Functional",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 12,
      Description: "Women's Bras/Co-ordinates",
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 32,
      Description: 'Jewellery, Watches & Sunglasses',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 36,
      Description: 'Handbags & Accessories',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 23,
      Description: 'Books',
      Apparel_GM: 'GM',
    },
    {
      Code: 68,
      Description: 'Magazines',
      Apparel_GM: 'GM',
    },
    {
      Code: 75,
      Description: 'Family Technology',
      Apparel_GM: 'GM',
    },
    {
      Code: 99,
      Description: 'Gift Cards',
      Apparel_GM: 'GM',
    },
    {
      Code: 53,
      Description: 'Photo Centre',
      Apparel_GM: 'GM',
    },
    {
      Code: 50,
      Description: 'Craft & Frames',
      Apparel_GM: 'GM',
    },
    {
      Code: 24,
      Description: '\nStationery \n',
      Apparel_GM: 'GM',
    },
    {
      Code: 46,
      Description: 'Pet Care',
      Apparel_GM: 'GM',
    },
    {
      Code: 69,
      Description: 'Home & Auto Care',
      Apparel_GM: 'GM',
    },
    {
      Code: 17,
      Description: 'Xmas Trim & Wrap',
      Apparel_GM: 'GM',
    },
    {
      Code: 21,
      Description: 'Seasonal Foods',
      Apparel_GM: 'GM',
    },
    {
      Code: 29,
      Description: 'Easter ',
      Apparel_GM: 'GM',
    },
    {
      Code: 25,
      Description: 'Cards & Wrap',
      Apparel_GM: 'GM',
    },
    {
      Code: 28,
      Description: 'Party Goods ',
      Apparel_GM: 'GM',
    },
    {
      Code: 44,
      Description: 'Confectionery & Drinks',
      Apparel_GM: 'GM',
    },
    {
      Code: 85,
      Description: 'Personal Care',
      Apparel_GM: 'GM',
    },
    {
      Code: 20,
      Description: 'Cosmetics',
      Apparel_GM: 'GM',
    },
    {
      Code: 72,
      Description: 'Bathroom',
      Apparel_GM: 'GM',
    },
    {
      Code: 73,
      Description: 'Bedroom Accessories ',
      Apparel_GM: 'GM',
    },
    {
      Code: 74,
      Description: 'Bed Linen',
      Apparel_GM: 'GM',
    },
    {
      Code: 15,
      Description: 'Laundry & Storage',
      Apparel_GM: 'GM',
    },
    {
      Code: 71,
      Description: 'Home Decorator',
      Apparel_GM: 'GM',
    },
    {
      Code: 66,
      Description: 'Home Furnishings & Other Room Furniture',
      Apparel_GM: 'GM',
    },
    {
      Code: 54,
      Description: 'Living Room Furniture',
      Apparel_GM: 'GM',
    },
    {
      Code: 38,
      Description: 'Kitchen',
      Apparel_GM: 'GM',
    },
    {
      Code: 40,
      Description: 'Dining',
      Apparel_GM: 'GM',
    },
    {
      Code: 56,
      Description: 'Appliances',
      Apparel_GM: 'GM',
    },
    {
      Code: 47,
      Description: 'Action Vehicle Outdoor',
      Apparel_GM: 'GM',
    },
    {
      Code: 67,
      Description: 'Dolls/Construction',
      Apparel_GM: 'GM',
    },
    {
      Code: 87,
      Description: 'Pre-School',
      Apparel_GM: 'GM',
    },
    {
      Code: 33,
      Description: 'Nursery',
      Apparel_GM: 'GM',
    },
    {
      Code: 22,
      Description: 'Kids Indoor Play',
      Apparel_GM: 'GM',
    },
    {
      Code: 64,
      Description: 'Active Menswear',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 84,
      Description: 'Active Kidswear',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 65,
      Description: 'Active Womenswear',
      Apparel_GM: 'APPAREL',
    },
    {
      Code: 48,
      Description: 'Backpacks & Travel',
      Apparel_GM: 'GM',
    },
    {
      Code: 27,
      Description: 'Wheels',
      Apparel_GM: 'GM',
    },
    {
      Code: 77,
      Description: 'Recreational',
      Apparel_GM: 'GM',
    },
    {
      Code: 76,
      Description: 'Camping',
      Apparel_GM: 'GM',
    },
    {
      Code: 78,
      Description: 'Fishing',
      Apparel_GM: 'GM',
    },
    {
      Code: 97,
      Description: 'Reusable Bags',
      Apparel_GM: 'APPAREL',
    },
  ]
)

const unknownDepartment: Department = {
  Code: 0,
  Description: 'unknown',
  Apparel_GM: 'unknown',
}

export const getDepartment = (code: number): Department => {
  const department = departments.find((department) => department.Code === code)
  return department || unknownDepartment
}

export const getDepartments = (): Department[] => {
  return departments
}
