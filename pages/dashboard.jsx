// import { Button } from 'primereact/button';
// import { Menu } from 'primereact/menu';
// import { TieredMenu } from 'primereact/tieredmenu';

import MainLayout from '../components/layout/MainLayout';
import RecentListings from '../components/Dashboard/RecentListings';
// import NewsStories from '../components/Dashboard/NewStories';

const Dashboard = () => (
    <MainLayout>
        <div
            className="min-h-screen flex flex-column"
            style={{ overflowY: 'scroll', height: '500px' }}
        >
            <div className="p-5 flex flex-column flex-auto">
                <div className="grid">
                    <div className="col-12">
                        <div className="surface-card shadow-2 border-round flex p-3 flex-column md:flex-row">
                            <div className="border-bottom-1 md:border-right-1 md:border-bottom-none surface-border flex-auto p-3">
                                <div className="flex align-items-center mb-3">
                                    <i className="pi pi-dollar text-blue-500 text-xl mr-2"></i>
                                    <span className="text-500 font-medium">YTD. Volume</span>
                                </div>
                                <span className="block text-900 font-medium mb-4 text-xl">
                                    152 New
                                </span>
                            </div>
                            <div className="border-bottom-1 md:border-right-1 md:border-bottom-none surface-border flex-auto p-3">
                                <div className="flex align-items-center mb-3">
                                    <i className="pi pi-shopping-cart text-orange-500 text-xl mr-2"></i>
                                    <span className="text-500 font-medium">
                                        Current Transactions
                                    </span>
                                </div>
                                <span className="block text-900 font-medium mb-4 text-xl">
                                    $1500
                                </span>
                            </div>
                            <div className="border-bottom-1 md:border-right-1 md:border-bottom-none surface-border flex-auto p-3">
                                <div className="flex align-items-center mb-3">
                                    <i className="pi pi-briefcase text-cyan-500 text-xl mr-2"></i>
                                    <span className="text-500 font-medium">Customers</span>
                                </div>
                                <span className="block text-900 font-medium mb-4 text-xl">
                                    25100
                                </span>
                            </div>
                            <div className="flex-auto p-3">
                                <div className="flex align-items-center mb-3">
                                    <i className="pi pi-users text-purple-500 text-xl mr-2"></i>
                                    <span className="text-500 font-medium">Leads</span>
                                </div>
                                <span className="block text-900 font-medium mb-4 text-xl">72</span>
                            </div>
                        </div>
                    </div>
                    <RecentListings />
                    <div className="col-12 lg:col-6">
                        <div className="surface-card shadow-2 border-round p-4 h-full">
                            <div className="flex align-items-center justify-content-between mb-4">
                                <div className="text-900 font-medium text-xl">
                                    Recent Lead Activity
                                </div>
                                {/* <div>
                                        <Button
                                            icon="pi pi-ellipsis-v"
                                            className="p-button-text p-button-plain p-button-rounded"
                                            onClick={(event) => menu2.current.toggle(event)}
                                        />
                                        <Menu ref={menu2} popup model={items} />
                                    </div> */}
                            </div>

                            <span className="block text-600 font-medium mb-3">TODAY</span>
                            <ul className="p-0 mx-0 mt-0 mb-4 list-none">
                                <li className="flex align-items-center py-2 border-bottom-1 surface-border">
                                    <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                                        {/* <img
                                                src={stories[1].urlToImage}
                                                alt="windows"
                                                // className="mx-auto block mb-4"
                                            /> */}
                                    </div>
                                    <span className="text-900 line-height-3">
                                        Richard Jones
                                        <span className="text-700">
                                            has purchased a blue t-shirt for{' '}
                                            <span className="text-blue-500">79$</span>
                                        </span>
                                    </span>
                                </li>
                                <li className="flex align-items-center py-2">
                                    <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-orange-100 border-circle mr-3 flex-shrink-0">
                                        <i className="pi pi-download text-xl text-orange-500"></i>
                                    </div>
                                    <span className="text-700 line-height-3">
                                        Your request for withdrawal of{' '}
                                        <span className="text-blue-500 font-medium">2500$</span> has
                                        been initiated.
                                    </span>
                                </li>
                            </ul>

                            <span className="block text-600 font-medium mb-3">YESTERDAY</span>
                            <ul className="p-0 m-0 list-none">
                                <li className="flex align-items-center py-2 border-bottom-1 surface-border">
                                    <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0">
                                        <i className="pi pi-dollar text-xl text-blue-500"></i>
                                    </div>
                                    <span className="text-900 line-height-3">
                                        Keyser Wick
                                        <span className="text-700">
                                            has purchased a black jacket for{' '}
                                            <span className="text-blue-500">59$</span>
                                        </span>
                                    </span>
                                </li>
                                <li className="flex align-items-center py-2 border-bottom-1 surface-border">
                                    <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-pink-100 border-circle mr-3 flex-shrink-0">
                                        <i className="pi pi-question text-xl text-pink-500"></i>
                                    </div>
                                    <span className="text-900 line-height-3">
                                        Jane Davis
                                        <span className="text-700">
                                            has posted a new questions about your product.
                                        </span>
                                    </span>
                                </li>
                                <li className="flex align-items-center py-2">
                                    <div className="w-3rem h-3rem flex align-items-center justify-content-center bg-green-100 border-circle mr-3 flex-shrink-0">
                                        <i className="pi pi-arrow-up text-xl text-green-500"></i>
                                    </div>
                                    <span className="text-900 line-height-3">
                                        Claire Smith
                                        <span className="text-700">
                                            has upvoted your store along with a comment.
                                        </span>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    {/* <NewsStories /> */}
                </div>
            </div>
        </div>
    </MainLayout>
);

export default Dashboard;
