import { useRouter } from 'next/router';
import MainLayout from '../../../components/layout/MainLayout';
import MainSearchPage from '../../../components/Search/MainSearchPage';

const SearchPage = () => {
    const router = useRouter();
    const areaLabel = router.query.area
        ? router.query.area.replace(/-/g, ' ')
        : 'Search';

    return (
        <MainLayout title={`Search: ${areaLabel}`}>
            <MainSearchPage />
        </MainLayout>
    );
};

export default SearchPage;
