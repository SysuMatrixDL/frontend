import { Outlet, useNavigate } from "react-router";
import { AppShell, Burger, LoadingOverlay, NavLink } from '@mantine/core';
import { IconChevronRight, IconFingerprint, IconGauge, IconActivity, IconFlame, IconUsersGroup } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useLocation } from 'react-router'
import { useEffect, useState } from 'react';
import UserMenuButton from "./user/userMenuButton";
import { parseBody } from "./common/parseBody";

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
  const [click_disable, setClickDisable] = useState<boolean>(true);
  const [username, setUserName] = useState<string>('?');
  const [opened, { toggle: openedToggle }] = useDisclosure();
  const [loading, setLoadingToggle] = useState(true);
  const activeIndex = naviIndex[useLocation().pathname];
  let navigate = useNavigate();

  const verifyLogin = async () => {
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      if(response.status != 200){
        console.error('Not login!');
        throw new Error('Not login!');
      }

      let parsedResult : {username: string} = JSON.parse(await parseBody(response));
      setUserName(parsedResult.username);
    } catch {
      setLoadingToggle(true);
      navigate('/login');
    }
  };

  useEffect( () => {
    verifyLogin();
    setTimeout(() => {
      setClickDisable(false);
      setLoadingToggle(false);
    }, 500);
  }, []);

  const sideBarMenu = [
    {
      icon: IconGauge,
      label: 'Console',
      description: '用户控制台',
      rightSection: <IconChevronRight size="1rem" stroke={1.5} />,
    },{
      icon: IconFlame,
      label: 'Market',
      description: '算力市场',
      rightSection: <IconChevronRight size="1rem" stroke={1.5} />,
    },{
      icon: IconUsersGroup,
      label: 'Community',
      description: '镜像社区',
      rightSection: <IconChevronRight size="1rem" stroke={1.5} />,
    },
  ];

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 200,
        breakpoint: 'sm',
        collapsed: {
          mobile: opened,
          desktop: opened
        },
      }}
      padding="md"
    >
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <AppShell.Header>
        <div className="flex flex-row gap-3 items-center">
          <Burger
            opened={!opened}
            onClick={openedToggle}
          />
          <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
            <a href="#">
            <img src="/logo-dark.svg" width="300" height="47" alt="logo" className="navbar-brand-image" />
            </a>
          </h1>
          <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal ps-0 ps-md-3 float-right ml-auto">
            <a href="#">
              <UserMenuButton name={username}/>
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
            leftSection={<item.icon size="1.5rem" stroke={1.5} />}
            disabled={click_disable}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet/>
      </AppShell.Main>
      
    </AppShell>
  );
}
