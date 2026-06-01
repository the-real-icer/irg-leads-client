import test from 'node:test';
import assert from 'node:assert/strict';

import { FALLBACK_IMAGE_LIGHT } from '../../utils/propertyImageFallback';
import {
    formatAddressLine,
    formatBedsBathsSqft,
    formatCityStateZip,
    formatClientName,
    formatGeneratedDate,
    formatHoaFee,
    formatLotSize,
    formatNumber,
    formatPrice,
    formatPrintDate,
    formatStories,
    getListingStatus,
    getPrimaryPropertyImage,
    getPrintablePropertyImages,
    hasPrintableCoords,
} from './printFormatters';

test('formatAddressLine renders a street address with unit number', () => {
    assert.equal(
        formatAddressLine({ address: '123 Main St', unit_number: '4B', mls_number: 'ML123' }),
        '123 Main St #4B',
    );
});

test('formatAddressLine falls back to MLS number when address is missing', () => {
    assert.equal(formatAddressLine({ mls_number: 'ML123' }), 'MLS #ML123');
    assert.equal(formatAddressLine({ address: '   ', mls_number: 'ML456' }), 'MLS #ML456');
});

test('formatAddressLine returns a safe missing-address label', () => {
    assert.equal(formatAddressLine({}), 'Address not available');
    assert.equal(formatAddressLine(null), 'Address not available');
});

test('formatCityStateZip composes available location fields defensively', () => {
    assert.equal(
        formatCityStateZip({ city: 'Beverly Hills', state: 'CA', zip_code: '90210' }),
        'Beverly Hills, CA 90210',
    );
    assert.equal(formatCityStateZip({ state: 'CA', zip_code: '90210' }), 'CA 90210');
    assert.equal(formatCityStateZip(null), '');
});

test('formatPrice prefers display price and formats raw price', () => {
    assert.equal(formatPrice({ price: '$1,250,000', price_raw: 1 }), '$1,250,000');
    assert.equal(formatPrice({ price_raw: 1250000 }), '$1,250,000');
    assert.equal(formatPrice({ price_raw: '899000' }), '$899,000');
    assert.equal(formatPrice({ price_raw: 0 }), '');
    assert.equal(formatPrice(null), '');
});

test('formatBedsBathsSqft omits missing or zero values', () => {
    assert.equal(
        formatBedsBathsSqft({ bedrooms: 3, bathrooms: 2.5, sqft_raw: 1800 }),
        '3 bd / 2.5 ba / 1,800 sqft',
    );
    assert.equal(formatBedsBathsSqft({ bedrooms: 0, bathrooms: 2, sqft: '900' }), '2 ba / 900 sqft');
    assert.equal(formatBedsBathsSqft({ bedrooms: '4', bathrooms: '3', sqft_raw: '2450' }), '4 bd / 3 ba / 2,450 sqft');
    assert.equal(formatBedsBathsSqft({}), '');
});

test('formatLotSize supports acres and square-foot lot values', () => {
    assert.equal(formatLotSize({ lot_size_acres: 0.25 }), '0.25 acres');
    assert.equal(formatLotSize({ lot_sqft: 7200 }), '7,200 sqft lot');
    assert.equal(formatLotSize({ lot_sqft: '5400' }), '5,400 sqft lot');
    assert.equal(formatLotSize({ lot_size: 1.234 }), '1.23 acres');
    assert.equal(formatLotSize({ lot_size_acres: 0 }), '');
});

test('formatStories maps MLS level codes and preserves descriptive values', () => {
    assert.equal(formatStories({ levels: 'A' }), 'Single Story');
    assert.equal(formatStories({ levels: 'U' }), '2 Story');
    assert.equal(formatStories({ stories: 'Three or More' }), 'Three or More');
    assert.equal(formatStories({}), '');
});

test('formatHoaFee formats positive HOA values only', () => {
    assert.equal(formatHoaFee({ association_fee: 450 }), '$450');
    assert.equal(formatHoaFee({ hoa_fee: '125' }), '$125');
    assert.equal(formatHoaFee({ association_fee: 0 }), '');
    assert.equal(formatHoaFee({}), '');
});

test('formatNumber handles positive finite numbers only', () => {
    assert.equal(formatNumber(1234567), '1,234,567');
    assert.equal(formatNumber('2500'), '2,500');
    assert.equal(formatNumber(0), '');
    assert.equal(formatNumber('not-a-number'), '');
});

test('hasPrintableCoords validates finite latitude and longitude', () => {
    assert.equal(hasPrintableCoords({ coordinates: { lat: 34.05, lng: -118.25 } }), true);
    assert.equal(hasPrintableCoords({ coordinates: { lat: 0, lng: 0 } }), true);
    assert.equal(hasPrintableCoords({ coordinates: { lat: '34.05', lng: -118.25 } }), false);
    assert.equal(hasPrintableCoords({ coordinates: { lat: Number.NaN, lng: -118.25 } }), false);
    assert.equal(hasPrintableCoords({ coordinates: { lat: 34.05 } }), false);
    assert.equal(hasPrintableCoords(null), false);
});

test('getPrimaryPropertyImage preserves direct primary and thumbnail URLs', () => {
    assert.equal(
        getPrimaryPropertyImage({ primaryImage: 'https://cdn.example.com/photo.jpg' }),
        'https://cdn.example.com/photo.jpg',
    );
    assert.equal(getPrimaryPropertyImage({ thumbnail: '/local-thumb.jpg' }), '/local-thumb.jpg');
});

test('getPrimaryPropertyImage uses ImageKit for MLS listing pictures', () => {
    const image = getPrimaryPropertyImage({
        listing_pictures: [{ media_url: 'http://photos.example.com/home.jpg' }],
    });

    assert.equal(
        image,
        'https://ik.imagekit.io/jwx2v3mb8ae/https://photos.example.com/home.jpg?preset=X-Large',
    );

    assert.equal(
        getPrimaryPropertyImage({ listing_pictures: [{ large_url: 'https://photos.example.com/large.jpg' }] }),
        'https://ik.imagekit.io/jwx2v3mb8ae/https://photos.example.com/large.jpg?preset=X-Large',
    );
});

test('getPrimaryPropertyImage supports legacy listing_pics fallback', () => {
    assert.equal(
        getPrimaryPropertyImage({ listing_pics: ['http://photos.example.com/legacy.jpg'] }),
        'https://ik.imagekit.io/jwx2v3mb8ae/https://photos.example.com/legacy.jpg',
    );
});

test('getPrintablePropertyImages returns ImageKit-compatible property photo list', () => {
    assert.deepEqual(
        getPrintablePropertyImages({
            listing_pictures: [
                { media_url: 'http://photos.example.com/one.jpg' },
                { large_url: 'https://photos.example.com/two.jpg' },
            ],
        }),
        [
            'https://ik.imagekit.io/jwx2v3mb8ae/https://photos.example.com/one.jpg?tr=w-1600,q-80,f-auto',
            'https://ik.imagekit.io/jwx2v3mb8ae/https://photos.example.com/two.jpg?preset=X-Large',
        ],
    );
});

test('getPrintablePropertyImages renders the hero at print resolution and tiles via preset', () => {
    const out = getPrintablePropertyImages({
        listing_pictures: [
            { media_url: 'https://photos.example.com/a.jpg' },
            { media_url: 'https://photos.example.com/b.jpg' },
            { media_url: 'https://photos.example.com/c.jpg' },
        ],
    });
    assert.equal(out.length, 3);
    assert.ok(out[0].endsWith('a.jpg?tr=w-1600,q-80,f-auto'), 'hero uses the width transform');
    assert.ok(out[1].endsWith('b.jpg?preset=X-Large'), 'second tile keeps the preset');
    assert.ok(out[2].endsWith('c.jpg?preset=X-Large'), 'third tile keeps the preset');
});

test('getPrintablePropertyImages appends with & when the source already has a query', () => {
    const out = getPrintablePropertyImages({
        listing_pictures: [
            { media_url: 'https://photos.example.com/one.jpg?v=2' },
            { media_url: 'https://photos.example.com/two.jpg?w=8&h=6' },
        ],
    });
    assert.equal(
        out[0],
        'https://ik.imagekit.io/jwx2v3mb8ae/https://photos.example.com/one.jpg?v=2&tr=w-1600,q-80,f-auto',
    );
    assert.equal(
        out[1],
        'https://ik.imagekit.io/jwx2v3mb8ae/https://photos.example.com/two.jpg?w=8&h=6&preset=X-Large',
    );
});

test('getPrintablePropertyImages builds legacy listing_pics sequence safely', () => {
    assert.deepEqual(
        getPrintablePropertyImages({
            listing_pics: 'http://photos.example.com/0/photo.JPG?preset=thumb',
            pic_count: 2,
        }),
        [
            'https://ik.imagekit.io/jwx2v3mb8ae/https://photos.example.com/0/photo.JPG?preset=X-Large',
            'https://ik.imagekit.io/jwx2v3mb8ae/https://photos.example.com/1/photo-1.JPG?preset=X-Large',
            'https://ik.imagekit.io/jwx2v3mb8ae/https://photos.example.com/2/photo-2.JPG?preset=X-Large',
        ],
    );
    assert.deepEqual(getPrintablePropertyImages(null), []);
});

test('getPrimaryPropertyImage falls back safely when no image is available', () => {
    assert.equal(getPrimaryPropertyImage({ listing_pictures: [] }), FALLBACK_IMAGE_LIGHT);
    assert.equal(getPrimaryPropertyImage(null), FALLBACK_IMAGE_LIGHT);
});

test('date and client formatters handle valid and invalid inputs', () => {
    assert.equal(formatPrintDate('not-a-date'), '');
    assert.equal(formatGeneratedDate('not-a-date'), '');
    assert.equal(formatClientName({ first_name: 'Ada', last_name: 'Lovelace' }), 'Ada Lovelace');
    assert.equal(formatClientName({ email: 'client@example.com' }), 'client@example.com');
    assert.equal(formatClientName(null), '');
});

test('getListingStatus checks known listing status fields in order', () => {
    assert.equal(getListingStatus({ mls_status: 'Active', listing_status: 'Pending' }), 'Active');
    assert.equal(getListingStatus({ property_status: 'Closed' }), 'Closed');
    assert.equal(getListingStatus({}), '');
});
