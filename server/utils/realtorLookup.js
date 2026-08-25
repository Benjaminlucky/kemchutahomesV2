import Realtor from "../models/realtor.model.js";

/**
 * utils/realtorLookup.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mongoose's id-based finders (findById, findByIdAndUpdate, ...) cast the
 * given id to a BSON ObjectId before querying, so they never match a realtor
 * document whose _id happens to be stored as a plain string — confirmed live
 * via a real account: its JWT carried the exact id its own login response
 * had just returned (unexpired, unmodified), yet findById(that id) still
 * found nothing. MongoDB equality is type-strict, so an ObjectId-cast query
 * never matches a string-typed _id, even with identical characters. Likely
 * cause: the account's _id was set outside the normal signup flow's
 * Mongoose-generated ObjectId (e.g. a manually seeded/imported document).
 *
 * findRealtorByIdFlexible() falls back to the raw driver (no casting) and
 * hydrates the result into a real Mongoose document, so callers can still
 * use populate()/toObject()/save() exactly like the normal path.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function findRealtorByIdFlexible(id) {
  const viaMongoose = await Realtor.findById(id);
  if (viaMongoose) return viaMongoose;
  const raw = await Realtor.collection.findOne({ _id: id });
  return raw ? Realtor.hydrate(raw) : null;
}
