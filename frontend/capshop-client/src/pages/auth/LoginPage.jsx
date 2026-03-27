import React, { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  loginInitiate,
  sendLoginEmailOtp,
  verifyLoginAuthenticator,
  verifyLoginEmailOtp,
} from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [tempLoginToken, setTempLoginToken] = useState("");
  const [availableMethods, setAvailableMethods] = useState([]);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginFormChange = (e) => {
    setLoginForm((prev) => ({
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

  const handlePasswordStep = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await loginInitiate(loginForm.email, loginForm.password);

      setTempLoginToken(response.tempLoginToken);
      setAvailableMethods(response.availableMethods || []);
      setStep(2);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleChooseEmailOtp = async () => {
    try {
      setLoading(true);
      await sendLoginEmailOtp(tempLoginToken);
      setSelectedMethod("EmailOtp");
      setStep(3);
      alert("Login OTP sent to your email.");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to send email OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleChooseAuthenticator = () => {
    setSelectedMethod("Authenticator");
    setStep(3);
  };

  const handleVerifySecondFactor = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      let response;

      if (selectedMethod === "EmailOtp") {
        response = await verifyLoginEmailOtp(tempLoginToken, otp);
      } else {
        response = await verifyLoginAuthenticator(tempLoginToken, otp);
      }

      login(response);
      redirectUser(response.role);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="justify-content-center mt-5">
      <Col md={6}>
        <Card className="p-4 card-shadow">
          {step === 1 && (
            <>
              <h2 className="mb-4 text-center">Login</h2>
              <p className="text-muted text-center">
                Enter your email and password first. After that, complete your second-factor verification.
              </p>

              <Form onSubmit={handlePasswordStep}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginFormChange}
                    placeholder="Enter email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginFormChange}
                    placeholder="Enter password"
                  />
                </Form.Group>

                <Button type="submit" className="w-100 mb-3" disabled={loading}>
                  {loading ? "Checking..." : "Continue"}
                </Button>

                <div className="text-center">
                  <Link to="/forgot-password">Forgot Password?</Link>
                </div>
              </Form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="mb-4 text-center">Choose Verification Method</h2>
              <p className="text-muted text-center">
                Select how you want to complete your two-factor authentication.
              </p>

              <div className="d-grid gap-3">
                {availableMethods.includes("EmailOtp") && (
                  <Button onClick={handleChooseEmailOtp} disabled={loading}>
                    Verify with Email OTP
                  </Button>
                )}

                {availableMethods.includes("Authenticator") && (
                  <Button variant="dark" onClick={handleChooseAuthenticator} disabled={loading}>
                    Verify with Microsoft Authenticator
                  </Button>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="mb-4 text-center">
                {selectedMethod === "EmailOtp" ? "Enter Email OTP" : "Enter Authenticator Code"}
              </h2>
              <p className="text-muted text-center">
                {selectedMethod === "EmailOtp"
                  ? "Check your email and enter the OTP you received."
                  : "Open Microsoft Authenticator app and enter the current 6-digit code."}
              </p>

              <Form onSubmit={handleVerifySecondFactor}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {selectedMethod === "EmailOtp" ? "Email OTP" : "Authenticator OTP"}
                  </Form.Label>
                  <Form.Control
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                  />
                </Form.Group>

                <Button type="submit" className="w-100" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>
              </Form>
            </>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;