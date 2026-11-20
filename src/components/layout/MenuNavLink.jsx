import { NavLink } from 'react-router-dom';

/** @param {{ name: import('react').ReactNode, path: string, collapseMenu: () => void, icon?: import('react').ReactNode, className?: string }} props */
const MenuNavLink = ({ name, path, collapseMenu, icon = null, className = 'nav-link'}) => {
  return (
    <li className='nav-item'>
      <NavLink className={className} to={path} onClick={collapseMenu}>{icon}{name}</NavLink>
    </li>
  );
};
export default MenuNavLink;