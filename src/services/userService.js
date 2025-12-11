const API_BASE = "http://localhost:9090/api/person";

function getAuthToken() {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}`} : {};
}

// from backend to frontend
export function mapFromBackend(apiPerson) {
    return {
        id: apiPerson.id,
        name: apiPerson.name,
        email: apiPerson.email,
    };
}

// from frontend to backend
export function mapToBackend(person) {
    return {
        name: person.name,
        username: person.username,
        email: person.email,
        password: person.password,
    };
}

// get all users
export async function getAllUsers() {
    const res = await fetch(API_BASE, {
        method: "GET",
        headers: {
            ...getAuthToken()},
    });
    if (!res.ok) {
        throw new Error("Failed to fetch users");
    }
    const data = await res.json();
    return data.map(mapFromBackend);
}