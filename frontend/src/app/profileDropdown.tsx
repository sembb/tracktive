"use client";

import { useAuth } from '../../lib/stores/user'
import React, { useState, useRef, useEffect } from 'react';
import useLogout from '../../lib/logout';
import { useLoadUser } from '../../lib/hooks/useLoadUser';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  ArchiveBoxXMarkIcon,
  ChevronDownIcon,
  PencilIcon,
  Square2StackIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'
import { useRouter } from 'next/navigation'


export default function ProfileDropdown({ cookieHeader }: { cookieHeader?: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const logout = useLogout(cookieHeader ? `auth_token=${cookieHeader}` : '')

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

  useLoadUser(cookieHeader);

  const user = useAuth((state) => state.user);
  if(user){
    console.log(user.profile?.avatar_url);
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
  return (
    <Menu>
      <MenuButton className="border-white/10 border-solid border inline-flex items-center gap-2 rounded-md bg-slygray px-3 py-1.5 text-sm/6 font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/10 data-open:bg-white/10">
        {user ? <p>Welcome {user.name}</p> : <p>Please log in</p>}
        <ChevronDownIcon className="size-4 fill-white/60" />
      </MenuButton>

      {user && (

        <MenuItems
          transition
          anchor="bottom end"
          className="w-52 origin-top-right rounded-xl border border-white/5 bg-white/5 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
        >
          <MenuItem>
            <button onClick={() => router.push(`/user/${user.name}`)} className="flex items-center">
              <Image className='flex-shrink-0 object-cover mx-1 rounded-full w-9 h-9' src={user.profile?.avatar_url ? `${apiUrl}/storage/${user.profile?.avatar_url}` : '/images/dummy.png'} width={50} height={50} alt='profile picture'></Image>
              <div className="mx-1">
                <h1 className="text-sm font-semibold text-gray-700 dark:text-gray-200 text-left">{user.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </button>
          </MenuItem>
          <MenuItem>
            <button onClick={() => router.push('/profile')} className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
              <PencilIcon className="size-4 fill-white/30" />
              Profile
              <kbd className="ml-auto hidden font-sans text-xs text-white/50 group-data-focus:inline">⌘E</kbd>
            </button>
          </MenuItem>
          <MenuItem>
            <button onClick={() => router.push('/settings')} className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
              <Square2StackIcon className="size-4 fill-white/30" />
              Settings
              <kbd className="ml-auto hidden font-sans text-xs text-white/50 group-data-focus:inline">⌘D</kbd>
            </button>
          </MenuItem>
          <div className="my-1 h-px bg-white/5" />
          <MenuItem>
            <button onClick={logout} className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
              <TrashIcon className="size-4 fill-white/30" />
              Logout
              <kbd className="ml-auto hidden font-sans text-xs text-white/50 group-data-focus:inline">⌘D</kbd>
            </button>
          </MenuItem>
        </MenuItems>

      )}
    </Menu>
  );
}