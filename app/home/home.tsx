import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import { Welcome } from "./welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sysu Matrix DL" },
    { name: "description", content: "A Cloud Computing Platform for Deep Learning" },
  ];
}

function getCookie(name: string): string | null {
  const match: RegExpMatchArray | null = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function Home() {
  const username = getCookie('username');
  const user_token = getCookie('user_token');
  let navigate = useNavigate();

  const loginWithToken = async (username: string, user_token: string) => {
    const body = {
      username: username,
      user_token: user_token
    };
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      // TODO backend
      // if (!response.ok) {
      //   throw new Error('Login failed');
      // }
  
    } catch (err : any) {
      navigate('/login');
    }
  };
  
  if(username == null || user_token == null){
    navigate('/login');
  } else {
    loginWithToken(username, user_token);
  }
  return <Welcome />;
}
