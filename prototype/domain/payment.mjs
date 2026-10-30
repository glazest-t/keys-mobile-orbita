// Framework-independent demo logic. No external requests or real payments.
export class DomainError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

function natural(value, field) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new DomainError('INVALID_AMOUNT', `${field}: требуется целое неотрицательное число`);
  }
  return value;
}

function total(values, field) {
  return natural(values.reduce((sum, value) => sum + natural(value, field), 0), field);
}

export function calculatePayment({ hotelId, lodgingMinor, services = [], wallets, usePoints, hotelBenefitsAllowed = true }) {
  if (typeof hotelId !== 'string' || !hotelId) throw new DomainError('INVALID_HOTEL', 'Нужен отель заказа');
  if (typeof usePoints !== 'boolean') throw new DomainError('INVALID_SWITCH', 'Использование баллов задаётся переключателем');
  if (typeof hotelBenefitsAllowed !== 'boolean') throw new DomainError('INVALID_BENEFIT_RULE', 'Нужно правило применения программы отеля');
  natural(lodgingMinor, 'lodgingMinor');
  natural(wallets.keysPoints, 'keysPoints');
  natural(wallets.hotelPoints, 'hotelPoints');
  const ids = new Set();
  const serviceTotalMinor = total(services.map(service => {
    if (typeof service.id !== 'string' || !service.id || ids.has(service.id)) {
      throw new DomainError('DUPLICATE_SERVICE', 'У каждой позиции должен быть уникальный идентификатор');
    }
    ids.add(service.id);
    natural(service.quantity, 'quantity');
    if (service.quantity === 0) throw new DomainError('INVALID_QUANTITY', 'Количество должно быть положительным');
    return natural(natural(service.unitPriceMinor, 'unitPriceMinor') * service.quantity, 'lineTotalMinor');
  }), 'serviceTotalMinor');
  const orderTotalMinor = total([lodgingMinor, serviceTotalMinor], 'orderTotalMinor');
  // One point = one rouble. Whole points never overpay a kopeck-denominated order.
  const limitPoints = Math.floor(orderTotalMinor / 100);
  const eligibleHotelPoints = hotelBenefitsAllowed && wallets.hotelId === hotelId ? wallets.hotelPoints : 0;
  // Spend the hotel-specific balance first, preserving points usable at other hotels.
  const hotelPoints = usePoints ? Math.min(eligibleHotelPoints, limitPoints) : 0;
  const keysPoints = usePoints ? Math.min(wallets.keysPoints, limitPoints - hotelPoints) : 0;
  const pointsMinor = total([hotelPoints, keysPoints], 'points') * 100;
  const cashDueMinor = orderTotalMinor - pointsMinor;
  return {
    hotelId, lodgingMinor, serviceTotalMinor, orderTotalMinor, hotelBenefitsAllowed,
    usePoints, applied: { hotelPoints, keysPoints, pointsMinor }, cashDueMinor,
    remaining: { hotelPoints: wallets.hotelPoints - hotelPoints, keysPoints: wallets.keysPoints - keysPoints },
  };
}

export function createPaymentState() {
  return { balances: {}, operations: {} };
}

export function walletIds(userId, hotelId) {
  return { keys: `keys:${userId}`, hotel: `hotel:${hotelId}:${userId}` };
}

export function readWallets(state, userId, hotelId) {
  const ids = walletIds(userId, hotelId);
  return { hotelId, keysPoints: state.balances[ids.keys] ?? 0, hotelPoints: state.balances[ids.hotel] ?? 0 };
}

// Idempotency is scoped to the user and booking; retrying the same confirmation is safe.
export function confirmPayment(state, { userId, bookingId, quote, method, cashNowMinor, outcome = 'success' }) {
  if (!userId || !bookingId) throw new DomainError('INVALID_ID', 'Нужны пользователь и бронь');
  const operationId = `${userId}:${bookingId}`;
  const existing = state.operations[operationId];
  if (existing) {
    if (existing.status === 'cancelled') throw new DomainError('BOOKING_CANCELLED', 'Бронь уже отменена');
    return { state, operation: existing, duplicate: true };
  }
  if (!['online', 'at_hotel'].includes(method)) throw new DomainError('INVALID_METHOD', 'Неизвестный способ оплаты');
  if (!['success', 'failure'].includes(outcome)) throw new DomainError('INVALID_OUTCOME', 'Неизвестный результат оплаты');
  if (outcome === 'failure') return { state, operation: null, duplicate: false, error: 'PAYMENT_FAILED' };
  // Recheck current balances. The booking layer must separately revalidate catalog prices,
  // availability, tariff eligibility and quote expiry before calling this demo journal.
  const current = readWallets(state, userId, quote.hotelId);
  const fresh = calculatePayment({ hotelId: quote.hotelId, lodgingMinor: quote.lodgingMinor,
    services: quote.serviceTotalMinor ? [{ id: 'quoted-services', quantity: 1, unitPriceMinor: quote.serviceTotalMinor }] : [],
    wallets: current, usePoints: quote.usePoints, hotelBenefitsAllowed: quote.hotelBenefitsAllowed });
  if (fresh.applied.hotelPoints !== quote.applied.hotelPoints || fresh.applied.keysPoints !== quote.applied.keysPoints ||
      fresh.orderTotalMinor !== quote.orderTotalMinor || fresh.cashDueMinor !== quote.cashDueMinor ||
      fresh.applied.pointsMinor !== quote.applied.pointsMinor) {
    throw new DomainError('QUOTE_CHANGED', 'Баланс изменился. Проверьте итог ещё раз');
  }
  const nowMinor=method==='at_hotel'?0:(cashNowMinor??quote.cashDueMinor);
  natural(nowMinor,'cashNowMinor');
  if(nowMinor>quote.cashDueMinor)throw new DomainError('INVALID_AMOUNT','Предоплата превышает сумму заказа');
  const ids = walletIds(userId, quote.hotelId);
  const operation = {
    id: operationId, userId, bookingId, hotelId: quote.hotelId, status: 'confirmed', method,
    orderTotalMinor: quote.orderTotalMinor, pointsMinor: quote.applied.pointsMinor,
    debits: { [ids.hotel]: quote.applied.hotelPoints, [ids.keys]: quote.applied.keysPoints },
    paidCashMinor: nowMinor,
    dueAtHotelMinor: quote.cashDueMinor-nowMinor,
  };
  return {
    state: { balances: { ...state.balances, [ids.hotel]: fresh.remaining.hotelPoints, [ids.keys]: fresh.remaining.keysPoints },
      operations: { ...state.operations, [operationId]: operation } },
    operation, duplicate: false,
  };
}

// This operation handles full free cancellation only. A tariff penalty requires its own agreed calculation.
export function cancelFreeBooking(state, { userId, bookingId, freeCancellationAllowed }) {
  const id = `${userId}:${bookingId}`;
  const operation = state.operations[id];
  if (!operation) throw new DomainError('BOOKING_NOT_FOUND', 'Подтверждённая бронь не найдена');
  if (operation.status === 'cancelled') return { state, operation, duplicate: true };
  if (freeCancellationAllowed !== true) throw new DomainError('PENALTY_REVIEW_REQUIRED', 'Нужен расчёт условий отмены');
  const balances = { ...state.balances };
  for (const [wallet, amount] of Object.entries(operation.debits)) {
    balances[wallet] = total([balances[wallet] ?? 0, amount], 'restoredPoints');
  }
  const cancelled = { ...operation, status: 'cancelled', refundCashMinor: operation.paidCashMinor,
    returnedPointsMinor: operation.pointsMinor, dueAtHotelMinor: 0 };
  return { state: { balances, operations: { ...state.operations, [id]: cancelled } }, operation: cancelled, duplicate: false };
}
