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

// register new user
export async function registerUser(person) {
    const body = mapToBackend(person);
    const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthToken()},
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        throw new Error("Failed to register");
    }
    const data = await res.json();
    return mapFromBackend(data);
}

// delete user
export async function deleteUser(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
        ...getAuthToken()},
    });
    if (!res.ok) {
        throw new Error("Failed to delete user");
    }
}

// update user
export async function updateUser(id, person) {
    const body = mapToBackend(person);
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthToken()},
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        throw new Error("Failed to update user");
    }
}

// get user by id
export async function getUserById(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "GET",
        headers: {
        ...getAuthToken()},
    });
    if (!res.ok) {
        throw new Error("Failed to fetch user");
    }
    const data = await res.json();
    return mapFromBackend(data);
}