import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Col, Container, Row, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={2} className="admin-sidebar">
          <h4>Admin Panel</h4>

          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/products">Manage Products</Link>

          <div className="mt-4">
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Logout
            </Button>
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