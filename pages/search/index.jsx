import { useRouter } from 'next/router';
import MainLayout from '../../components/layout/MainLayout';
import PropertySearchPage from '../../components/PropertySearch/PropertySearchPage';

const Search = () => {
    const router = useRouter();
    const rawArea = router.isReady ? router.query.area : undefined;
    // Normalize: single string → array, undefined → undefined
    const areaParams = rawArea
        ? (Array.isArray(rawArea) ? rawArea : [rawArea])
        : undefined;

    return (
        <MainLayout title="Property Search">
            <PropertySearchPage areaParams={areaParams} />
        </MainLayout>
    );
};

export default Search;
