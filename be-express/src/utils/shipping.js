/**
 * Shipping fee business rule:
 *   subtotal < 500 000  → shipping_fee = 20 000
 *   subtotal >= 500 000 → freeship (0)
 */
const calculateShippingFee = (subtotal) => {
  return subtotal < 500000 ? 20000 : 0;
};

module.exports = { calculateShippingFee };
