import { Tabs, rem, AppShell, Burger, NavLink } from '@mantine/core';
import { IconPackage, IconSettings, IconBrandDocker, IconChevronRight, IconFingerprint, IconGauge, IconActivity } from '@tabler/icons-react';
import Containers from './containers';
import Images from './images';
import Dashboard from './dashboard';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

export default function Console() {
  const iconStyle = { width: rem(24), height: rem(24) };
  const [opened, { toggle }] = useDisclosure();
  const [active, setActive] = useState(0);
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
            onClick={toggle}
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
              href="#required-for-focus"
              key={item.label}
              active={index === active}
              label={item.label}
              description={item.description}
              rightSection={item.rightSection}
              leftSection={<item.icon size="1rem" stroke={1.5} />}
              onClick={() => setActive(index)}
            />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Tabs defaultValue="Dashboard">
          <Tabs.List>
            <Tabs.Tab value="Dashboard" leftSection={<IconGauge style={iconStyle} stroke={1}/>}>
              DashBoard
            </Tabs.Tab>
            <Tabs.Tab value="Containers" leftSection={<IconBrandDocker style={iconStyle} stroke={1}/>}>
              Containers
            </Tabs.Tab>
            <Tabs.Tab value="Images" leftSection={<IconPackage style={iconStyle} stroke={1}/>}>
              Images
            </Tabs.Tab>
            <Tabs.Tab value="Settings" leftSection={<IconSettings style={iconStyle} stroke={1}/>}>
              Settings
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="Dashboard">
            <Dashboard/>
          </Tabs.Panel>

          <Tabs.Panel value="Containers">
            <Containers/>
          </Tabs.Panel>

          <Tabs.Panel value="Images">
            <Images/>
          </Tabs.Panel>

          <Tabs.Panel value="Settings">
            TODO
          </Tabs.Panel>
        </Tabs>
      </AppShell.Main>
    </AppShell>
  );
}