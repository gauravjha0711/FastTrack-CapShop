import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Form,
  InputGroup,
  ProgressBar,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  requestForgotPassword,
  resetForgotPassword,
  verifyForgotPasswordAuthenticator,
  verifyForgotPasswordEmailOtp,
} from "../../services/authService";
import { toast } from "react-toastify";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("Email");
  const [challengeToken, setChallengeToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otp, setOtp] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const stepValue = useMemo(() => {
    if (step === 1) return 34;
    if (step === 2) return 68;
    return 100;
  }, [step]);

  const handleRequest = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await requestForgotPassword(email, method);
      setChallengeToken(response.challengeToken);
      toast.success(response.message || "Verification started.");
      setStep(2);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Request failed.");
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
      toast.success(response.message || "Verification successful.");
      setStep(3);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Verification failed.");
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
      toast.success(response.message || "Password reset successful.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Password reset failed.");
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
    background: "rgba(59,130,246,0.28)",
    filter: "blur(50px)",
    top: "8%",
    left: "10%",
    animation: "floatOrbOne 7s ease-in-out infinite",
  };

  const orbTwo = {
    position: "absolute",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background: "rgba(139,92,246,0.24)",
    filter: "blur(50px)",
    bottom: "8%",
    right: "10%",
    animation: "floatOrbTwo 8s ease-in-out infinite",
  };

  const wrapperStyle = {
    width: "100%",
    maxWidth: "540px",
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

  const methodCardStyle = (active) => ({
    borderRadius: "16px",
    border: active ? "1px solid #6366f1" : "1px solid #e5e7eb",
    background: active ? "rgba(99,102,241,0.06)" : "#ffffff",
    padding: "16px",
    width: "100%",
    cursor: "pointer",
    transition: "all 0.25s ease",
  });

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

          .auth-method-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 24px rgba(37, 99, 235, 0.08);
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
                CapShop Account Recovery
              </Badge>

              <h2 className="fw-bold mb-2 auth-logo-text">
                {step === 1
                  ? "Forgot your password?"
                  : step === 2
                  ? "Verify your identity"
                  : "Set a new password"}
              </h2>

              <p className="text-muted mb-0" style={{ fontSize: "0.98rem" }}>
                {step === 1
                  ? "Recover access to your account in a secure way."
                  : step === 2
                  ? "Enter the verification code to continue."
                  : "Create a strong new password for your account."}
              </p>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Step {step} of 3</span>
                <span>
                  {step === 1
                    ? "Request"
                    : step === 2
                    ? "Verification"
                    : "Reset"}
                </span>
              </div>
              <ProgressBar
                now={stepValue}
                style={{
                  height: "8px",
                  borderRadius: "999px",
                  backgroundColor: "#e5e7eb",
                }}
              />
            </div>

            {step === 1 && (
              <Form onSubmit={handleRequest}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    size="lg"
                    style={inputStyle}
                  />
                </Form.Group>

                <Form.Label className="fw-semibold mb-3">
                  Verification Method
                </Form.Label>

                <div className="d-grid gap-3 mb-4">
                  <button
                    type="button"
                    className="text-start auth-method-btn"
                    style={methodCardStyle(method === "Email")}
                    onClick={() => setMethod("Email")}
                  >
                    <div className="fw-bold mb-1">Verify with Email OTP</div>
                    <div className="text-muted small">
                      We will send a one-time code to your email address.
                    </div>
                  </button>

                  <button
                    type="button"
                    className="text-start auth-method-btn"
                    style={methodCardStyle(method === "Authenticator")}
                    onClick={() => setMethod("Authenticator")}
                  >
                    <div className="fw-bold mb-1">Verify with Authenticator</div>
                    <div className="text-muted small">
                      Use the 6-digit code from your authenticator app.
                    </div>
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-100"
                  disabled={loading}
                  size="lg"
                  style={primaryButtonStyle}
                >
                  {loading ? "Processing..." : "Continue"}
                </Button>
              </Form>
            )}

            {step === 2 && (
              <Form onSubmit={handleVerify}>
                <div
                  className="text-center mb-4 text-muted"
                  style={{ fontSize: "0.98rem" }}
                >
                  {method === "Email"
                    ? `Verification code sent to ${email}`
                    : "Open your authenticator app and enter the current code"}
                </div>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    {method === "Email" ? "Email OTP" : "Authenticator Code"}
                  </Form.Label>
                  <Form.Control
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    size="lg"
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
                    className="w-100"
                    disabled={loading}
                    size="lg"
                    style={primaryButtonStyle}
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => {
                      setOtp("");
                      setStep(1);
                    }}
                    style={{ borderRadius: "14px", padding: "12px" }}
                  >
                    Back
                  </Button>
                </div>
              </Form>
            )}

            {step === 3 && (
              <Form onSubmit={handleReset}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">New Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder="Enter new password"
                      required
                      size="lg"
                      style={inputStyle}
                    />
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      style={{
                        borderTopRightRadius: "14px",
                        borderBottomRightRadius: "14px",
                        minWidth: "88px",
                      }}
                    >
                      {showNewPassword ? "Hide" : "Show"}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Confirm Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Confirm new password"
                      required
                      size="lg"
                      style={inputStyle}
                    />
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      style={{
                        borderTopRightRadius: "14px",
                        borderBottomRightRadius: "14px",
                        minWidth: "88px",
                      }}
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <div className="d-grid gap-3">
                  <Button
                    type="submit"
                    className="w-100"
                    disabled={loading}
                    size="lg"
                    style={primaryButtonStyle}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => setStep(2)}
                    style={{ borderRadius: "14px", padding: "12px" }}
                  >
                    Back
                  </Button>
                </div>
              </Form>
            )}

            <div className="text-center mt-4">
              <Link to="/login" className="fw-semibold text-decoration-none">
                Back to Login
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;