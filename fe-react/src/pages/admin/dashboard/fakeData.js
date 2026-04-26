// Fake data theo đúng cấu trúc BE trả về — dùng để test UI
// Khi BE sẵn sàng, xoá FAKE_DATA và dùng API thật

export const FAKE_DATA = {
  total_orders: 348,
  total_revenue: 128_500_000,
  total_users: 87,
  total_products: 214,

  orders_by_status: {
    pending: 24,
    confirmed: 53,
    completed: 241,
    canceled: 30,
  },

  revenue_by_month: [
    { month: "2025-08", revenue: 8_200_000 },
    { month: "2025-09", revenue: 11_400_000 },
    { month: "2025-10", revenue: 9_800_000 },
    { month: "2025-11", revenue: 15_300_000 },
    { month: "2025-12", revenue: 22_100_000 },
    { month: "2026-01", revenue: 13_700_000 },
    { month: "2026-02", revenue: 17_600_000 },
    { month: "2026-03", revenue: 19_200_000 },
    { month: "2026-04", revenue: 11_200_000 },
  ],

  top_selling_products: [
    {
      product_id: 1,
      name: "Áo thun basic nam",
      category_name: "Áo",
      thumbnail_image: null,
      total_sold: 186,
      revenue: 27_900_000,
    },
    {
      product_id: 2,
      name: "Giày sneaker trắng",
      category_name: "Giày",
      thumbnail_image: null,
      total_sold: 154,
      revenue: 38_500_000,
    },
    {
      product_id: 3,
      name: "Quần jean slim fit",
      category_name: "Quần",
      thumbnail_image: null,
      total_sold: 132,
      revenue: 39_600_000,
    },
    {
      product_id: 4,
      name: "Túi tote canvas",
      category_name: "Túi",
      thumbnail_image: null,
      total_sold: 98,
      revenue: 14_700_000,
    },
    {
      product_id: 5,
      name: "Kính mát unisex",
      category_name: "Phụ kiện",
      thumbnail_image: null,
      total_sold: 87,
      revenue: 17_400_000,
    },
    {
      product_id: 6,
      name: "Mũ bucket nữ",
      category_name: "Mũ",
      thumbnail_image: null,
      total_sold: 74,
      revenue: 7_400_000,
    },
    {
      product_id: 7,
      name: "Áo hoodie oversize",
      category_name: "Áo",
      thumbnail_image: null,
      total_sold: 61,
      revenue: 18_300_000,
    },
  ],
};
