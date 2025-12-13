import React, {useEffect, useState} from "react";
import {deleteUser, getAllUsers, getUserById, registerUser, updateUser} from "../services/userService.js";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";


const User = () => {

    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({name: '', username: '', password: '', email: '', confirmPassword: ''});
    const [filterId, setFilterId] = useState("");
    const [errors, setErrors] = useState({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");

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

    function toggleUserEditing(index) {
        setUsers((prev)=>prev.map((user,i)=>i===index? {...user, isEditing: !user.isEditing}:user));
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
        <div className="dashboard-layout">
            <Sidebar isOpen={false} onClose={() => {}} />
            <main className="dashboard-main">
                <Header
                    title="Users"
                    subtitle="Manage users"
                    onToggleSidebar={() => {}}
                />
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
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                                        <i className="bi bi-plus-lg me-2"></i>
                                        Add User</button>
                                </div>
                            </form>
                        </div>
                    </div>


                    <div className="card shadow-sm tasks-list mt-4">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Users</h5>
                            <div className="btn-group position-relative">
                                <button className="btn btn-outline-secondary btn-sm"
                                type="button"
                                title="filter"
                                onClick={()=>setIsFilterOpen((prev)=>!prev)}>
                                    <i className="bi bi-funnel"></i>
                                </button>
                                {isFilterOpen && (
                                    <div className="card shadow-sm filter-section position-absolute filter-fs p-3"
                                         style={{minWidth: "220px", zIndex: 1050, top:"100%", right:0}}>

                                            <button className="btn btn-sm btn-outline-secondary w-100 mb-2"
                                            type="button"
                                            onClick={()=>handleUserFilter("all")}>All</button>
                                            <div className="text-muted mb-2">User ID</div>
                                            <div className="d-flex gap-2">
                                                <input className="form-control form-control-sm filter-input"
                                                id="fild-for-id"
                                                value={filterId}
                                                onChange={(e)=>setFilterId(e.target.value)}/>
                                                <button type="button"
                                                        className="btn btn-sm btn-outline-secondary me-1 px-1 py-1"
                                                        onClick={async()=>{await handleUserFilter("byPerson");
                                                            setIsFilterOpen(false);
                                                            setFilterId("");
                                                        }}>Apply
                                                </button>
                                            </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="list-group">
                            {users.map((u, index) => (
                                <div className="list-group-item list-group-item-action" key={u.id ?? index}>
                                <div className="d-flex w-100 justify-content-between align-items-center">
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between">
                                            <p className="mb-1 text-muted small">ID: {u.id}</p>
                                            {u.isEditing ? (
                                                <input type="text"
                                                       className="form-control form-control-sm"
                                                       value={editName || u.name}
                                                       onChange={(e)=>setEditName(e.target.value)}/>
                                            ):(
                                                <p className="mb-1 text-muted small">{u.name}</p>
                                            )}
                                            {u.isEditing ? (
                                                <input type="text"
                                                       className="form-control form-control-sm"
                                                       value={editEmail || u.email}
                                                       onChange={(e)=>setEditEmail(e.target.value)}/>
                                            ):(
                                                <p className="mb-1 text-muted small">{u.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="btn-group ms-3">
                                        <button className="btn btn-online-primary btn-sm"
                                        title="Edit"
                                        type="button"
                                        onClick={()=> toggleUserEditing(index)}>
                                            <i className="bi bi-pecil"></i>
                                        </button>
                                        <button className="btn btn-outline-danger btn-sm"
                                                title="Delete"
                                                type="button"
                                                onClick={() => handleDeleteUser(u.id)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                        {u.isEditing && (
                                            <>
                                                <button className="btn btn-outline-secondary btn-sm"
                                                        title="Save"
                                                        type="button"
                                                        onClick={() => { const updatedFields = {
                                                            name: editName || u.name,
                                                        email: editEmail || u.email};
                                                            handleUpdateUser(u.id, updatedFields);
                                                            toggleUserEditing(index)}}>
                                                    <i className="bi bi-check2-circle">Save</i>
                                                </button>
                                                <button type="button"
                                                        className="btn btn-secondary btn-sm p-1 ms-1"
                                                        onClick={()=>toggleUserEditing(index)}> Cancel </button>
                                            </>
                                        )}

                                    </div>
                                </div>
                            </div>
                            ))}

                        </div>
                    </div>


                </div>
            </div>
        </div>
      </main>
    </div>

    )
};
export default User;
