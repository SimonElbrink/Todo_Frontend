import React, {useEffect, useState} from "react";
import {deleteUser, getAllUsers, getUserById, registerUser, updateUser} from "../services/userService.js";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";


const User = () => {

    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({name: '', username: '', password: '', email: '', confirmPassword: ''});
    const [filterMode, setFilterMode] = useState("all")
    const [filterId, setFilterId] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getAllUsers();
                setUsers(data);
            } catch (err) {
                console.log("Failed to load users", err);
            }
        }
            fetchData();

    }, []);

    async function registerNewUser(newUser) {
        try {
            const savedUser = await registerUser(newUser);
            setUsers(prev=> [...prev, savedUser]);
        } catch (err) {
            console.log("Failed to register user", err);
        }
    }

    async function handleDeleteUser(id) {
        try {
            await deleteUser(id);
            setUsers(prev=> prev.filter(user=> user.id !== id));
        } catch (err) {
            console.log("Failed to delete user", err);
        }
    }

    async function handleUserFilter(a) {
        try {
            if(a==="all"){
                setUsers(await getAllUsers());
                return;
            } else if(a==="byPerson"){
                const userById = await getUserById(filterId);
                setUsers(userById ? [userById] : []);
            }

        }catch (err) {
            console.log("Failed to filter user", err);
        }
    }

    async function handleUpdateUser(id, updatedFields) {
        try {
            const updatedUser = await updateUser(id, updatedFields);
            setUsers(prev=> prev.map(user=> user.id === updatedUser.id ? updatedUser : user));
        } catch (err) {
            console.log("Failed to update user", err);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const newUser = {name:formData.name, username:formData.username, email:formData.email, password:formData.password, confirmPassword:formData.confirmPassword};
        const validationErrors = {}

        if(newUser.name.trim() === "") validationErrors.name = "Name is required";
        if(newUser.username.trim() === "") validationErrors.username = "Username is required";
        if(newUser.email.trim() === "") validationErrors.email = "Email is required";
        if(newUser.password.trim() === "") validationErrors.password = "Password is required";
        if(newUser.confirmPassword.trim() === "") validationErrors.confirmPassword = "Confirm password is required";
        if(newUser.password !== newUser.confirmPassword) validationErrors.confirmPassword = "Password do not match";
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        await registerNewUser(newUser);
        setFormData({name: '', username: '', password: '', email: '', confirmPassword: ''});
    }


    return (
        <div className="dashboard-content">
            <div className="row">
                <div className="col-md-8 mx-auto">
                    <div className="card shadow-sm task-form-section">
                        <div className="card-body">
                            <h2 className="card-title mb-4">Add New User</h2>
                            <form id="todoForm">
                                <div className="mb-3">
                                    <label htmlFor="registerName"
                                    className="form-label">Name</label>
                                    {errors.name && <div className="text-danger small">{errors.name}</div>}
                                    <input type="text" className="form-control" id="registerName" required value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})}/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="registerUsername"
                                    className="form-label">Username</label>
                                    {errors.username && <div className="text-danger small">{errors.username}</div>}
                                    <input type="text" className="form-control" id="registerUsername" required value={formData.username} onChange={(e)=>setFormData({...formData, username:e.target.value})}/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="registerEmail"
                                    className="form-label">Email</label>
                                    {errors.email && <div className="text-danger small">{errors.email}</div>}
                                    <input type="email" className="form-control" id="registerEmail" required value={formData.email} onChange={(e)=>setFormData({...formData, email:e.target.value})}/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="registerPassword"
                                    className="form-label">Password</label>
                                    {errors.password && <div className="text-danger small">{errors.password}</div>}
                                    <input type="password" className="form-control" id="registerPassword" required value={formData.password} onChange={(e)=>setFormData({...formData, password:e.target.value})}/>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="registerConfirmPassword"
                                    className="form-label">Confirm Password</label>
                                    {errors.confirmPassword && <div className="text-danger small">{errors.confirmPassword}</div>}
                                    <input type="password" className="form-control" id="registerConfirmPassword" required value={formData.confirmPassword} onChange={(e)=>setFormData({...formData, confirmPassword:e.target.value})}/>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
};
export default User;
