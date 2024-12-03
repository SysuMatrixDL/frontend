import { Button, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useNavigate } from "react-router";

export default function RegisterWindow() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  let navigate = useNavigate();

  const handleSubmit = async (values: Record<string, any>) => {  
    setLoading(true);
    
    if(values['password'] != values['password2']){
      // 我不喜欢输错了就清空,还要重输蛮烦的
      // form.initialize({
      //   username: values['username'],
      //   password: '',
      //   password2: '',
      // });
      setLoading(false);
      setError('Two passwords are not the same');
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      });

      // if (!response.ok) {
      //   throw new Error('Register failed');
      // }
      // // backend should response header with SetCookie
      // const cookies = JSON.parse(document.cookie);
      // const username = cookies['username'];
      // const user_token = cookies['user_token'];
      // if(!username || !user_token){
      //   throw new Error('Failed to store cookies');
      // }
      // // otherwise frontend set cookie here
      const username = values['username'];
      const user_token = values['password'];
      const expires = new Date(Date.now() + 7 * 864e5).toUTCString(); // 7 天有效期
      document.cookie = `username=${encodeURIComponent(username)}; expires=${expires}; path=/; SameSite=Lax`;
      document.cookie = `user_token=${encodeURIComponent(user_token)}; expires=${expires}; path=/; SameSite=Lax`;
      navigate('/login');

    } catch (err : any) {
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
    <div className='row-start-2'>
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <TextInput
          size="xl"
          withAsterisk
          label="Username"
          placeholder="your username"
          key={form.key('username')}
          {...form.getInputProps('username')}
        />
        <TextInput
          size="xl"
          withAsterisk
          label="Password"
          placeholder="your password"
          key={form.key('password')}
          {...form.getInputProps('password')}
        />
        <TextInput
          size="xl"
          withAsterisk
          label="Confirm Password"
          placeholder="your password"
          key={form.key('password2')}
          {...form.getInputProps('password2')}
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