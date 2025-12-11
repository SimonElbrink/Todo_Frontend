import {useState} from "react";


const User = () => {

    const [user, setUser] = useState([]);
    const [formData, setFormData] = useState({name: '', username: '', password: '', email: '', confirmPassword: ''});

    return (
        <div>User</div>
    )
}