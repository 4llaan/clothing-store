import React, { useEffect, useState } from "react";
import './ListUser.css'

const ListUsers = () => {
  const [allUsers, setAllUsers] = useState([]);

  // Fetch all users from the backend
  const fetchUsers = () => {
    fetch('http://localhost:4000/allusers')
      .then((res) => res.json())
      .then((data) => setAllUsers(data));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to toggle the active status
  const toggleUserStatus = (id) => {
    fetch('http://localhost:4000/toggleuser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    }).then(() => {
      fetchUsers();  // Refresh users list after toggling
    });
  };

  return (
    <div className="listusers">
      <h1>All Users List</h1>
      {allUsers.length === 0 ? (
        <p>No users found</p>
      ) : (
        <>
          <div className="listusers-table">
            <p>Name</p> <p>Email</p> <p>Status</p> <p>Action</p>
          </div>
          <hr />
          {allUsers.map((user, index) => (
            <div key={index} className="listusers-row">
              <p>{user.name}</p>
              <p>{user.email}</p>
              <p>{user.active ? "Active" : "Inactive"}</p>
              <button 
                onClick={() => toggleUserStatus(user._id)} 
                style={{
                  backgroundColor: user.active ? "green" : "red",  // Green for active, red for inactive
                  color: "white",  // Make text white for contrast
                  border: "none",
                  padding: "5px 10px",
                  cursor: "pointer",
                }}
              >
                {user.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ListUsers;
