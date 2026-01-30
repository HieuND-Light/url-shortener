'use client'; 

import { useState, useEffect } from 'react';
import Image from 'next/image'; 
import { Inter } from 'next/font/google'; 
import { MdContentCopy, MdRefresh } from 'react-icons/md'; 
import { MdClose, MdLanguage } from 'react-icons/md'; 
import { QRCodeCanvas } from 'qrcode.react'; 
import "reflect-metadata";
import { useLanguage } from '../context/LanguageContext';
import { useRef } from "react";

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const { t, setLocale } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  
  useEffect(() => {
    document.title = t.tabTitle;
  }, [t.tabTitle]);

  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [clicks, setClicks] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);

  const handleShorten = async () => {
    setError(null);
    setLoading(true);
    setShortUrl('');
    setQrCodeDataUrl('');
    setClicks(null);
    setCopySuccess(false);

    try {
      if (!longUrl || longUrl.trim() === '') {
          throw new Error('URL dài không được để trống.');
        }
      let formattedLongUrl = longUrl;
      if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
        formattedLongUrl = `https://${longUrl}`;
      }
      const parsedUrl = new URL(formattedLongUrl);
      const isNumeric = /^\d+(\.\d+)*$/.test(parsedUrl.hostname);
      if (!parsedUrl.hostname.includes('.') || isNumeric) {
        throw new Error("URL không hợp lệ.");
      }

      const response = await fetch('/api/shorten', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl: formattedLongUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi rút gọn URL.');
      }

      const data = await response.json();
      setShortUrl(data.shortUrl);
      setQrCodeDataUrl(data.qrCode); 
      setClicks(data.clicks);

    } catch (err: any) {
      setError(err.message || t.commonerr);
      console.error('Lỗi: ', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshCount = async () => {
    if (isCooldown) return;
    console.log("Refreshing counts...");

    setIsCooldown(true);

    setTimeout(() => {
      setIsCooldown(false);
    }, 5000);
    
    setError(null);
    setClicks(null);

    try {
      const response = await fetch('/api/refresh', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shortUrl: shortUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi check code.');
      }

      const data = await response.json();
      setClicks(data.clicks);

    } catch (err: any) {
      setError(err.message || t.commonerr );
      console.error('Lỗi: ', err);
    } finally {

    }
  };

  const copyToClipboard = () => {
    if (shortUrl) {
      const el = document.createElement('textarea');
      el.value = shortUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); 
    }
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const downloadImage = () => {
    const originalCanvas = canvasRef.current;
    if (!originalCanvas) return;

    const padding = 20; 
    const backgroundColor = "#ffffff";

    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");

    tempCanvas.width = originalCanvas.width + padding * 2;
    tempCanvas.height = originalCanvas.height + padding * 2;

    if (ctx) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      ctx.drawImage(originalCanvas, padding, padding);

      const image = tempCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "my-generated-qr.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-red-400 p-4 ${inter.className}`}>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6 transform transition-all duration-300 hover:scale-105">

        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6 drop-shadow-sm">{t.main_title}</h1>
        <div className="space-y-4">
          <input
            type="text"
            className="w-full p-4 border border-gray-300 rounded-lg text-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder={t.placeholder}
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleShorten();
              }
            }}
          />
          <button
            onClick={handleShorten}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-xl hover:bg-blue-700 transition duration-300 transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              t.main_button
            )}
          </button>
        </div>

        {error && (
          <p className="text-red-600 bg-red-100 p-3 rounded-lg text-center font-medium border border-red-300 animate-fade-in">
            {error}
          </p>
        )}

        {shortUrl && (
          <div className="bg-blue-50 p-6 rounded-lg shadow-inner space-y-4 animate-fade-in">
            <h2 className="text-2xl font-semibold text-blue-800 text-center">{t.announce}</h2>
            <div className="flex items-center justify-between bg-white border border-blue-200 rounded-lg p-3 group">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-lg font-medium truncate hover:underline flex-grow"
              >
                {shortUrl}
              </a>
              <button
                onClick={copyToClipboard}
                className="ml-4 p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group-hover:scale-105"
                title="Copy link"
              >
                <MdContentCopy size={24} />
              </button>
            </div>
            {copySuccess && (
              <p className="text-green-600 text-center font-medium animate-fade-in">{t.copy}</p>
            )}

            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-between">
              <p className="text-gray-700 text-lg">
                {t.clickcount} <span className="font-bold text-xl text-blue-800">{clicks}</span>
              </p>
              <button
                onClick={refreshCount}
                className={`ml-4 p-2 rounded-lg transition duration-200 shadow-md
                  ${isCooldown 
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-blue-600 text-white hover:bg-white hover:outline hover:text-blue-600 active:bg-red-700'
                  }
                  `}
                title={isCooldown ? "Please wait..." : "Refresh"}
              >
                <MdRefresh size={24} />
              </button>
              </div>
              {shortUrl && ( 
                <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-md border border-gray-200">
                  {}
                  <QRCodeCanvas value={shortUrl} size={180} level="H" includeMargin={false} className="mx-auto" ref={canvasRef}/>
                  <p className="text-center text-sm text-gray-500 mt-2">{t.qrhelper}</p>
                  <button
                    onClick={downloadImage}
                    className='mt-2 p-1 rounded-lg transition duration-200 shadow-md bg-blue-600 text-white'
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="fixed bottom-0 right-0 m-4 z-50">
        {showMenu && (
          <div className="relative">
            <div className="absolute bottom-[+20px] right-0 w-32 bg-gray-800 rounded-lg shadow-lg p-2 text-white">
              <ul className="list-none p-0 m-0">
                <li 
                  className="p-2 cursor-pointer hover:bg-gray-700 rounded-md" 
                  onClick={() => { setLocale('vi'); setShowMenu(false); }}
                >
                  Tiếng Việt
                </li>
                <li 
                  className="p-2 cursor-pointer hover:bg-gray-700 rounded-md" 
                  onClick={() => { setLocale('en'); setShowMenu(false); }}
                >
                  English
                </li>
              </ul>
              <div className="absolute bottom-[-6px] right-[+14px] h-3 w-3 rotate-45 transform bg-gray-800"></div>
            </div>
          </div>
        )}
      <button onClick={() => setShowMenu(!showMenu)}
      // className="absolute bottom-0 right-0 flex m-4 rounded-lg px-2 py-2 text-sm font-semibold text-white bg-red-600 hover:border-transparent hover:bg-white hover:text-red-600 active:bg-red-700 active:text-white"
      className="flex rounded-full p-2 text-sm font-semibold text-white bg-red-600 hover:bg-white hover:text-red-600 transition-colors duration-200 active:bg-red-700 active:text-white"
      >
        {showMenu ? <MdClose size={24} /> : < MdLanguage size={24} />}
      </button>
      </div>
    </div>
  );
}