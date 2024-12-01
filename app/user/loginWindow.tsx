import { Button, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useNavigate } from "react-router";

export default function LoginWindow() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  let navigate = useNavigate();

  const handleSubmit = async (values: Record<string, any>) => {  
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      });

      // if (!response.ok) {
      //   throw new Error('Login failed');
      // }
      // const data = await response.json();

      navigate('/');
    } catch (err) {
      console.log(error);
      // setError(err.message);
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
        <Button type="submit">Login</Button>
      </Group>
    </form>
  );
}