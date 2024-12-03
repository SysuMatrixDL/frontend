import { Button, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useNavigate } from "react-router";

const BACKEND_AFFIX = process.env.BACKEND_AFFIX;

export default function LoginWindow() {
  let navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Record<string, any>) => {  
    setLoading(true);
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
        throw new Error('Login failed');
      }

      navigate('/console');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
  );
}