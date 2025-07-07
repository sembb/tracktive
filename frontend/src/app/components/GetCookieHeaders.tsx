import React from 'react'
import { cookies } from 'next/headers';

export default function GetCookieHeaders() {
    const cookieStore = cookies();
    const cookieHeader = cookieStore.get('auth_token')?.value;
    return cookieHeader;
}
