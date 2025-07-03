"use client";

import React, { useState, useRef, useEffect } from 'react';


export default function ProfileDropdown({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref]);

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-10 flex items-center p-2 text-sm text-gray-600 bg-white border border-transparent rounded-md focus:border-blue-500 focus:ring focus:ring-blue-300 dark:focus:ring-blue-400 focus:ring-opacity-40 dark:focus:ring-opacity-40 dark:text-white dark:bg-gray-800 focus:outline-none"
      >
        <span className="mx-1">{user.name}</span>
        <svg className="w-5 h-5 mx-1" viewBox="0 0 24 24" fill="none">
          <path d="M12 15.713L18.01 9.70299L16.597 8.28799L12 12.888L7.40399 8.28799L5.98999 9.70199L12 15.713Z" fill="currentColor" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute right-0 z-20 w-56 py-2 mt-2 overflow-hidden origin-top-right bg-white rounded-md shadow-xl dark:bg-gray-800 transition ease-out duration-100 transform opacity-100 scale-100"
        >
          <a href="#" className="flex items-center p-3 -mt-2 text-sm text-gray-600 transition-colors duration-300 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
            <img className="flex-shrink-0 object-cover mx-1 rounded-full w-9 h-9" src="https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=face&w=500&q=200" alt="jane avatar" />
            <div className="mx-1">
              <h1 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Jane Doe</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">janedoe@exampl.com</p>
            </div>
          </a>

          <hr className="border-gray-200 dark:border-gray-700" />

          <MenuItem iconPath="M7 8C7 5.23858 …" label="view profile" />
          <MenuItem iconPath="M13.8199 22H10.…" label="Settings" />
          <MenuItem iconPath="M21 19H3C1.89543 …" label="Keyboard shortcuts" />
          <MenuItem iconPath="M18 22C15.8082 …" label="Company profile" />
          <MenuItem iconPath="M9 3C6.23858 3 …" label="Team" />
          <MenuItem iconPath="M4 19H2C2 15.6863 …" label="Invite colleagues" />

          <hr className="border-gray-200 dark:border-gray-700" />

          <MenuItem iconPath="M12 22C6.47967 …" label="Help" />
          <MenuItem iconPath="M19 21H10C8.89543 …" label="Sign Out" />
        </div>
      )}
    </div>
  );
}

function MenuItem({ iconPath, label }) {
  return (
    <a href="#" className="flex items-center p-3 text-sm text-gray-600 capitalize transition-colors duration-300 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
      <svg className="w-5 h-5 mx-1" viewBox="0 0 24 24" fill="none">
        <path d={iconPath} fill="currentColor" />
      </svg>
      <span className="mx-1">{label}</span>
    </a>
  );
}
