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

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const redirectUser = (role) => {
    if (role === "Admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      alert("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post("/gateway/auth/login", formData);

      login(response.data);
      redirectUser(response.data.role);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillAdminDemo = () => {
    setFormData({
      email: "admin@capshop.com",
      password: "Admin@123",
    });
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

            <Button type="submit" className="w-100 mb-2" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>

            <Button
              type="button"
              variant="outline-dark"
              className="w-100"
              onClick={fillAdminDemo}
            >
              Fill Admin Demo Credentials
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;