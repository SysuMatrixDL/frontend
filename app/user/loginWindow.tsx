import { Button, Group, LoadingOverlay, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { useNavigate } from "react-router";

const BACKEND_AFFIX =  import.meta.env.BACKEND_AFFIX;

export default function LoginWindow() {
  let navigate = useNavigate();
  const [error, setError] = useState(null);
  const [visible, { toggle }] = useDisclosure(false);

  const handleSubmit = async (values: Record<string, any>) => {
    setError(null);

    var body = {
      username : values['username'],
      password : values['password']
    }

    try {
      const response = await fetch(BACKEND_AFFIX + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify(body),
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

      toggle();
      navigate('/console');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const form = useForm({
    mode: 'uncontrolled',
    // initialValues: {
    //   email: '',
    //   termsOfService: false,
    // },
    // validate: {
    //   email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    // },
  });

  return (
    <div>
      <LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <TextInput
          withAsterisk
          size="xl"
          label="Username"
          placeholder="your username"
          key={form.key('username')}
          error="wrong password"
          {...form.getInputProps('username')}
        />
        <TextInput
          withAsterisk
          size="xl"
          label="Password"
          placeholder="your password"
          key={form.key('password')}
          error="wrong password"
          {...form.getInputProps('password')}
        />

        {/* <Checkbox
          mt="md"
          label="I agree to sell my privacy"
          key={form.key('termsOfService')}
          {...form.getInputProps('termsOfService', { type: 'checkbox' })}
        /> */}

        <Group justify="flex-end" mt="md">
          <Button type="submit" fullWidth>Login</Button>
          <Button fullWidth onClick={() => {return navigate('/register')}}>Not having an account? Click to register</Button>
        </Group>
      </form>
      {error && <div className='text-red-600 text-15 text-center mt-5'>{error}</div>}
    </div>
  );
}