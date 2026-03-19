import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";

const AdminLayout = () => {
  return (
    <Container fluid>
      <Row>
        <Col md={2} className="admin-sidebar">
          <h4>Admin Panel</h4>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/products">Manage Products</Link>
        </Col>

        <Col md={10} className="admin-content">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;