import React, { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { signupUser, verifySignupOtp } from "../../services/authService";

const SignupPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [emailForOtp, setEmailForOtp] = useState("");
  const [signupForm, setSignupForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setSignupForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await signupUser(signupForm);
      setEmailForOtp(response.email || signupForm.email);
      alert(response.message || "OTP sent to your email.");
      setStep(2);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await verifySignupOtp(emailForOtp, otp);
      alert(response.message || "Email verified successfully.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="justify-content-center mt-5">
      <Col md={7}>
        <Card className="p-4 card-shadow">
          {step === 1 ? (
            <>
              <h2 className="mb-4 text-center">Signup</h2>
              <p className="text-muted text-center">
                Create your account. After signup, you will verify your email using OTP.
              </p>

              <Form onSubmit={handleSignup}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    name="username"
                    value={signupForm.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    name="fullName"
                    value={signupForm.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    name="email"
                    type="email"
                    value={signupForm.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    name="phone"
                    value={signupForm.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    name="password"
                    type="password"
                    value={signupForm.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                  />
                </Form.Group>

                <Button type="submit" className="w-100" disabled={loading}>
                  {loading ? "Sending OTP..." : "Signup & Send OTP"}
                </Button>
              </Form>
            </>
          ) : (
            <>
              <h2 className="mb-4 text-center">Verify Signup OTP</h2>
              <p className="text-muted text-center">
                We have sent an OTP to <strong>{emailForOtp}</strong>. Enter it below to complete signup.
              </p>

              <Form onSubmit={handleVerifyOtp}>
                <Form.Group className="mb-3">
                  <Form.Label>Email OTP</Form.Label>
                  <Form.Control
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                  />
                </Form.Group>

                <Button type="submit" className="w-100" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </Form>
            </>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default SignupPage;