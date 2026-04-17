/**
 * Returns a unified property-details object regardless of whether a
 * transaction is MLS-backed or off-MLS. Render code can read the
 * returned shape without branching on `transaction.property_not_listed`.
 *
 * Address/city/state/zipCode always come from the top-level transaction
 * fields (denormalized for BOTH branches — see server-side notes in
 * tasks/ for off-MLS design). Beds/baths/sqft come from the populated
 * MLS property for MLS transactions, or from the inline
 * `off_mls_property` subdocument for off-MLS transactions.
 *
 * `photoUrl` returns the https-upgraded MLS listing photo for MLS
 * transactions, or `null` for off-MLS (no photo field). The render
 * layer is responsible for falling back to the no-photo asset. We do
 * NOT run ikUrl() here — the transactions list doesn't currently route
 * photos through ImageKit, and matching existing behavior is less
 * disruptive than introducing new CDN plumbing.
 *
 * @param {object} transaction — a transaction document, ideally with
 *        .populate('property') already resolved
 * @returns {{
 *   address: string,
 *   city: string,
 *   state: string,
 *   zipCode: number | null,
 *   unitNumber: string,
 *   bedrooms: number | null,
 *   bathrooms: number | null,
 *   sqft: number | null,
 *   mlsNumber: string | null,
 *   photoUrl: string | null,
 *   isOffMls: boolean,
 * }}
 */
export const getTransactionPropertyDetails = (transaction) => {
    if (!transaction) {
        return {
            address: '',
            city: '',
            state: '',
            zipCode: null,
            unitNumber: '',
            bedrooms: null,
            bathrooms: null,
            sqft: null,
            mlsNumber: null,
            photoUrl: null,
            isOffMls: false,
        };
    }

    const isOffMls = Boolean(transaction.property_not_listed);

    // Address/city/state/zip always come from top-level — denormalized
    // at form-submit time for both branches.
    const address = transaction.address || '';
    const city = transaction.city || '';
    const state = transaction.state || '';
    const zipCode = transaction.zipCode ?? null;

    if (isOffMls) {
        const offMls = transaction.off_mls_property || {};
        return {
            address,
            city,
            state,
            zipCode,
            unitNumber: '',
            bedrooms: offMls.bedrooms ?? null,
            bathrooms: offMls.bathrooms ?? null,
            sqft: offMls.sqft ?? null,
            mlsNumber: null,
            photoUrl: null,
            isOffMls: true,
        };
    }

    // MLS-backed: read from populated property ref. If `property` is
    // null/undefined (e.g. populate was skipped or the MLS record was
    // deleted), we fall back to empty details — the top-level
    // address/city/state are still usable.
    const prop = transaction.property || {};
    return {
        address,
        city,
        state,
        zipCode,
        unitNumber: prop.unit_number || '',
        bedrooms: prop.bedrooms ?? null,
        bathrooms: prop.bathrooms ?? null,
        sqft: prop.sqft ?? null,
        mlsNumber: prop.mls_number || null,
        photoUrl: prop.listing_pics
            ? prop.listing_pics.replace(/http:/, 'https:')
            : null,
        isOffMls: false,
    };
};
