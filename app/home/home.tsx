import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import logoDark from "/logo-dark.svg";
import logoLight from "/logo-white.svg";
import { Button } from '@mantine/core';

const BACKEND_AFFIX = import.meta.env.BACKEND_AFFIX;

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

  const loginWithToken = async () => {
    try {
      if (!username || !user_token) {
        throw new Error('Login failed');
      }

      const body = {
        username: username,
        user_token: user_token
      };

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
  
    } catch (err : any) {
      navigate('/login');
    }
  };

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
            <img
              src={logoDark}
              alt="Matrix DL"
              className="hidden w-full dark:block"
            />
            <img
              src={logoLight}
              alt="Matrix DL"
              className="block w-full dark:hidden"
            />
          </div>
        </header>
        <div className="max-w-[300px] w-full space-y-6 px-4 flex flex-col items-center">
          <Button fullWidth onClick={loginWithToken}>Login</Button>
          <Button fullWidth onClick={() => {return navigate('/register')}}>Register</Button>
          <nav className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4">
            <p className="leading-6 text-gray-700 dark:text-gray-200 text-center">
              Open Source
            </p>
            <ul>
              {resources.map(({ href, text, icon }) => (
                <li key={href}>
                  <a
                    className="group flex items-center gap-3 self-stretch p-3 leading-normal text-blue-700 hover:underline dark:text-blue-500"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {icon}
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </main>
  )
}

const resources = [
  {
    href: "https://github.com/SysuMatrixDL",
    text: "Gihub Repository",
    icon: (
      <svg 
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="20"
      >
        <path
          d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c0.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"
          p-id="4242"
        />
      </svg>
    ),
  },
  // {
  //   href: "https://rmx.as/discord",
  //   text: "Join Discord",
  //   icon: (
  //     <svg
  //       xmlns="http://www.w3.org/2000/svg"
  //       width="24"
  //       height="20"
  //       viewBox="0 0 24 20"
  //       fill="none"
  //       className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
  //     >
  //       <path
  //         d="M15.0686 1.25995L14.5477 1.17423L14.2913 1.63578C14.1754 1.84439 14.0545 2.08275 13.9422 2.31963C12.6461 2.16488 11.3406 2.16505 10.0445 2.32014C9.92822 2.08178 9.80478 1.84975 9.67412 1.62413L9.41449 1.17584L8.90333 1.25995C7.33547 1.51794 5.80717 1.99419 4.37748 2.66939L4.19 2.75793L4.07461 2.93019C1.23864 7.16437 0.46302 11.3053 0.838165 15.3924L0.868838 15.7266L1.13844 15.9264C2.81818 17.1714 4.68053 18.1233 6.68582 18.719L7.18892 18.8684L7.50166 18.4469C7.96179 17.8268 8.36504 17.1824 8.709 16.4944L8.71099 16.4904C10.8645 17.0471 13.128 17.0485 15.2821 16.4947C15.6261 17.1826 16.0293 17.8269 16.4892 18.4469L16.805 18.8725L17.3116 18.717C19.3056 18.105 21.1876 17.1751 22.8559 15.9238L23.1224 15.724L23.1528 15.3923C23.5873 10.6524 22.3579 6.53306 19.8947 2.90714L19.7759 2.73227L19.5833 2.64518C18.1437 1.99439 16.6386 1.51826 15.0686 1.25995ZM16.6074 10.7755L16.6074 10.7756C16.5934 11.6409 16.0212 12.1444 15.4783 12.1444C14.9297 12.1444 14.3493 11.6173 14.3493 10.7877C14.3493 9.94885 14.9378 9.41192 15.4783 9.41192C16.0471 9.41192 16.6209 9.93851 16.6074 10.7755ZM8.49373 12.1444C7.94513 12.1444 7.36471 11.6173 7.36471 10.7877C7.36471 9.94885 7.95323 9.41192 8.49373 9.41192C9.06038 9.41192 9.63892 9.93712 9.6417 10.7815C9.62517 11.6239 9.05462 12.1444 8.49373 12.1444Z"
  //         strokeWidth="1.5"
  //       />
  //     </svg>
  //   ),
  // },
];
