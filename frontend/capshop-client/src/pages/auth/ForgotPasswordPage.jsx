import React, { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  requestForgotPassword,
  resetForgotPassword,
  verifyForgotPasswordAuthenticator,
  verifyForgotPasswordEmailOtp,
} from "../../services/authService";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("Email");
  const [challengeToken, setChallengeToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otp, setOtp] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await requestForgotPassword(email, method);
      setChallengeToken(response.challengeToken);
      alert(response.message || "Verification started.");
      setStep(2);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      let response;
      if (method === "Email") {
        response = await verifyForgotPasswordEmailOtp(email, challengeToken, otp);
      } else {
        response = await verifyForgotPasswordAuthenticator(email, challengeToken, otp);
      }

      setResetToken(response.resetToken);
      alert(response.message || "Verification successful.");
      setStep(3);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await resetForgotPassword(
        resetToken,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      alert(response.message || "Password reset successful.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Password reset failed.");
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
              <h2 className="mb-4 text-center">Forgot Password</h2>
              <p className="text-muted text-center">
                Choose how you want to verify your identity before resetting password.
              </p>

              <Form onSubmit={handleRequest}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Verification Method</Form.Label>
                  <Form.Select value={method} onChange={(e) => setMethod(e.target.value)}>
                    <option value="Email">Verify with Email OTP</option>
                    <option value="Authenticator">Verify with Authenticator</option>
                  </Form.Select>
                </Form.Group>

                <Button type="submit" className="w-100" disabled={loading}>
                  {loading ? "Processing..." : "Continue"}
                </Button>
              </Form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="mb-4 text-center">
                {method === "Email" ? "Enter Email OTP" : "Enter Authenticator Code"}
              </h2>
              <p className="text-muted text-center">
                {method === "Email"
                  ? "Check your email and enter the OTP."
                  : "Open Microsoft Authenticator and enter the 6-digit code."}
              </p>

              <Form onSubmit={handleVerify}>
                <Form.Group className="mb-3">
                  <Form.Label>OTP</Form.Label>
                  <Form.Control
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                  />
                </Form.Group>

                <Button type="submit" className="w-100" disabled={loading}>
                  {loading ? "Verifying..." : "Verify"}
                </Button>
              </Form>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="mb-4 text-center">Set New Password</h2>

              <Form onSubmit={handleReset}>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter new password"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                  />
                </Form.Group>

                <Button type="submit" className="w-100" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </Form>
            </>
          )}

          <div className="text-center mt-3">
            <Link to="/login">Back to Login</Link>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default ForgotPasswordPage;