import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { name, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={2} className="admin-sidebar">
          <div className="d-flex flex-column h-100">
            <div>
              <h4>Admin Panel</h4>
              <p className="small text-light mb-4">Hi, {name}</p>

              <Link to="/admin/dashboard">Dashboard</Link>
              <Link to="/admin/products">Manage Products</Link>
              <Link to="/admin/orders">Manage Orders</Link>
              <Link to="/admin/reports">Reports</Link>
            </div>

            <div className="mt-auto pt-4">
              <Button variant="outline-light" className="w-100" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </Col>

        <Col md={10} className="admin-content">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;