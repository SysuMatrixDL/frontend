import { Tabs, rem } from '@mantine/core';
import { IconPackage, IconSettings, IconBrandDocker } from '@tabler/icons-react';
import Containers from './containers';
import Images from './images';

export default function Console() {
  const iconStyle = { width: rem(24), height: rem(24) };

  return (
    <Tabs defaultValue="Containers">
      <Tabs.List grow={true}>
        {/* <Tabs.Tab value="Dashboard" leftSection={<IconGauge style={iconStyle} stroke={1}/>}>
          DashBoard
        </Tabs.Tab> */}
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

      {/* <Tabs.Panel value="Dashboard">
        <Dashboard/>
      </Tabs.Panel> */}

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