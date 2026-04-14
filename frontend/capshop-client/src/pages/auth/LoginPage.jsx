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
import { toast } from "react-toastify";
import {
  loginInitiate,
  sendLoginEmailOtp,
  sendLoginMobileOtp,
  sendLoginWhatsappOtp,
  verifyLoginAuthenticator,
  verifyLoginEmailOtp,
  verifyLoginWhatsappOtp,
} from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [tempLoginToken, setTempLoginToken] = useState("");
  const [availableMethods, setAvailableMethods] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const stepValue = useMemo(() => {
    if (step === 1) return 34;
    if (step === 2) return 68;
    return 100;
  }, [step]);

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
      toast.error(error.response?.data?.message || "Login failed.");
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
      toast.success("Login OTP sent to your email.");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send email OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleChooseMobileOtp = async () => {
    try {
      setLoading(true);
      await sendLoginMobileOtp(tempLoginToken);
      setSelectedMethod("MobileOtp");
      setStep(3);
      toast.success("Login OTP sent to your mobile number.");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send mobile OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleChooseWhatsappOtp = async () => {
    try {
      setLoading(true);
      await sendLoginWhatsappOtp(tempLoginToken);
      setSelectedMethod("WhatsappOtp");
      setStep(3);
      toast.success("Login OTP sent to your WhatsApp number.");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send WhatsApp OTP.");
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

      if (selectedMethod === "Authenticator") {
        response = await verifyLoginAuthenticator(tempLoginToken, otp);
      } else if (selectedMethod === "WhatsappOtp") {
        response = await verifyLoginWhatsappOtp(tempLoginToken, otp);
      } else {
        response = await verifyLoginEmailOtp(tempLoginToken, otp);
      }

      login(response);
      toast.success("Login successful.");
      redirectUser(response.role);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Verification failed.");
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
    maxWidth: "520px",
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

  const methodCardStyle = {
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    padding: "16px",
    width: "100%",
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

          .auth-method-btn {
            transition: all 0.25s ease;
          }

          .auth-method-btn:hover {
            transform: translateY(-2px);
            border-color: #c7d2fe !important;
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
                Welcome to CapShop
              </Badge>

              <h2 className="fw-bold mb-2 auth-logo-text">
                {step === 1
                  ? "Sign in to your account"
                  : step === 2
                  ? "Choose verification method"
                  : "Complete verification"}
              </h2>

              <p className="text-muted mb-0" style={{ fontSize: "0.98rem" }}>
                {step === 1
                  ? "Secure login for your shopping experience."
                  : step === 2
                  ? "Select your preferred 2FA method."
                  : "Enter the code to continue."}
              </p>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Step {step} of 3</span>
                <span>
                  {step === 1
                    ? "Credentials"
                    : step === 2
                    ? "Method"
                    : "Verify"}
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
              <Form onSubmit={handlePasswordStep}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginFormChange}
                    placeholder="Enter your email"
                    required
                    size="lg"
                    style={inputStyle}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold">Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginForm.password}
                      onChange={handleLoginFormChange}
                      placeholder="Enter your password"
                      required
                      size="lg"
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

                <div className="d-flex justify-content-end mb-4">
                  <Link
                    to="/forgot-password"
                    className="text-decoration-none fw-semibold"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-100"
                  disabled={loading}
                  size="lg"
                  style={primaryButtonStyle}
                >
                  {loading ? "Checking..." : "Continue Secure Login"}
                </Button>

                <div className="text-center mt-4">
                  <span className="text-muted">Don't have an account? </span>
                  <Link to="/signup" className="fw-bold text-decoration-none">
                    Create new account
                  </Link>
                </div>
              </Form>
            )}

            {step === 2 && (
              <>
                <div className="d-grid gap-3">
                  {availableMethods.includes("EmailOtp") && (
                    <button
                      type="button"
                      onClick={handleChooseEmailOtp}
                      disabled={loading}
                      className="text-start auth-method-btn"
                      style={methodCardStyle}
                    >
                      <div className="fw-bold mb-1">Verify with Email OTP</div>
                      <div className="text-muted small">
                        Receive a one-time code on your registered email.
                      </div>
                    </button>
                  )}

                  {availableMethods.includes("MobileOtp") && (
                    <button
                      type="button"
                      onClick={handleChooseMobileOtp}
                      disabled={loading}
                      className="text-start auth-method-btn"
                      style={methodCardStyle}
                    >
                      <div className="fw-bold mb-1">Verify with Mobile OTP</div>
                      <div className="text-muted small">
                        Receive a one-time code on your registered mobile number.
                      </div>
                    </button>
                  )}

                  {availableMethods.includes("WhatsappOtp") && (
                    <button
                      type="button"
                      onClick={handleChooseWhatsappOtp}
                      disabled={loading}
                      className="text-start auth-method-btn"
                      style={methodCardStyle}
                    >
                      <div className="fw-bold mb-1">Verify with WhatsApp OTP</div>
                      <div className="text-muted small">
                        Receive a one-time code on your registered WhatsApp number.
                      </div>
                    </button>
                  )}

                  {availableMethods.includes("Authenticator") && (
                    <button
                      type="button"
                      onClick={handleChooseAuthenticator}
                      disabled={loading}
                      className="text-start auth-method-btn"
                      style={methodCardStyle}
                    >
                      <div className="fw-bold mb-1">
                        Verify with Microsoft Authenticator
                      </div>
                      <div className="text-muted small">
                        Enter the 6-digit code from your authenticator app.
                      </div>
                    </button>
                  )}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setStep(1)}
                    style={{ borderRadius: "12px" }}
                  >
                    Back
                  </Button>

                  <Link to="/signup" className="fw-semibold text-decoration-none">
                    Create account
                  </Link>
                </div>
              </>
            )}

            {step === 3 && (
              <Form onSubmit={handleVerifySecondFactor}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    {selectedMethod === "Authenticator"
                      ? "Authenticator Code"
                      : selectedMethod === "MobileOtp"
                      ? "Mobile OTP"
                      : selectedMethod === "WhatsappOtp"
                      ? "WhatsApp OTP"
                      : "Email OTP"}
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
                    disabled={loading}
                    size="lg"
                    style={primaryButtonStyle}
                  >
                    {loading ? "Verifying..." : "Verify & Login"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => {
                      setOtp("");
                      setStep(2);
                    }}
                    style={{ borderRadius: "14px", padding: "12px" }}
                  >
                    Change Verification Method
                  </Button>
                </div>
              </Form>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default LoginPage;