// Redux
import { useSelector } from 'react-redux';

import useTheme from '../../../hooks/useTheme';
import SideBarLink from './SideBarLink';

const SideBar = ({ mobileOpen }) => {
    // __________________Redux State______________________\\
    const agent = useSelector((state) => state.agent);
    const { theme, toggleTheme, mounted } = useTheme();

    return (
        <div
            id="app-sidebar"
            className={`bg-sidebar h-screen flex-shrink-0 fixed left-0 top-0 z-[999] border-r border-sidebar-border select-none transition-transform duration-200 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
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
                        <SideBarLink name="Property Search" url="/search" icon="pi pi-search mr-2" />
                        <SideBarLink name="Calendar" url="/calendar" icon="pi pi-calendar mr-2" />
                        <SideBarLink
                            name="Transactions"
                            url="/transactions"
                            icon="pi pi-briefcase mr-2"
                        />
                        <SideBarLink
                            name="Drip Campaigns"
                            url="/drip-campaigns"
                            icon="pi pi-send mr-2"
                        />
                        <li>
                                <span className="block p-3 text-sidebar-foreground/50 text-xs font-semibold tracking-wider">LEADS</span>
                        </li>
                        <SideBarLink name="Leads" url="/leads" icon="pi pi-users mr-2" />
                        <SideBarLink
                            name="Add A Lead"
                            url="/add-lead"
                            icon="pi pi-user-plus mr-2"
                        />
                        <SideBarLink name="Save Property Search" url="/save-property-search" icon="pi pi-search mr-2" />
                    </ul>
                    {agent?.role === 'admin' && (
                        <ul className="list-none p-3 m-0">
                            <li>
                                <span className="block p-3 text-sidebar-foreground/50 text-xs font-semibold tracking-wider">ADMIN</span>
                            </li>
                            <SideBarLink
                                name="Agents"
                                url="/agents"
                                icon="pi pi-users mr-2"
                            />
                            <SideBarLink
                                name="IRG Areas"
                                url="/irg-areas"
                                icon="pi pi-map-marker mr-2"
                            />
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
                            <SideBarLink
                                name="Traffic Dashboard"
                                url="/traffic-dashboard"
                                icon="pi pi-chart-line mr-2"
                            />
                        </ul>
                    )}
                </div>

                {/* Theme toggle — pinned to bottom */}
                <div className="mt-auto flex-shrink-0 border-t border-sidebar-border px-4 py-3">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-150 text-sm font-medium"
                    >
                        {mounted && (
                            <i className={`pi ${theme === 'dark' ? 'pi-sun' : 'pi-moon'} text-base`} />
                        )}
                        {mounted && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SideBar;
