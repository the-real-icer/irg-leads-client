/**
 * Format a price number into abbreviated display string.
 * e.g. 1500000 → "$1.5M", 500000 → "$500K", 850 → "$850"
 * Accepts numbers or string prices (strips non-numeric chars).
 */
const formatPrice = (price) => {
    const num = typeof price === 'number' ? price : parseInt(String(price).replace(/[^0-9]/g, ''), 10);
    if (isNaN(num)) return price;
    if (num >= 1000000) {
        const m = num / 1000000;
        return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `$${Math.round(num / 1000)}K`;
    }
    return `$${num}`;
};

export default formatPrice;
