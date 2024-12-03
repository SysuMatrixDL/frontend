import { Button, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useNavigate } from "react-router";

const BACKEND_AFFIX =  import.meta.env.BACKEND_AFFIX;

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

    var body = {
      username : values['username'],
      password : values['password'],
      email: values['email']
    }

    try {
      const response = await fetch(BACKEND_AFFIX + '/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify(body),
        credentials: 'include'
      });
      console.log("debug")

      if (!response.ok) {
        throw new Error('Register failed');
      }

      navigate('/login');

    } catch (err : any) {
      setError(err.error);
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