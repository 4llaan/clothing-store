import React, { useEffect, useState } from "react";
import './ListUser.css'

const ListUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all users from the backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:4000/allusers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllUsers(data);
    } catch (error) {
      setError('Failed to fetch users. Please check if the server is running.');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to toggle the active status
  const toggleUserStatus = async (id) => {
    try {
      setError(null);
      const response = await fetch('http://localhost:4000/toggleuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchUsers();  // Refresh users list after toggling
    } catch (error) {
      setError('Failed to update user status. Please try again.');
      console.error('Error toggling user status:', error);
    }
  };

  if (loading) {
    return <div className="listusers">Loading...</div>;
  }

  return (
    <div className="listusers">
      <h1>All Users List</h1>
      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          {error}
        </div>
      )}
      {!error && allUsers.length === 0 ? (
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
