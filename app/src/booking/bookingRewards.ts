import type {BookingQuote} from '../../../prototype/domain/booking.mjs';

/** Approved prototype preview: 5% of lodging after discounts and points,
 * excluding services. Does not credit a wallet or define production tiers. */
export const DEMO_KEYS_EARN_BASIS_POINTS = 500;
export function bookingRewardPoints(quote:Pick<BookingQuote,'lodgingMinor'|'applied'>){
 const eligibleMinor=Math.max(0,quote.lodgingMinor-quote.applied.pointsMinor);
 return Math.floor(eligibleMinor*DEMO_KEYS_EARN_BASIS_POINTS/1_000_000);
}
