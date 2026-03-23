import React, { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import axiosInstance from "../../services/axiosInstance";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      alert("Username is required");
      return false;
    }

    if (!formData.fullName.trim()) {
      alert("Full name is required");
      return false;
    }

    if (!formData.email.trim()) {
      alert("Email is required");
      return false;
    }

    if (!formData.phone.trim()) {
      alert("Phone is required");
      return false;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      await axiosInstance.post("/gateway/auth/signup", formData);

      alert("Signup successful. Please login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="justify-content-center mt-5">
      <Col md={7}>
        <Card className="p-4 card-shadow">
          <h2 className="mb-4 text-center">Signup</h2>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
            </Form.Group>

            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default SignupPage;