import { DomainError, calculatePayment } from './payment.mjs';

function nonNegativeInteger(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) throw new DomainError('INVALID_VALUE', `${name}: неверное число`);
  return value;
}

export function calculateBookingQuote({ hotelId, nights, rate, hotelierStatus, hotelDiscountBasisPoints = 0,
  services = [], wallets, usePoints, baseLodgingOverrideMinor }) {
  nonNegativeInteger(nights,'nights');
  if (nights === 0) throw new DomainError('INVALID_NIGHTS','Нужна хотя бы одна ночь');
  if (rate.hotelId !== hotelId) throw new DomainError('WRONG_RATE_HOTEL','Тариф принадлежит другому отелю');
  if (!['standard','hotel_loyalty','friendly_rate'].includes(rate.kind)) throw new DomainError('INVALID_RATE','Неизвестный тип тарифа');
  if (rate.kind === 'friendly_rate' && hotelierStatus !== 'approved') {
    throw new DomainError('FRIENDLY_RATE_UNAVAILABLE','Friendly Rate доступен подтверждённым отельерам');
  }
  nonNegativeInteger(rate.nightlyMinor,'nightlyMinor');
  nonNegativeInteger(hotelDiscountBasisPoints,'hotelDiscountBasisPoints');
  if (hotelDiscountBasisPoints > 10000) throw new DomainError('INVALID_DISCOUNT','Скидка не может превышать 100%');
  const hotelBenefitsAllowed = rate.kind !== 'friendly_rate';
  const baseLodgingMinor = nonNegativeInteger(baseLodgingOverrideMinor ?? rate.nightlyMinor*nights,'baseLodgingMinor');
  // Integer arithmetic, round half up to one kopeck. FR is its own price, not an extra discount.
  const bps = hotelBenefitsAllowed ? hotelDiscountBasisPoints : 0;
  const discountMinor = Number((BigInt(baseLodgingMinor)*BigInt(bps)+5000n)/10000n);
  const payment = calculatePayment({hotelId,lodgingMinor:baseLodgingMinor-discountMinor,
    services,wallets,usePoints,hotelBenefitsAllowed});
  return {...payment,rateId:rate.id,rateKind:rate.kind,nights,baseLodgingMinor,hotelDiscountMinor:discountMinor};
}

export function getKeyAvailability({ bookingStatus, stayStatus, roomNumber, checkedInAt, keyValidUntil, now }) {
  if (bookingStatus !== 'confirmed' || !['in_house','checkout_due'].includes(stayStatus)) {
    return {visible:false,enabled:false,reason:'not_staying'};
  }
  const current = Date.parse(now), arrived = Date.parse(checkedInAt), expires = Date.parse(keyValidUntil);
  if (![current,arrived,expires].every(Number.isFinite) || expires <= arrived) {
    return {visible:false,enabled:false,reason:'invalid_access_period'};
  }
  if (!roomNumber || arrived > current) return {visible:false,enabled:false,reason:'not_checked_in'};
  if (current >= expires) return {visible:true,enabled:false,reason:'expired'};
  return {visible:true,enabled:true,reason:'ready'};
}
