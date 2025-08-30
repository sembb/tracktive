export async function fetchUserFromServer(mediaid: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
    const query = new URLSearchParams();
    if (mediaid) query.append('mediaid', mediaid);
    console.log('Fetching user from:', apiUrl);
    if(localStorage.getItem('auth_token')){
        try {
            const res = await fetch(`${apiUrl}/api/user?${query.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
            });
        

            if (!res.ok) {
                // Probeer een error message van de backend mee te lezen
                const errorText = await res.text();
                console.error(`Fetch error: ${res.status} ${res.statusText} - ${errorText}`);
                // Je kunt hier ook een error object of string teruggeven:
                return false;
            }

            const user = await res.json();
            return user;
        } catch (error) {
            console.error('Failed to fetch user:', error);
            // Geef het error object ook terug, in plaats van alleen null
            return false;
        }
    }return false;
}