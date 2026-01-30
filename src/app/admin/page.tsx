'use client'; 

import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google'; 
import { MdClose, MdLanguage } from 'react-icons/md'; 
import "reflect-metadata";
import { useLanguage } from '@/context/LanguageContext';
import { MdRefresh } from 'react-icons/md';
import { getAllLinks } from '@/app/api/links/link';

const inter = Inter({ subsets: ['latin'] });

interface LinkData {
  id: number;
  long_url: string;
  short_code: string;
  clicks: number;
  created_at: Date | string;
}

export default function Admin() {
  const { t, setLocale } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  
  useEffect(() => {
    document.title = t.tabTitle;
  }, [t.tabTitle]);

  const [adminKey, setAdminKey] = useState('');
  const [links, setLinks] = useState<LinkData[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllLinks();
      if (result.success) {
        setLinks(result.data || []);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      throw new Error(err.message || "Failed to get data");
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!adminKey || adminKey.trim() === '') {
          throw new Error('Admin key không được để trống.');
        }

    //   const response = await fetch('/api/adminlogin', { 
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ adminKey: adminKey }),
    //   });

    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.message || 'Lỗi khi login.');
    //   }

    //   const data = await response.json();
    //   if (data) setIsLoggedin(true);

      if (adminKey === 'test123') {
        const result = await getAllLinks();
        if (result.success) {
          setLinks(result.data || []);
          setIsLoggedin(true);
        } else {
          throw new Error(result.error);
        }
      } else {
        throw new Error("Invalid Key");
      }

    } catch (err: any) {
      setError(err.message || t.commonerr);
      console.error('Lỗi: ', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (short_code: string) => {
  if (!confirm(`Are you sure you want to delete /${short_code}?`)) return;

  try {
    setLoading(true);
    const response = await fetch('/api/delete', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ short_code: short_code }),
    });

    if (response.ok) {
      const result = await getAllLinks();
      if (result.success) {
        setLinks(result.data || []);
      }
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
  } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting.");
    } finally {
      setLoading(false);
    }
  };

  const filteredLinks = links.filter((link) =>
    link.long_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-red-400 p-4 ${inter.className}`}>
      {!isLoggedin && (
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6 transform transition-all duration-300 hover:scale-105">

        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6 drop-shadow-sm">Admin Page</h1>
        <div className="space-y-4">
          <input
            type="password"
            className="w-full p-4 border border-gray-300 rounded-lg text-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Admin Key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                login();
              }
            }}
          />
          <button
            onClick={login}
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

          {error && (
            <p className="text-red-600 bg-red-100 p-3 rounded-lg text-center font-medium border border-red-300 animate-fade-in">
                {error}
            </p>
          )}
          <p className="text-red-600 bg-red-100 p-3 rounded-lg text-center font-medium border border-red-300 animate-fade-in">
              Currently not logged in.
          </p>
        </div>
      </div>
      )}
      {isLoggedin && (
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-7xl space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6 drop-shadow-sm">Link Management</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                <MdRefresh 
                  size={20} 
                  className={`${loading ? 'animate-spin' : ''}`} 
                />
                Refresh
              </button>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                Admin Active
              </span>
            </div>
          </div>
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search Long URLs..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <MdClose size={18} />
              </button>
            )}
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-black">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Long URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Short URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLinks.length > 0 ? (
                  filteredLinks.map((link, index) => (
                    <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{index + 1}</td>
                      <td className="px-6 py-4 text-sm truncate max-w-xs" title={link.long_url}>{link.long_url}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">{link.short_code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{link.clicks}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(link.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleDelete(link.short_code)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                          title="Delete Link"
                        >
                          <MdClose size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">
                      {searchQuery ? `No URLs found matching "${searchQuery}"` : "No data available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Language Selector */}
      {/* <div className="fixed bottom-0 right-0 m-4 z-50">
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
        className="flex rounded-full p-2 text-sm font-semibold text-white bg-red-600 hover:bg-white hover:text-red-600 transition-colors duration-200 active:bg-red-700 active:text-white"
        >
          {showMenu ? <MdClose size={24} /> : < MdLanguage size={24} />}
        </button>
      </div> */}
    </div>
  );
}