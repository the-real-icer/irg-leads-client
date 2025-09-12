// React & NextJS
import Link from 'next/link';

// Third Party Components
import { Ripple } from 'primereact/ripple';

const SideBarLink = ({ url, name, icon }) => (
    <Link href={url} passHref>
        <li className="p-ripple flex align-items-center cursor-pointer p-3 border-round hover:bg-gray-800 text-gray-300 hover:text-white transition-duration-150 transition-colors w-full">
            <i className={icon}></i>
            <span className="font-large">{name}</span>
            <Ripple />
        </li>
    </Link>
);

export default SideBarLink;
