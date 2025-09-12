// // React & NextJS
// import Link from 'next/link';

// Redux
import { useSelector } from 'react-redux';

// // Third Party Components
// import { Ripple } from 'primereact/ripple';

import SideBarLink from './SideBarLink';

const SideBar = () => {
    // __________________Redux State______________________\\
    const agent = useSelector((state) => state.agent);

    return (
        <div
            id="app-sidebar-3"
            className="bg-gray-900 h-screen hidden lg:block flex-shrink-0 absolute lg:static left-0 top-0 z-1 border-right-1 border-gray-800 select-none"
            style={{ width: '280px' }}
        >
            <div className="flex flex-column h-full">
                <div
                    className="flex align-items-center px-5 flex-shrink-0"
                    style={{ height: '60px' }}
                >
                    <img src="/IRG-Logo-White.png" alt="Ice Realty Group" height={40} />
                </div>
                <div className="overflow-y-auto">
                    <ul className="list-none p-3 m-0">
                        <SideBarLink name="Dashboard" url="/dashboard" icon="pi pi-home mr-2" />
                        <SideBarLink name="Hotsheet" url="/hotsheet" icon="pi pi-bolt mr-2" />
                        <SideBarLink name="Marketing" url="/marketing" icon="pi pi-image mr-2" />
                        <SideBarLink
                            name="Transactions"
                            url="/transactions"
                            icon="pi pi-briefcase mr-2"
                        />
                        <SideBarLink name="Leads" url="/leads" icon="pi pi-users mr-2" />
                        <SideBarLink
                            name="Add A Lead"
                            url="/add-lead"
                            icon="pi pi-user-plus mr-2"
                        />
                        <SideBarLink name="Search" url="/search" icon="pi pi-search mr-2" />
                        <SideBarLink name="Calendar" url="/calendar" icon="pi pi-calendar mr-2" />
                        <SideBarLink name="Profile" url="/profile" icon="pi pi-cog mr-2" />
                    </ul>
                    {agent.role === 'admin' && (
                        <ul className="list-none p-3 m-0">
                            <li>
                                <span className="block p-3 text-600">ADMIN</span>
                            </li>
                            <SideBarLink
                                name="New Properties"
                                url="/new-properties"
                                icon="pi pi-database mr-2"
                            />
                            <SideBarLink
                                name="Agent Production"
                                url="/agent-production"
                                icon="pi pi-id-card mr-2"
                            />
                            <SideBarLink
                                name="Property URL Search"
                                url="/property-url-search"
                                icon="pi pi-search mr-2"
                            />
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SideBar;
