import * as React from 'react';
import { Menu, MenuItemLink, useSidebarState, useTranslate } from 'react-admin';
import { useLocation } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import SettingsIcon from '@mui/icons-material/Settings';
import EventIcon from '@mui/icons-material/Event';

const CustomMenu = () => {
  const [open] = useSidebarState();
  const location = useLocation();
  const translate = useTranslate(); // 👈 подключаем переводчик

  return (
    <Menu>
      <Menu.DashboardItem primaryText={translate('menu.dashboard')}/>

      <h4 style={{ padding: '0 1em', marginTop: '1em' }}>
        {translate('menu.users')} {/* 👈 из глобального файла */}
      </h4>
      <MenuItemLink
        to="/students"
        primaryText={translate('resources.students.name')}
        leftIcon={<PeopleIcon />}
        sidebarIsOpen={open}
        selected={location.pathname.startsWith('/students')}
      />
      <MenuItemLink
        to="/teachers"
        primaryText={translate('resources.teachers.name')}
        leftIcon={<PeopleIcon />}
        sidebarIsOpen={open}
        selected={location.pathname.startsWith('/teachers')}
      />

      <h4 style={{ padding: '0 1em', marginTop: '1em' }}>
        {translate('menu.lessons')}
      </h4>
      <MenuItemLink
        to="/tariffs"
        primaryText={translate('resources.tariffs.name')}
        leftIcon={<BookIcon />}
        sidebarIsOpen={open}
        selected={location.pathname.startsWith('/tariffs')}
      />

      <h4 style={{ padding: '0 1em', marginTop: '1em' }}>
        {translate('menu.settings')}
      </h4>
      <MenuItemLink
        to="/settings"
        primaryText={translate('menu.settings')}
        leftIcon={<SettingsIcon />}
        sidebarIsOpen={open}
        selected={location.pathname.startsWith('/settings')}
      />
      <MenuItemLink
        to="/calendar"
        primaryText="Календарь"
        leftIcon={<EventIcon />}
        sidebarIsOpen={open}
        selected={location.pathname.startsWith('/calendar')}
        />
    </Menu>
  );
};

export default CustomMenu;
