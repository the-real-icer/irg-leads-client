// React & NextJS
import { useEffect } from 'react';
import { useRouter } from 'next/router';
// import Link from 'next/link';

// Redux & Connect
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// Third Party Components
import { StyleClass } from 'primereact/styleclass';
import { Ripple } from 'primereact/ripple';
import { InputText } from 'primereact/inputtext';
// import { AutoComplete } from 'primereact/autocomplete';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';

import {
    setCenter,
    setBounds,
    setZoom,
    changeSearch,
    setPolygon,
    // setLoadingHomes,
} from '../../../store/actions/searchPage';

const TopBar = ({ irgAreas, agent }) => {
    // const btnRef14 = useRef(null);
    // const [selectedCity, setSelectedCity] = useState(null);
    // const [filteredCities, setFilteredCities] = useState(null);
    // const [groupedAreas, setGroupedAreas] = useState([]);

    const router = useRouter();

    useEffect(() => {
        const _filteredAreas = [
            {
                label: 'Cities',
                items: [],
            },
            {
                label: 'Condo Buildings',
                items: [],
            },
            {
                label: 'Neighborhoods',
                items: [],
            },
            {
                label: 'Zipcodes',
                items: [],
            },
            {
                label: 'Properties',
                items: [],
            },
        ];
        // eslint-disable-next-line
        for (const [types, areas] of Object.entries(irgAreas)) {
            if (types === 'City') {
                // eslint-disable-next-line
                for (const area of areas) {
                    _filteredAreas[0].items.push({
                        label: area.name,
                        value: area.name,
                        type: 'City',
                    });
                }
            } else if (types === 'CondoBuilding') {
                // eslint-disable-next-line
                for (const area of areas) {
                    _filteredAreas[1].items.push({
                        label: area.name,
                        value: area.name,
                        type: 'CondoBuilding',
                    });
                }
            } else if (types === 'Neighborhood') {
                // eslint-disable-next-line
                for (const area of areas) {
                    _filteredAreas[2].items.push({
                        label: area.name,
                        value: area.name,
                        type: 'Neighborhood',
                    });
                }
            } else if (types === 'Zip') {
                // eslint-disable-next-line
                for (const area of areas) {
                    _filteredAreas[3].items.push({
                        label: area.name,
                        value: area.name,
                        type: 'Zip',
                    });
                }
            } else {
                // eslint-disable-next-line
                for (const area of areas) {
                    _filteredAreas[4].items.push({
                        label: `${area.address}, ${area.city}, ${area.state}, ${area.zip_code}`,
                        value: `${area.address}, ${area.city}, ${area.state}, ${area.zip_code}`,
                        type: 'Property',
                        url: area.property_url,
                    });
                }
            }
        }
        // setGroupedAreas(_filteredAreas);
    }, []); // eslint-disable-line

    // const searchCity = (event) => {
    //     const { query } = event;
    //     const _filteredCities = [];
    //     // eslint-disable-next-line
    //     for (const area of groupedAreas) {
    //         const filteredItems = area.items.filter(
    //             (item) => item.label.toLowerCase().indexOf(query.toLowerCase()) !== -1
    //         );
    //         if (filteredItems && filteredItems.length) {
    //             _filteredCities.push({ ...area, ...{ items: filteredItems } });
    //         }
    //     }

    //     setFilteredCities(_filteredCities);
    // };

    // const groupedItemTemplate = (item) => (
    //     <div className="flex align-items-center country-item">
    //         <div>{item.label}</div>
    //     </div>
    // );

    // eslint-disable-next-line
    const onSelect = (e) => {
        // console.log(e.value);
        const cleanurl = e.value.label.replace(/\s/g, '-').toLowerCase();

        switch (e.value.type) {
            case 'City':
                return router.push(`/search/city/${cleanurl}`);
            case 'Neighborhood':
                return router.push(`/search/neighborhood/${cleanurl}`);
            case 'CondoBuilding':
                return router.push(`/search/condo-building/${cleanurl}`);
            case 'Zip':
                return router.push(`/search/zipcode/${cleanurl}`);
            case 'Property':
                return router.push(`/property/${e.value.url}`);
            default:
            // return;
            // return Router.push(`/property/[property]`, `/property/${suggestion.url}`);
        }
    };

    return (
        <div
            className="flex justify-content-between align-items-center px-5 surface-0 border-bottom-1 surface-border relative lg:static"
            style={{ height: '60px' }}
        >
            <div className="flex">
                <StyleClass
                    // nodeRef={btnRef5}
                    selector="#app-sidebar"
                    enterClassName="hidden"
                    enterActiveClassName="fadeinleft"
                    leaveToClassName="hidden"
                    leaveActiveClassName="fadeoutleft"
                    hideOnOutsideClick
                >
                    <a
                        // ref={btnRef5}
                        className="p-ripple cursor-pointer block lg:hidden text-700 mr-3"
                    >
                        <i className="pi pi-bars text-4xl"></i>
                        <Ripple />
                    </a>
                </StyleClass>
                <span className="p-input-icon-left">
                    <i className="pi pi-search"></i>
                    <InputText className="border-none" placeholder="Search" />
                </span>
            </div>
            <StyleClass
                // nodeRef={btnRef6}
                selector="@next"
                enterClassName="hidden"
                enterActiveClassName="fadein"
                leaveToClassName="hidden"
                leaveActiveClassName="fadeout"
                hideOnOutsideClick
            >
                <a
                    // ref={btnRef6}
                    className="p-ripple cursor-pointer block lg:hidden text-700"
                >
                    <i className="pi pi-ellipsis-v text-2xl"></i>
                    <Ripple />
                </a>
            </StyleClass>
            <ul
                className="list-none p-0 m-0 hidden lg:flex lg:align-items-center select-none lg:flex-row
surface-section border-1 lg:border-none surface-border right-0 top-100 z-1 shadow-2 lg:shadow-none absolute lg:static"
            >
                <li>
                    <a
                        className="p-ripple flex p-3 lg:px-3 lg:py-2 align-items-center text-600 hover:text-900 hover:surface-100 font-medium border-round cursor-pointer
        transition-duration-150 transition-colors w-full"
                    >
                        <i className="pi pi-inbox text-base lg:text-2xl mr-2 lg:mr-0"></i>
                        <span className="block lg:hidden font-medium">Inbox</span>
                        <Ripple />
                    </a>
                </li>
                <li>
                    <a
                        className="p-ripple flex p-3 lg:px-3 lg:py-2 align-items-center text-600 hover:text-900 hover:surface-100 font-medium border-round cursor-pointer
        transition-duration-150 transition-colors w-full"
                    >
                        <i className="pi pi-bell text-base lg:text-2xl mr-2 lg:mr-0 p-overlay-badge">
                            <Badge severity="danger" />
                        </i>
                        <span className="block lg:hidden font-medium">Notifications</span>
                        <Ripple />
                    </a>
                </li>
                <li className="border-top-1 surface-border lg:border-top-none">
                    <a
                        className="p-ripple flex p-3 lg:px-3 lg:py-2 align-items-center hover:surface-100 font-medium border-round cursor-pointer
        transition-duration-150 transition-colors w-full"
                    >
                        <Avatar image={agent.image} className="mr-2" shape="circle" />
                        {/* <img
                            src={agent.image}
                            alt="avatar-f-1"
                            className="mr-3 lg:mr-0"
                            style={{ width: '32px', height: '32px' }}
                        /> */}
                        <div className="block lg:hidden">
                            <div className="text-900 font-medium">Josephine Lillard</div>
                            <span className="text-600 font-medium text-sm">
                                Marketing Specialist
                            </span>
                        </div>
                        <Ripple />
                    </a>
                </li>
            </ul>
        </div>
        // <div
        //     className="flex justify-content-between align-items-center px-5 surface-0 border-bottom-1 surface-border relative lg:static"
        //     style={{ height: '60px' }}
        // >
        //     <div className="flex">
        //         <StyleClass
        //             nodeRef={btnRef14}
        //             selector="#app-sidebar-3"
        //             enterClassName="hidden"
        //             enterActiveClassName="fadeinleft"
        //             leaveToClassName="hidden"
        //             leaveActiveClassName="fadeoutleft"
        //             hideOnOutsideClick
        //         >
        //             <a
        //                 ref={btnRef14}
        //                 className="p-ripple cursor-pointer block lg:hidden text-700 mr-3"
        //             >
        //                 <i className="pi pi-bars text-4xl"></i>
        //                 <Ripple />
        //             </a>
        //         </StyleClass>
        //         <span className="p-input-icon-left">
        //             <i className="pi pi-search"></i>
        //             <InputText className="border-none w-10rem sm:w-20rem" placeholder="Search" />
        //         </span>
        //     {/* <span className="p-input-icon-left"> */}
        //     {/* <i className="pi pi-search"></i> */}
        //   {/* <InputText className="border-none" placeholder="Search" /> */}
        //  {/* <AutoComplete
        // value={selectedCity}
        // suggestions={filteredCities}
        // completeMethod={searchCity}
        // field="label"
        // optionGroupLabel="label"
        // optionGroupChildren="items"
        // optionGroupTemplate={groupedItemTemplate}
        // onChange={(e) => setSelectedCity(e.value)}
        // onSelect={onSelect}
        // forceSelection
        // autoHighlight
        // placeholder="Search"
        // virtualScrollerOptions={{ itemSize: 38 }}
        // inputClassName="topbar_input"
        // // inputStyle="width: 550px;"
        //             /> */}
        // {/* </span> */}
        // {/* </div>
        // </div> */}
    );
};

function mapDispatchToProps(dispatch) {
    return {
        changeSearch: bindActionCreators(changeSearch, dispatch),
        setZoom: bindActionCreators(setZoom, dispatch),
        setCenter: bindActionCreators(setCenter, dispatch),
        setBounds: bindActionCreators(setBounds, dispatch),
        setPolygon: bindActionCreators(setPolygon, dispatch),
    };
}

function mapStateToProps(state) {
    return {
        searchPage: state.searchPage,
        irgAreas: state.irgAreas,
        agent: state.agent,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
