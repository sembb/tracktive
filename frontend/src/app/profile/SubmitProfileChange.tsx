'use client';

import React, {RefObject} from 'react'
import { useCsrfFetch } from '../../../lib/hooks/useCsrfFetch';

type Props = {
  formRef: RefObject<HTMLFormElement>;
};

export default function SubmitProfileChange({ formRef }: Props) {
    const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
    console.log('API URL:', apiUrl); // Debugging output

    const { csrfFetch, loading } = useCsrfFetch();

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const form = formRef.current;
        if (!form) {
            console.error('Form not found');
            return;
        }

        const formData = new FormData(form);
        
        const res = await fetch(`${apiUrl}/api/profiles`, {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
        });

        if (res.ok) {
            const data = await res.json();
            // Hier kan je token opslaan of user status bijhouden
            console.log('profile update gelukt')
        } else {
            console.log('profile update mislukt')
        }
    };

  return (
    <button onClick={handleSubmit} type="submit" name="submitButton" className="btn btn-primary">
        Submit
    </button>
  )
}