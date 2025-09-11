import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarData } from '../../core/json/siderbar_data';
// import { useTranslation } from "react-i18next";
import { useSelector } from 'react-redux';
import { all_routes } from '../../routes/all_routes';
import { customer15, logo, logoSmall, logoWhite } from '../../utils/imagepath';
const Sidebar = () => {
  const route = all_routes;

  const Location = useLocation();
  // const { t } = useTranslation();

  const [subOpen, setSubopen] = useState('');
  const [subsidebar, setSubsidebar] = useState('');

  const toggleSidebar = (title: any) => {
    if (title == subOpen) {
      setSubopen('');
    } else {
      setSubopen(title);
    }
  };

  const toggleSubsidebar = (subitem: any) => {
    if (subitem == subsidebar) {
      setSubsidebar('');
    } else {
      setSubsidebar(subitem);
    }
  };

  const [toggle, SetToggle] = useState(false);
  const handlesidebar = () => {
    document.body.classList.toggle('mini-sidebar');
    SetToggle((current) => !current);
  };

  const { expandMenus } = useSelector((state: any) => state.themeSetting.expandMenus);
  const dataLayout = useSelector((state: any) => state.themeSetting.dataLayout);

  const expandMenu = () => {
    document.body.classList.remove('expand-menu');
  };
  const expandMenuOpen = () => {
    document.body.classList.add('expand-menu');
  };

  return (
    <div>
      <div
        className={`sidebar ${toggle ? '' : 'active'} ${expandMenus || dataLayout === 'layout-hovered' ? 'expand-menu' : ''}`}
        id="sidebar"
        onMouseLeave={expandMenu}
        onMouseOver={expandMenuOpen}
      >
        <>
          {/* Logo */}
          <div className="sidebar-logo">
            <Link to={route.newdashboard} className="logo logo-normal">
              <img src={logo} alt="Img" />
            </Link>
            <Link to={route.newdashboard} className="logo logo-white">
              <img src={logoWhite} alt="Img" />
            </Link>
            <Link to={route.newdashboard} className="logo-small">
              <img src={logoSmall} alt="Img" />
            </Link>
            <Link id="toggle_btn" to="#" onClick={handlesidebar}>
              <i className="feather icon-chevrons-left feather-16" />
            </Link>
          </div>
          {/* /Logo */}
          <div className="modern-profile p-3 pb-0">
            <div className="text-center rounded bg-light p-3 mb-4 border">
              <div className="avatar avatar-lg online mb-3">
                <img src={customer15} alt="Img" className="img-fluid rounded-circle" />
              </div>
              <h6 className="fs-14 fw-bold mb-1">Adrian Herman</h6>
              <p className="fs-12 mb-0">System Admin</p>
            </div>
            <div className="sidebar-nav mb-3">
              <ul className="nav nav-tabs nav-tabs-solid nav-tabs-rounded nav-justified bg-transparent" role="tablist">
                <li className="nav-item">
                  <Link className="nav-link active border-0" to="#">
                    Menu
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link border-0" to={route.chat}>
                    Chats
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link border-0" to={route.email}>
                    Inbox
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="sidebar-header p-3 pb-0 pt-2">
            <div className="text-center rounded bg-light p-2 mb-4 sidebar-profile d-flex align-items-center">
              <div className="avatar avatar-md onlin">
                <img src={customer15} alt="Img" className="img-fluid rounded-circle" />
              </div>
              <div className="text-start sidebar-profile-info ms-2">
                <h6 className="fs-14 fw-bold mb-1">Adrian Herman</h6>
                <p className="fs-12">System Admin</p>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-between menu-item mb-3">
              <div>
                <Link to={route.newdashboard} className="btn btn-sm btn-icon bg-light">
                  <i className="ti ti-layout-grid-remove" />
                </Link>
              </div>
              <div>
                <Link to={route.chat} className="btn btn-sm btn-icon bg-light">
                  <i className="ti ti-brand-hipchat" />
                </Link>
              </div>
              <div>
                <Link to={route.email} className="btn btn-sm btn-icon bg-light position-relative">
                  <i className="ti ti-message" />
                </Link>
              </div>
              <div className="notification-item">
                <Link to={route.activities} className="btn btn-sm btn-icon bg-light position-relative">
                  <i className="ti ti-bell" />
                  <span className="notification-status-dot" />
                </Link>
              </div>
              <div className="me-0">
                <Link to={route.generalsettings} className="btn btn-sm btn-icon bg-light">
                  <i className="ti ti-settings" />
                </Link>
              </div>
            </div>
          </div>
        </>
        <div data-simplebar="">
          <div className="sidebar-inner ">
            <div id="sidebar-menu" className="sidebar-menu">
              <ul>
                {SidebarData?.map((mainLabel: any, index: any) => (
                  <li className="submenu-open" key={index}>
                    <h6 className="submenu-hdr">{mainLabel?.label}</h6>
                    <ul>
                      {mainLabel?.submenuItems?.map((title: any, i: any) => {
                        const link_array: any = [];
                        title?.submenuItems?.map((link: any) => {
                          link_array.push(link?.link);
                          if (link?.submenu) {
                            link?.submenuItems?.map((item: any) => {
                              link_array.push(item?.link);
                            });
                          }
                          return link_array;
                        });
                        title.links = link_array;
                        return (
                          <React.Fragment key={i}>
                            {' '}
                            <li
                              className={`submenu ${
                                !title?.submenu && Location.pathname === title?.link ? 'custom-active-hassubroute-false' : ''
                              }`}
                            >
                              <Link
                                to={title?.link}
                                onClick={() => toggleSidebar(title?.label)}
                                className={`${subOpen === title?.label ? 'subdrop' : ''} ${
                                  title?.links?.includes(Location.pathname) ? 'active' : ''
                                }`}
                              >
                                <i className={`ti ti-${title.icon} me-2`}></i>
                                <span className="custom-active-span">
                                  {title?.label}
                                  {/* {t()} */}
                                </span>
                                {title?.submenu && <span className="menu-arrow" />}
                              </Link>
                              <ul
                                style={{
                                  display: subOpen === title?.label ? 'block' : 'none'
                                }}
                              >
                                {title?.submenuItems?.map((item: any, titleIndex: any) => (
                                  <li className="submenu submenu-two" key={titleIndex}>
                                    <Link
                                      to={item?.link}
                                      className={`${
                                        item?.submenuItems?.map((link: any) => link.link).includes(Location.pathname) ||
                                        item?.link === Location.pathname
                                          ? 'active'
                                          : ''
                                      } ${subsidebar === item?.label ? 'subdrop' : ''}`}
                                      onClick={() => toggleSubsidebar(item?.label)}
                                    >
                                      {item?.label}
                                      {item?.submenu && <span className="menu-arrow inside-submenu" />}
                                    </Link>
                                    <ul
                                      style={{
                                        display: subsidebar === item?.label ? 'block' : 'none'
                                      }}
                                    >
                                      {item?.submenuItems?.map((items: any, subIndex: any) => (
                                        <li key={subIndex}>
                                          <Link
                                            to={items?.link}
                                            className={`${subsidebar === items?.label ? 'submenu-two subdrop' : 'submenu-two'} ${
                                              items?.submenuItems?.map((link: any) => link.link).includes(Location.pathname) ||
                                              items?.link === Location.pathname
                                                ? 'active'
                                                : ''
                                            }`}
                                          >
                                            {items?.label}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          </React.Fragment>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* <CollapsedSidebar /> */}
    </div>
  );
};

export default Sidebar;
