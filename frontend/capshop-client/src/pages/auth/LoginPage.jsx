import React, { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDemoLogin = async (roleType) => {
    try {
      const payload =
        roleType === "Admin"
          ? { email: "admin@capshop.com", password: "Admin@123" }
          : { email: "customer@capshop.com", password: "Customer@123" };

      const response = await axiosInstance.post("/gateway/auth/login", payload);

      login(response.data);

      if (response.data.role === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed", error);
      alert("Demo login failed. Check backend/gateway.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post("/gateway/auth/login", formData);
      login(response.data);

      if (response.data.role === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  return (
    <Row className="justify-content-center mt-5">
      <Col md={6}>
        <Card className="p-4 card-shadow">
          <h2 className="mb-4 text-center">Login</h2>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
            </Form.Group>

            <Button type="submit" className="w-100 mb-3">
              Login
            </Button>
          </Form>

          <hr />

          <div className="d-grid gap-2">
            <Button variant="outline-primary" onClick={() => handleDemoLogin("Customer")}>
              Demo Customer Login
            </Button>
            <Button variant="outline-dark" onClick={() => handleDemoLogin("Admin")}>
              Demo Admin Login
            </Button>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;