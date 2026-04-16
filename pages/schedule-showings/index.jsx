import { useCallback, useState } from 'react';

import MainLayout from '../../components/layout/MainLayout';
import PropertySearch from '../../components/ScheduleShowings/PropertySearch';
import TourList from '../../components/ScheduleShowings/TourList';
import TourMap from '../../components/ScheduleShowings/TourMap';
import { isAlreadyInTour } from '../../components/ScheduleShowings/tourHelpers';

const ScheduleShowings = () => {
    const [stops, setStops] = useState([]);

    const handleAdd = useCallback((stop) => {
        setStops((prev) => {
            if (isAlreadyInTour(prev, stop.mls_number)) return prev;
            return [...prev, stop];
        });
    }, []);

    const handleRemove = useCallback((mlsNumber) => {
        setStops((prev) => prev.filter((s) => s.mls_number !== mlsNumber));
    }, []);

    return (
        <MainLayout title="Schedule Showings">
            <div className="p-[24px] flex flex-col gap-[24px]">
                {/* Header row */}
                <div
                    className={
                        'flex flex-col min-[900px]:flex-row '
                        + 'min-[900px]:items-center min-[900px]:justify-between gap-[16px]'
                    }
                >
                    <h1 className="m-0 text-[28px] font-semibold text-foreground">
                        Schedule Showings
                    </h1>
                    <button
                        type="button"
                        disabled
                        title="Persistence coming in next phase"
                        className={
                            'bg-primary text-white rounded-[8px] '
                            + 'px-[20px] py-[10px] text-[14px] font-semibold '
                            + 'opacity-50 cursor-not-allowed '
                            + 'self-start min-[900px]:self-auto'
                        }
                    >
                        Save Tour
                    </button>
                </div>

                {/* Two-column split:
                      - < 900px: search + list on top, map below
                      - >= 900px: search + list on left, map on right */}
                <div className="grid grid-cols-1 min-[900px]:grid-cols-[420px_1fr] gap-[24px]">
                    {/* Left column — search + tour list */}
                    <div className="flex flex-col gap-[16px] min-w-0">
                        <PropertySearch stops={stops} onAdd={handleAdd} />
                        <TourList stops={stops} onRemove={handleRemove} />
                    </div>

                    {/* Right column — map */}
                    <div className="min-w-0">
                        <TourMap stops={stops} />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ScheduleShowings;
