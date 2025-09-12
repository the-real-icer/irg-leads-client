import { useRef } from 'react';

// Redux
import { useSelector } from 'react-redux';

import { Button } from 'primereact/button';
import { TieredMenu } from 'primereact/tieredmenu';

import RecentListingCard from './RecentListingCard';

const RecentListings = () => {
    // __________________Redux State______________________\\
    const hotsheet = useSelector((state) => state.hotsheet);

    const menu2 = useRef(null);

    const items = [
        {
            label: 'City',
            // icon: 'pi pi-fw pi-file',
            items: [
                {
                    label: 'New',
                    icon: 'pi pi-fw pi-plus',
                    items: [
                        {
                            label: 'Bookmark',
                            icon: 'pi pi-fw pi-bookmark',
                        },
                        {
                            label: 'Video',
                            icon: 'pi pi-fw pi-video',
                        },
                    ],
                },
                {
                    label: 'Delete',
                    icon: 'pi pi-fw pi-trash',
                },
                {
                    separator: true,
                },
                {
                    label: 'Export',
                    icon: 'pi pi-fw pi-external-link',
                },
            ],
        },
        {
            label: 'Zipcode',
            // icon: 'pi pi-fw pi-pencil',
            items: [
                {
                    label: 'Left',
                    icon: 'pi pi-fw pi-align-left',
                },
                {
                    label: 'Right',
                    icon: 'pi pi-fw pi-align-right',
                },
                {
                    label: 'Center',
                    icon: 'pi pi-fw pi-align-center',
                },
                {
                    label: 'Justify',
                    icon: 'pi pi-fw pi-align-justify',
                },
            ],
        },
        {
            label: 'Neighborhood',
            // icon: 'pi pi-fw pi-user',
            items: [
                {
                    label: 'New',
                    icon: 'pi pi-fw pi-user-plus',
                },
                {
                    label: 'Delete',
                    icon: 'pi pi-fw pi-user-minus',
                },
                {
                    label: 'Search',
                    icon: 'pi pi-fw pi-users',
                    items: [
                        {
                            label: 'Filter',
                            icon: 'pi pi-fw pi-filter',
                            items: [
                                {
                                    label: 'Print',
                                    icon: 'pi pi-fw pi-print',
                                },
                            ],
                        },
                        {
                            icon: 'pi pi-fw pi-bars',
                            label: 'List',
                        },
                    ],
                },
            ],
        },
        {
            label: 'County',
            // icon: 'pi pi-fw pi-calendar',
            items: [
                {
                    label: 'Edit',
                    icon: 'pi pi-fw pi-pencil',
                    items: [
                        {
                            label: 'Save',
                            icon: 'pi pi-fw pi-calendar-plus',
                        },
                        {
                            label: 'Delete',
                            icon: 'pi pi-fw pi-calendar-minus',
                        },
                    ],
                },
                {
                    label: 'Archieve',
                    icon: 'pi pi-fw pi-calendar-times',
                    items: [
                        {
                            label: 'Remove',
                            icon: 'pi pi-fw pi-calendar-minus',
                        },
                    ],
                },
            ],
        },
    ];

    return (
        <div className="col-12 lg:col-6">
            <div className="surface-card shadow-2 border-round p-4 h-full">
                <div className="flex align-items-center justify-content-between mb-3">
                    <div className="text-900 font-medium text-xl">Recent Listings</div>
                    <div>
                        <Button
                            icon="pi pi-ellipsis-v"
                            className="p-button-text p-button-plain p-button-rounded"
                            onClick={(event) => menu2.current.toggle(event)}
                        />
                        <TieredMenu model={items} popup ref={menu2} />
                        {/* <Menu ref={menu2} popup model={items} /> */}
                    </div>
                </div>
                <ul className="list-none p-0 m-0">
                    {hotsheet?.initialHomes?.length && (
                        <RecentListingCard home={hotsheet.initialHomes[0]} />
                    )}
                    {hotsheet?.initialHomes?.length && (
                        <RecentListingCard home={hotsheet.initialHomes[1]} />
                    )}
                    {hotsheet?.initialHomes?.length && (
                        <RecentListingCard home={hotsheet.initialHomes[2]} />
                    )}
                    {hotsheet?.initialHomes?.length && (
                        <RecentListingCard home={hotsheet.initialHomes[3]} />
                    )}
                    {hotsheet?.initialHomes?.length && (
                        <RecentListingCard home={hotsheet.initialHomes[4]} />
                    )}
                </ul>
            </div>
        </div>
    );
};

export default RecentListings;
