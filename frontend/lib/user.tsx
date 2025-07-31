export async function fetchUserFromServer(cookieHeader?: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
    console.log('Fetching user from:', apiUrl);
    console.log('Using cookie header:', cookieHeader);
    if(cookieHeader){
        try {
            const res = await fetch(`${apiUrl}/api/user`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(cookieHeader ? { cookieHeader } : {}),
            },
            });
        

            if (!res.ok) {
                // Probeer een error message van de backend mee te lezen
                const errorText = await res.text();
                console.error(`Fetch error: ${res.status} ${res.statusText} - ${errorText}`);
                // Je kunt hier ook een error object of string teruggeven:
                return { error: true, status: res.status, message: errorText || res.statusText };
            }

            const user = await res.json();
            return user;
        } catch (error) {
            console.error('Failed to fetch user:', error);
            // Geef het error object ook terug, in plaats van alleen null
            return { error: true, message: (error as Error).message || 'Unknown error' };
        }
    }return('No cookie header found' );
}