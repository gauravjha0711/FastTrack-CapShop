import React from "react";
import { Card, Col, Row } from "react-bootstrap";

const DashboardPage = () => {
  return (
    <div>
      <h2>Admin Dashboard</h2>

      <Row className="mt-4">
        <Col md={4}>
          <Card className="p-3 card-shadow">
            <h5>Total Products</h5>
            <h3>0</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3 card-shadow">
            <h5>Total Orders</h5>
            <h3>0</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3 card-shadow">
            <h5>Pending Orders</h5>
            <h3>0</h3>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;