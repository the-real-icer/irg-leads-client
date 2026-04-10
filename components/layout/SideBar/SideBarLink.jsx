// React & NextJS
import Link from 'next/link';

const SideBarLink = ({ url, name, icon }) => (
    <Link href={url} passHref>
        <li
            className="flex items-center cursor-pointer p-[14px] rounded w-full
                text-sidebar-foreground hover:text-sidebar-accent-foreground
                hover:bg-sidebar-accent transition-colors duration-150"
        >
            <i className={icon}></i>
            <span className="text-sm">{name}</span>
        </li>
    </Link>
);

export default SideBarLink;
