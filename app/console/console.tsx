import { Tabs, rem, AppShell, Burger, NavLink } from '@mantine/core';
import { IconPackage, IconSettings, IconBrandDocker, IconChevronRight, IconFingerprint, IconGauge, IconActivity } from '@tabler/icons-react';
import Containers from './containers';
import Images from './images';
import Dashboard from './dashboard';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

export default function Console() {
  const iconStyle = { width: rem(24), height: rem(24) };

  return (
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
  );
}