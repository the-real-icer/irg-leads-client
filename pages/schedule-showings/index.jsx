import MainLayout from '../../components/layout/MainLayout';

const ScheduleShowings = () => {
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

                {/* Two-column split: stacks on mobile, side-by-side at 900px+ */}
                <div className="flex flex-col min-[900px]:flex-row gap-[24px]">
                    {/* Left column — search + tour list */}
                    <div className="w-full min-[900px]:w-[420px] flex flex-col gap-[16px]">
                        <input
                            type="text"
                            disabled
                            placeholder="Search by address or MLS number"
                            className={
                                'w-full rounded-[12px] border border-border '
                                + 'bg-surface text-foreground placeholder:text-foreground/50 '
                                + 'text-[14px] px-[16px] py-[12px] '
                                + 'opacity-60 cursor-not-allowed'
                            }
                        />
                        <div
                            className={
                                'bg-surface rounded-[16px] border border-border '
                                + 'shadow-sm p-[24px] md:p-[32px]'
                            }
                        >
                            <p className="m-0 text-[14px] text-foreground/70 text-center">
                                No properties added yet
                            </p>
                        </div>
                    </div>

                    {/* Right column — map placeholder */}
                    <div
                        className={
                            'flex-1 bg-surface rounded-[16px] border border-border '
                            + 'shadow-sm p-[24px] md:p-[32px] '
                            + 'min-h-[400px] flex items-center justify-center'
                        }
                    >
                        <p className="m-0 text-[14px] text-foreground/70">
                            Map will load here
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ScheduleShowings;
