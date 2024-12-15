import { Button, Group, LoadingOverlay, PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { useNavigate } from "react-router";

export default function RegisterWindow() {
  let navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, { toggle: loadingToggle }] = useDisclosure(false);

  const handleSubmit = async (values: Record<string, any>) => {
    setError('');
    
    if(values['password'] != values['password2']){
      // 我不喜欢输错了就清空,还要重输蛮烦的
      // form.initialize({
      //   username: values['username'],
      //   password: '',
      //   password2: '',
      // });
      setError('Two passwords are not the same');
      return;
    }

    var body = {
      username : values['username'],
      password : values['password'],
      email: values['email']
    }

    try {
      const response = await fetch('/api/register', {
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
          console.log(response.body)
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

      loadingToggle();
      navigate('/login');
    } catch (err : any) {
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
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <TextInput
          size="xl"
          withAsterisk
          label="Username"
          placeholder="your username"
          key={form.key('username')}
          {...form.getInputProps('username')}
        />
        <PasswordInput
          size="xl"
          withAsterisk
          label="Password"
          placeholder="your password"
          key={form.key('password')}
          {...form.getInputProps('password')}
        />
        <PasswordInput
          size="xl"
          withAsterisk
          label="Confirm Password"
          placeholder="your password"
          key={form.key('password2')}
          {...form.getInputProps('password2')}
        />
        <TextInput
          size="xl"
          withAsterisk
          label="Email"
          placeholder="your email"
          key={form.key('email')}
          {...form.getInputProps('email')}
        />

        {/* <Checkbox
          mt="md"
          label="I agree to sell my privacy"
          key={form.key('termsOfService')}
          {...form.getInputProps('termsOfService', { type: 'checkbox' })}
        /> */}

        <Group justify="flex-end" mt="md">
          <Button type="submit" fullWidth>Register</Button>
          <Button fullWidth onClick={() => {return navigate('/login')}}>Already have an account? Click to login</Button>
        </Group>
      </form>
      {error && <div className='text-red-600 text-15 text-center mt-5'>{error}</div>}
    </div>
  );
}