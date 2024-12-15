import { forwardRef } from 'react';
import { IconLogout, IconUser } from '@tabler/icons-react';
import { UnstyledButton, Group, Avatar, Text, Menu, rem } from '@mantine/core';
import { useNavigate } from 'react-router';

interface UserButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  name: string;
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ name, ...others }: UserButtonProps, ref) =>  (
    <UnstyledButton
      ref={ref}
      style={{
        padding: 'var(--mantine-spacing-md)',
        color: 'var(--mantine-color-text)',
        borderRadius: 'var(--mantine-radius-sm)',
      }}
      {...others}
    >
      <Group>
        <Avatar key={name} name={name} color="initials" allowedInitialsColors={['blue', 'red']} radius="xl"/>
      </Group>
    </UnstyledButton>
  )
) as React.ForwardRefExoticComponent<UserButtonProps & React.RefAttributes<HTMLButtonElement>>;

export default function UserMenuBotton({name = '?'}) {
  let navigate = useNavigate();

  const logout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let result = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += decoder.decode(value, { stream: true });
          }
          throw new Error(JSON.parse(result).error);
        } else {
          throw new Error('Login failed');
        }
      }
      navigate('/login')
    } catch (err : any) {
      // TODO
    }
  };
  
  return (
    <Menu withArrow>
      <Menu.Target>
        <UserButton name={name}/>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
        >
          {name}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
          onClick={ logout }
        >
          Log Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}