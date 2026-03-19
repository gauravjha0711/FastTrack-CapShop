import React from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <>
      <div className="hero-section">
        <h1>Welcome to CapShop</h1>
        <p>Your microservices-based eCommerce application</p>
        <Button as={Link} to="/products" variant="light">
          Shop Now
        </Button>
      </div>

      <h3 className="mt-5 mb-3">Featured Sections</h3>

      <Row>
        <Col md={4}>
          <Card className="p-3 card-shadow">
            <h5>Fast Delivery</h5>
            <p>Optimized order and checkout journey.</p>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-3 card-shadow">
            <h5>Secure Access</h5>
            <p>JWT-based authentication and role-based access.</p>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-3 card-shadow">
            <h5>Microservices Ready</h5>
            <p>Gateway + independent backend services setup.</p>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default HomePage;