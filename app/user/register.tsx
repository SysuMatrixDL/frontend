import logoDark from "/logo-dark.svg";
import logoLight from "/logo-white.svg";
import RegisterWindow from './registerWindow';
import { useEffect, useState } from "react";

const images = [
  '/pic1.jpg',
  '/pic2.jpg',
  '/pic3.jpg'
];

export default function Register() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [clipPathValues, setClipPathValues] = useState({
    clip0: '',
    clip1: '',
    clip2: ''
  });

  const updateClipPath = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const clip0 = `path("M0,0 L${width * 0.3},0 Q${width * 0.5},${height * 0.5} ${width * 0.3},${height} L0,${height} L0,0 Z")`;
    const clip1 = `path("M0,0 L${width * 0.3 + 20},0 Q${width * 0.5},${height * 0.5} ${width * 0.3 + 20},${height} L0,${height} L0,0 Z")`;
    const clip2 = `path("M0,0 L${width * 0.3 + 40},0 Q${width * 0.5},${height * 0.5} ${width * 0.3 + 40},${height} L0,${height} L0,0 Z")`;

    setClipPathValues({
      clip0,
      clip1,
      clip2
    });
  };

  useEffect(() => {
    updateClipPath();
    window.addEventListener('resize', updateClipPath);
    return () => {
      window.removeEventListener('resize', updateClipPath);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // 每4秒切换一次图片

    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-blue-100 flex">
      {/* 左侧圆弧展示区 */}
      <div className="w-1/2 relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-300" style={{ clipPath: clipPathValues.clip2, overflow: 'hidden'}}/>
        <div className="absolute inset-0 bg-blue-500" style={{ clipPath: clipPathValues.clip1, overflow: 'hidden'}}/>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="carousel w-full h-full" style={{ clipPath: clipPathValues.clip0, overflow: 'hidden'}}>
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Slide ${index + 1}`}
                className={`transition-opacity duration-1000 absolute w-full h-auto ${currentImageIndex === index ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 右侧登录窗口 */}
      <div className="w-1/2 flex flex-col items-center justify-center p-8">
        <header className="flex flex-col items-center mb-8">
          <div className="w-[500px] max-w-[100vw]">
            <img src={logoDark} alt="Matrix DL" className="hidden w-full dark:block" />
            <img src={logoLight} alt="Matrix DL" className="block w-full dark:hidden" />
          </div>
        </header>
        <RegisterWindow />
        <footer className="flex gap-6 flex-wrap items-center justify-center mt-8">
          {/* TODO */}
        </footer>
      </div>
    </div>
  );
}
