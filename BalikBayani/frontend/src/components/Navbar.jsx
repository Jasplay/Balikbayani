import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <Link to="/">Dashboard</Link>
        <Link to="/report">Report Item</Link>
        {user && <Link to="/my-items">My Items</Link>}
        {user && <Link to="/my-claims">My Claims</Link>}
        {user && <Link to="/notifications">Notifications</Link>}
        {user?.role === "admin" && <Link to="/admin">Admin</Link>}

        <div className="nav-right">
          {user ? (
            <>
              <span>{user.name}</span>
              <button className="secondary-btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
