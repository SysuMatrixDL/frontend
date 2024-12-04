import { Outlet } from "react-router";
import { AppShell, Burger, LoadingOverlay, NavLink } from '@mantine/core';
import { IconChevronRight, IconFingerprint, IconGauge, IconActivity } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useLocation } from 'react-router'
import { useState } from 'react';

const naviLinkHrefs = [
  '/console',
  '/market',
  '/community'
]

const naviIndex: {
  [key: string]: number;
} = {
  '/console' : 0,
  '/market' : 1,
  '/community' : 2
}

export default function Navi() {
  const [opened, { toggle: openedToggle }] = useDisclosure();
  const [loading, { toggle: loadingToggle }] = useDisclosure(false);
  const activeIndex = naviIndex[useLocation().pathname];

  const sideBarMenu = [
    {
      icon: IconGauge,
      label: 'Console',
      description: 'Item with description'
    },{
      icon: IconFingerprint,
      label: 'Market',
      rightSection: <IconChevronRight size="1rem" stroke={1.5} />,
    },{
      icon: IconActivity,
      label: 'Community'
    },
  ];

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: {
          mobile: opened,
          desktop: opened
        },
      }}
      padding="md"
    >
      <AppShell.Header>
        <div className="m-3 flex flex-row gap-3 items-center">
          <Burger
            opened={!opened}
            onClick={openedToggle}
          />
          <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
            <a href="#">
            <img src="/logo-dark.svg" width="300" height="47" alt="logo" className="navbar-brand-image" />
            </a>
          </h1>
        </div>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {sideBarMenu.map((item, index) => (
          <NavLink
            href={naviLinkHrefs[index]}
            key={item.label}
            active={index === activeIndex}
            label={item.label}
            description={item.description}
            rightSection={item.rightSection}
            leftSection={<item.icon size="1rem" stroke={1.5} />}
            onClick={loadingToggle}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <Outlet/>
      </AppShell.Main>
      
    </AppShell>
  );
}
