import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Form,
  InputGroup,
  ProgressBar,
  Row,
  Col,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { signupUser, verifySignupOtp } from "../../services/authService";

const SignupPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [emailForOtp, setEmailForOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signupForm, setSignupForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const progressValue = useMemo(() => (step === 1 ? 50 : 100), [step]);

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

  const pageStyle = {
    minHeight: "calc(100vh - 76px)",
    width: "100vw",
    marginLeft: "calc(50% - 50vw)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e1b4b 100%)",
  };

  const orbOne = {
    position: "absolute",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background: "rgba(59,130,246,0.26)",
    filter: "blur(50px)",
    top: "10%",
    right: "12%",
    animation: "floatOrbOne 7s ease-in-out infinite",
  };

  const orbTwo = {
    position: "absolute",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background: "rgba(236,72,153,0.20)",
    filter: "blur(50px)",
    bottom: "8%",
    left: "10%",
    animation: "floatOrbTwo 8s ease-in-out infinite",
  };

  const wrapperStyle = {
    width: "100%",
    maxWidth: "620px",
    position: "relative",
    zIndex: 2,
  };

  const cardStyle = {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.32)",
    padding: "32px 28px",
  };

  const inputStyle = {
    borderRadius: "14px",
    padding: "14px 16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #dbe3ef",
    boxShadow: "none",
  };

  const primaryButtonStyle = {
    borderRadius: "14px",
    padding: "14px",
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    border: "none",
    fontWeight: "700",
    boxShadow: "0 12px 24px rgba(79,70,229,0.22)",
  };

  return (
    <>
      <style>
        {`
          @keyframes floatOrbOne {
            0% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-18px) translateX(14px); }
            100% { transform: translateY(0px) translateX(0px); }
          }

          @keyframes floatOrbTwo {
            0% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(16px) translateX(-12px); }
            100% { transform: translateY(0px) translateX(0px); }
          }

          .auth-logo-text {
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}
      </style>

      <div style={pageStyle}>
        <div style={orbOne}></div>
        <div style={orbTwo}></div>

        <div style={wrapperStyle}>
          <Card style={cardStyle}>
            <div className="text-center mb-4">
              <Badge
                bg="light"
                text="dark"
                className="px-3 py-2 rounded-pill mb-3 fw-semibold border"
              >
                Join CapShop
              </Badge>

              <h2 className="fw-bold mb-2 auth-logo-text">
                {step === 1 ? "Create your account" : "Verify your email"}
              </h2>

              <p className="text-muted mb-0" style={{ fontSize: "0.98rem" }}>
                {step === 1
                  ? "Start your shopping journey with a secure account."
                  : "Enter the OTP sent to your email address."}
              </p>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Step {step} of 2</span>
                <span>{step === 1 ? "Details" : "Verification"}</span>
              </div>
              <ProgressBar
                now={progressValue}
                style={{
                  height: "8px",
                  borderRadius: "999px",
                  backgroundColor: "#e5e7eb",
                }}
              />
            </div>

            {step === 1 ? (
              <Form onSubmit={handleSignup}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Username</Form.Label>
                      <Form.Control
                        name="username"
                        value={signupForm.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                        size="lg"
                        required
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Full Name</Form.Label>
                      <Form.Control
                        name="fullName"
                        value={signupForm.fullName}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        size="lg"
                        required
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email Address</Form.Label>
                  <Form.Control
                    name="email"
                    type="email"
                    value={signupForm.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    size="lg"
                    required
                    style={inputStyle}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Phone</Form.Label>
                      <Form.Control
                        name="phone"
                        value={signupForm.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        size="lg"
                        required
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Password</Form.Label>
                      <InputGroup>
                        <Form.Control
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={signupForm.password}
                          onChange={handleChange}
                          placeholder="Enter password"
                          size="lg"
                          required
                          style={inputStyle}
                        />
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={() => setShowPassword((prev) => !prev)}
                          style={{
                            borderTopRightRadius: "14px",
                            borderBottomRightRadius: "14px",
                            minWidth: "88px",
                          }}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  type="submit"
                  className="w-100"
                  disabled={loading}
                  size="lg"
                  style={primaryButtonStyle}
                >
                  {loading ? "Sending OTP..." : "Create Account & Send OTP"}
                </Button>

                <div className="text-center mt-4">
                  <span className="text-muted">Already have an account? </span>
                  <Link to="/login" className="fw-bold text-decoration-none">
                    Login now
                  </Link>
                </div>
              </Form>
            ) : (
              <Form onSubmit={handleVerifyOtp}>
                <div
                  className="text-center mb-4 text-muted"
                  style={{ fontSize: "0.98rem" }}
                >
                  OTP sent to <strong>{emailForOtp}</strong>
                </div>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Email OTP</Form.Label>
                  <Form.Control
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    size="lg"
                    required
                    style={{
                      ...inputStyle,
                      textAlign: "center",
                      fontWeight: "700",
                      letterSpacing: "0.2rem",
                    }}
                  />
                </Form.Group>

                <div className="d-grid gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    style={primaryButtonStyle}
                  >
                    {loading ? "Verifying..." : "Verify OTP & Continue"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => setStep(1)}
                    style={{ borderRadius: "14px", padding: "12px" }}
                  >
                    Back to Signup Form
                  </Button>
                </div>

                <div className="text-center mt-4">
                  <span className="text-muted">Already have an account? </span>
                  <Link to="/login" className="fw-bold text-decoration-none">
                    Login now
                  </Link>
                </div>
              </Form>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default SignupPage;