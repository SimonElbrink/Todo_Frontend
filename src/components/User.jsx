import {useEffect, useState, useRef} from "react";
import {getAllUsers} from "../services/userService.js";


const User = () => {

    const [user, setUser] = useState([]);
    const [formData, setFormData] = useState({name: '', username: '', password: '', email: '', confirmPassword: ''});

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getAllUsers();
                setUser(data);
            } catch (err) {
                console.log("Failed to load users", err);
            }
        }
            fetchData();

    }, []);

    return (
        <div>User</div>
    )
}