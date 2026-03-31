import React, { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Image,
  Row,
  Spinner,
} from "react-bootstrap";
import {
  FaCamera,
  FaCheckCircle,
  FaKey,
  FaMapMarkerAlt,
  FaQrcode,
  FaShieldAlt,
  FaUser,
} from "react-icons/fa";
import {
  changeMyPassword,
  enableAuthenticator,
  getAuthenticatorSetup,
  getMyProfile,
  updateMyProfile,
  disableAuthenticator,
} from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const UserDashboardPage = () => {
  const { updateName } = useAuth();

  const [profile, setProfile] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");

  const [profileForm, setProfileForm] = useState({
    username: "",
    fullName: "",
    phone: "",
    avatarUrl: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [authenticatorSetup, setAuthenticatorSetup] = useState(null);
  const [authenticatorOtp, setAuthenticatorOtp] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loadingAuthenticator, setLoadingAuthenticator] = useState(false);
  const [enablingAuthenticator, setEnablingAuthenticator] = useState(false);
  const [disablingAuthenticator, setDisablingAuthenticator] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const normalizeProfileData = (data) => {
    return {
      userId: data.userId,
      username: data.username || "",
      fullName: data.fullName || "",
      email: data.email || "",
      phone: data.phone || "",
      avatarUrl: data.avatarUrl || "",
      addressLine: data.addressLine || "",
      city: data.city || "",
      state: data.state || "",
      pincode: data.pincode || "",
      roleName: data.roleName || "",
      isEmailVerified: data.isEmailVerified || false,
      twoFactorEnabled: data.twoFactorEnabled || false,
    };
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyProfile();
      const normalizedData = normalizeProfileData(data);

      setProfile(normalizedData);

      setProfileForm({
        username: normalizedData.username,
        fullName: normalizedData.fullName,
        phone: normalizedData.phone,
        avatarUrl: normalizedData.avatarUrl,
        addressLine: normalizedData.addressLine,
        city: normalizedData.city,
        state: normalizedData.state,
        pincode: normalizedData.pincode,
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Profile load nahi ho paaya.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateProfileForm = () => {
    if (!profileForm.username.trim()) {
      alert("Username required hai.");
      return false;
    }

    if (!profileForm.fullName.trim()) {
      alert("Full name required hai.");
      return false;
    }

    if (!profileForm.phone.trim()) {
      alert("Phone required hai.");
      return false;
    }

    return true;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) return;

    try {
      setSavingProfile(true);
      setError("");
      setSuccessMessage("");

      const updatedProfile = await updateMyProfile(profileForm);
      const normalizedUpdatedProfile = normalizeProfileData(updatedProfile);

      setProfile(normalizedUpdatedProfile);
      setProfileForm({
        username: normalizedUpdatedProfile.username,
        fullName: normalizedUpdatedProfile.fullName,
        phone: normalizedUpdatedProfile.phone,
        avatarUrl: normalizedUpdatedProfile.avatarUrl,
        addressLine: normalizedUpdatedProfile.addressLine,
        city: normalizedUpdatedProfile.city,
        state: normalizedUpdatedProfile.state,
        pincode: normalizedUpdatedProfile.pincode,
      });

      updateName(normalizedUpdatedProfile.fullName);
      setSuccessMessage("Profile successfully updated.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Profile update failed.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.oldPassword.trim()) {
      alert("Old password required hai.");
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      alert("New password required hai.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("New password must be at least 6 characters long.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    try {
      setChangingPassword(true);
      setError("");
      setSuccessMessage("");

      const response = await changeMyPassword(passwordForm);

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccessMessage(response.message || "Password successfully changed.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Password change failed.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLoadAuthenticatorSetup = async () => {
    try {
      setLoadingAuthenticator(true);
      setError("");
      setSuccessMessage("");

      const data = await getAuthenticatorSetup();
      setAuthenticatorSetup(data);

      if (data?.isAlreadyEnabled) {
        setSuccessMessage(data.message || "Authenticator is already enabled.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Authenticator setup load failed.");
    } finally {
      setLoadingAuthenticator(false);
    }
  };

  const handleEnableAuthenticator = async () => {
    if (!authenticatorOtp.trim()) {
      alert("Please enter authenticator OTP.");
      return;
    }

    try {
      setEnablingAuthenticator(true);
      setError("");
      setSuccessMessage("");

      const response = await enableAuthenticator(authenticatorOtp.trim());

      setAuthenticatorOtp("");
      setAuthenticatorSetup(null);

      await fetchProfile();

      setSuccessMessage(response.message || "Authenticator enabled successfully.");
      setActiveSection("security");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Authenticator enable failed.");
    } finally {
      setEnablingAuthenticator(false);
    }
  };

  const handleDisableAuthenticator = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to disable two-factor authentication?"
    );

    if (!confirmed) return;

    try {
      setDisablingAuthenticator(true);
      setError("");
      setSuccessMessage("");

      const response = await disableAuthenticator();

      setAuthenticatorSetup(null);
      setAuthenticatorOtp("");

      await fetchProfile();

      setSuccessMessage(response.message || "Authenticator disabled successfully.");
      setActiveSection("security");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to disable authenticator.");
    } finally {
      setDisablingAuthenticator(false);
    }
  };

  const handleGenerateNewQr = async () => {
    setAuthenticatorSetup(null);
    setAuthenticatorOtp("");
    await handleLoadAuthenticatorSetup();
  };

  const hasAddress =
    profileForm.addressLine ||
    profileForm.city ||
    profileForm.state ||
    profileForm.pincode;

  if (loading) {
    return (
      <div className="capshop-dashboard-loading">
        <Spinner animation="border" />
        <p className="mt-3 mb-0 text-muted">Loading your account...</p>

        <style>
          {`
            .capshop-dashboard-loading {
              min-height: 60vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .capshop-dashboard-page {
            padding-top: 24px;
            padding-bottom: 36px;
          }

          .capshop-sidebar-card,
          .capshop-main-card,
          .capshop-profile-top-card {
            border: none !important;
            border-radius: 22px !important;
            background: #ffffff;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
          }

          .capshop-profile-top-card {
            margin-bottom: 20px;
            padding: 26px;
          }

          .capshop-profile-card {
            text-align: center;
            padding: 26px 22px;
          }

          .capshop-avatar-wrap {
            position: relative;
            width: 122px;
            margin: 0 auto 16px;
          }

          .capshop-avatar {
            width: 122px;
            height: 122px;
            object-fit: cover;
            border-radius: 50%;
            border: 4px solid #eef2ff;
            box-shadow: 0 10px 24px rgba(37, 99, 235, 0.10);
          }

          .capshop-avatar-badge {
            position: absolute;
            right: 6px;
            bottom: 2px;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: #2563eb;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #fff;
            font-size: 13px;
          }

          .capshop-profile-name {
            font-size: 1.3rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 4px;
          }

          .capshop-profile-username {
            color: #64748b;
            margin-bottom: 12px;
            font-size: 14px;
          }

          .capshop-role-badge,
          .capshop-twofa-badge {
            border-radius: 999px !important;
            padding: 8px 14px !important;
            font-size: 12px !important;
            font-weight: 700 !important;
          }

          .capshop-role-badge {
            background: #0f172a !important;
          }

          .capshop-nav-card {
            padding: 22px;
          }

          .capshop-nav-title {
            font-size: 1rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 14px;
          }

          .capshop-nav-btn {
            border-radius: 14px !important;
            padding: 11px 14px !important;
            font-weight: 700 !important;
            text-align: left !important;
            display: flex !important;
            align-items: center;
            gap: 10px;
            justify-content: flex-start !important;
          }

          .capshop-page-header h2 {
            font-size: 2rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 6px;
          }

          .capshop-page-header p {
            color: #64748b;
            margin-bottom: 0;
            line-height: 1.7;
          }

          .capshop-main-card {
            padding: 26px;
            margin-bottom: 20px;
          }

          .capshop-card-title {
            font-size: 1.35rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 22px;
          }

          .capshop-form-label {
            font-weight: 700;
            color: #334155;
            margin-bottom: 8px;
          }

          .capshop-input {
            border-radius: 14px !important;
            border: 1px solid #dbe2ea !important;
            padding: 11px 14px !important;
            box-shadow: none !important;
          }

          .capshop-input:focus {
            border-color: #93c5fd !important;
            box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.08) !important;
          }

          .capshop-readonly-input {
            background: #f8fafc !important;
          }

          .capshop-save-row {
            display: flex;
            justify-content: flex-end;
            margin-top: 8px;
          }

          .capshop-primary-btn,
          .capshop-dark-btn,
          .capshop-danger-btn,
          .capshop-outline-btn {
            border-radius: 14px !important;
            padding: 11px 18px !important;
            font-weight: 700 !important;
          }

          .capshop-primary-btn {
            border: none !important;
            background: linear-gradient(90deg, #2563eb, #3b82f6) !important;
            box-shadow: 0 10px 22px rgba(37, 99, 235, 0.14);
          }

          .capshop-dark-btn {
            border: none !important;
            background: linear-gradient(90deg, #0f172a, #1e293b) !important;
          }

          .capshop-danger-btn {
            border: none !important;
            background: linear-gradient(90deg, #ef4444, #dc2626) !important;
          }

          .capshop-address-note,
          .capshop-info-alert {
            border-radius: 16px !important;
          }

          .capshop-security-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 14px;
          }

          .capshop-security-text {
            color: #64748b;
            line-height: 1.7;
            margin-bottom: 18px;
          }

          .capshop-qr-wrap {
            text-align: center;
            padding: 18px;
            border: 1px solid #e2e8f0;
            border-radius: 18px;
            background: #f8fafc;
            margin-bottom: 18px;
          }

          .capshop-qr-image {
            max-width: 220px;
            width: 100%;
            border-radius: 14px;
            background: #fff;
            padding: 10px;
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
          }

          .capshop-step-list p {
            margin-bottom: 8px;
            color: #334155;
          }

          .capshop-actions-wrap {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .capshop-summary-grid {
            display: grid;
            gap: 12px;
            margin-top: 16px;
          }

          .capshop-summary-item {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 14px;
          }

          .capshop-summary-label {
            font-size: 12px;
            font-weight: 700;
            color: #64748b;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .capshop-summary-value {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
          }

          @media (max-width: 991px) {
            .capshop-page-header h2 {
              font-size: 1.7rem;
            }
          }

          @media (max-width: 767px) {
            .capshop-profile-top-card,
            .capshop-main-card,
            .capshop-nav-card {
              padding: 18px;
            }

            .capshop-page-header h2 {
              font-size: 1.5rem;
            }

            .capshop-save-row {
              justify-content: stretch;
            }

            .capshop-save-row .btn {
              width: 100%;
            }

            .capshop-actions-wrap .btn {
              width: 100%;
            }
          }
        `}
      </style>

      <div className="capshop-dashboard-page">
        <Row className="g-4">
          <Col lg={3}>
            <Card className="capshop-sidebar-card capshop-profile-card mb-4">
              <div className="capshop-avatar-wrap">
                <Image
                  src={
                    profileForm.avatarUrl?.trim()
                      ? profileForm.avatarUrl
                      : "https://via.placeholder.com/150"
                  }
                  className="capshop-avatar"
                />
                <div className="capshop-avatar-badge">
                  <FaCamera />
                </div>
              </div>

              <div className="capshop-profile-name">{profile?.fullName}</div>
              <div className="capshop-profile-username">@{profile?.username}</div>

              <div className="d-flex justify-content-center flex-wrap gap-2">
                <Badge className="capshop-role-badge">{profile?.roleName}</Badge>
                <Badge
                  bg={profile?.twoFactorEnabled ? "success" : "secondary"}
                  className="capshop-twofa-badge"
                >
                  {profile?.twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
                </Badge>
              </div>

              <div className="capshop-summary-grid">
                <div className="capshop-summary-item">
                  <div className="capshop-summary-label">Email</div>
                  <div className="capshop-summary-value">
                    {profile?.email || "Not available"}
                  </div>
                </div>

                <div className="capshop-summary-item">
                  <div className="capshop-summary-label">Phone</div>
                  <div className="capshop-summary-value">
                    {profile?.phone || "Not added"}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="capshop-sidebar-card capshop-nav-card">
              <div className="capshop-nav-title">Account Sections</div>

              <div className="d-grid gap-2">
                <Button
                  className="capshop-nav-btn"
                  variant={activeSection === "profile" ? "dark" : "outline-dark"}
                  onClick={() => setActiveSection("profile")}
                >
                  <FaUser />
                  Profile Details
                </Button>

                <Button
                  className="capshop-nav-btn"
                  variant={activeSection === "address" ? "dark" : "outline-secondary"}
                  onClick={() => setActiveSection("address")}
                >
                  <FaMapMarkerAlt />
                  Saved Address
                </Button>

                <Button
                  className="capshop-nav-btn"
                  variant={activeSection === "password" ? "dark" : "outline-secondary"}
                  onClick={() => setActiveSection("password")}
                >
                  <FaKey />
                  Change Password
                </Button>

                <Button
                  className="capshop-nav-btn"
                  variant={activeSection === "security" ? "dark" : "outline-secondary"}
                  onClick={() => setActiveSection("security")}
                >
                  <FaShieldAlt />
                  Two-Factor Security
                </Button>
              </div>
            </Card>
          </Col>

          <Col lg={9}>
            <Card className="capshop-profile-top-card">
              <div className="capshop-page-header">
                <h2>My Account</h2>
                <p>
                  Manage your personal details, saved address, password, and
                  security settings from one place.
                </p>
              </div>
            </Card>

            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            {activeSection === "profile" && (
              <Card className="capshop-main-card">
                <div className="capshop-card-title">Personal Information</div>

                <Form onSubmit={handleSaveProfile}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="capshop-form-label">Username</Form.Label>
                        <Form.Control
                          name="username"
                          value={profileForm.username}
                          onChange={handleProfileChange}
                          placeholder="Enter username"
                          className="capshop-input"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="capshop-form-label">Full Name</Form.Label>
                        <Form.Control
                          name="fullName"
                          value={profileForm.fullName}
                          onChange={handleProfileChange}
                          placeholder="Enter full name"
                          className="capshop-input"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="capshop-form-label">Email</Form.Label>
                        <Form.Control
                          value={profile?.email || ""}
                          disabled
                          className="capshop-input capshop-readonly-input"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="capshop-form-label">Phone Number</Form.Label>
                        <Form.Control
                          name="phone"
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                          placeholder="Enter phone number"
                          className="capshop-input"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="capshop-form-label">Avatar URL</Form.Label>
                    <Form.Control
                      name="avatarUrl"
                      value={profileForm.avatarUrl}
                      onChange={handleProfileChange}
                      placeholder="Paste your profile image URL"
                      className="capshop-input"
                    />
                  </Form.Group>

                  <div className="capshop-save-row">
                    <Button
                      type="submit"
                      disabled={savingProfile}
                      className="capshop-primary-btn"
                    >
                      {savingProfile ? "Saving..." : "Save Profile"}
                    </Button>
                  </div>
                </Form>
              </Card>
            )}

            {activeSection === "address" && (
              <Card className="capshop-main-card">
                <div className="capshop-card-title">Saved Address</div>

                <Form onSubmit={handleSaveProfile}>
                  <Form.Group className="mb-3">
                    <Form.Label className="capshop-form-label">Address Line</Form.Label>
                    <Form.Control
                      name="addressLine"
                      value={profileForm.addressLine}
                      onChange={handleProfileChange}
                      placeholder="House number, street, area"
                      className="capshop-input"
                    />
                  </Form.Group>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="capshop-form-label">City</Form.Label>
                        <Form.Control
                          name="city"
                          value={profileForm.city}
                          onChange={handleProfileChange}
                          placeholder="Enter city"
                          className="capshop-input"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="capshop-form-label">State</Form.Label>
                        <Form.Control
                          name="state"
                          value={profileForm.state}
                          onChange={handleProfileChange}
                          placeholder="Enter state"
                          className="capshop-input"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="capshop-form-label">Pincode</Form.Label>
                        <Form.Control
                          name="pincode"
                          value={profileForm.pincode}
                          onChange={handleProfileChange}
                          placeholder="Enter pincode"
                          className="capshop-input"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {hasAddress && (
                    <Alert variant="light" className="border capshop-address-note">
                      Current address information is ready to save or update.
                    </Alert>
                  )}

                  <div className="capshop-save-row">
                    <Button
                      type="submit"
                      disabled={savingProfile}
                      className="capshop-primary-btn"
                    >
                      {savingProfile ? "Saving..." : "Save Address"}
                    </Button>
                  </div>
                </Form>
              </Card>
            )}

            {activeSection === "password" && (
              <Card className="capshop-main-card">
                <div className="capshop-card-title">Change Password</div>

                <Form onSubmit={handleChangePassword}>
                  <Form.Group className="mb-3">
                    <Form.Label className="capshop-form-label">Old Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="oldPassword"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter old password"
                      className="capshop-input"
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="capshop-form-label">New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          className="capshop-input"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="capshop-form-label">
                          Confirm New Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          className="capshop-input"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="capshop-save-row">
                    <Button
                      type="submit"
                      disabled={changingPassword}
                      className="capshop-dark-btn"
                    >
                      {changingPassword ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </Form>
              </Card>
            )}

            {activeSection === "security" && (
              <Card className="capshop-main-card">
                <div className="capshop-security-top">
                  <div className="capshop-card-title mb-0">Two-Factor Authentication</div>
                  <Badge bg={profile?.twoFactorEnabled ? "success" : "secondary"}>
                    {profile?.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <p className="capshop-security-text">
                  Enable Microsoft Authenticator so that during login you can use
                  Authenticator OTP for stronger account security.
                </p>

                {profile?.twoFactorEnabled ? (
                  <>
                    <Alert variant="success" className="capshop-info-alert">
                      <FaCheckCircle className="me-2" />
                      Authenticator is enabled for your account.
                    </Alert>

                    <div className="capshop-actions-wrap">
                      <Button
                        onClick={handleDisableAuthenticator}
                        disabled={disablingAuthenticator}
                        className="capshop-danger-btn"
                      >
                        {disablingAuthenticator ? "Disabling..." : "Disable Authenticator"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {!authenticatorSetup && (
                      <Button
                        onClick={handleLoadAuthenticatorSetup}
                        disabled={loadingAuthenticator}
                        className="capshop-primary-btn"
                      >
                        {loadingAuthenticator ? "Loading..." : "Generate QR Code"}
                      </Button>
                    )}

                    {authenticatorSetup && authenticatorSetup.isAlreadyEnabled && (
                      <Alert variant="info" className="mt-3 capshop-info-alert">
                        {authenticatorSetup.message || "Authenticator is already enabled."}
                      </Alert>
                    )}

                    {authenticatorSetup && !authenticatorSetup.isAlreadyEnabled && (
                      <div className="mt-4">
                        <div className="capshop-step-list mb-3">
                          <p><strong>Step 1:</strong> Open Microsoft Authenticator app.</p>
                          <p><strong>Step 2:</strong> Scan the QR code below.</p>
                          <p><strong>Step 3:</strong> Enter the OTP shown in the app.</p>
                        </div>

                        <div className="capshop-qr-wrap">
                          <img
                            src={`data:image/png;base64,${authenticatorSetup.qrCodeImageBase64}`}
                            alt="Authenticator QR"
                            className="capshop-qr-image"
                          />
                        </div>

                        <Alert variant="secondary" className="capshop-info-alert">
                          <FaQrcode className="me-2" />
                          <strong>Manual Key:</strong> {authenticatorSetup.manualKey}
                        </Alert>

                        <Form.Group className="mb-3">
                          <Form.Label className="capshop-form-label">Authenticator OTP</Form.Label>
                          <Form.Control
                            value={authenticatorOtp}
                            onChange={(e) => setAuthenticatorOtp(e.target.value)}
                            placeholder="Enter 6-digit authenticator code"
                            className="capshop-input"
                          />
                        </Form.Group>

                        <div className="capshop-actions-wrap">
                          <Button
                            onClick={handleEnableAuthenticator}
                            disabled={enablingAuthenticator}
                            className="capshop-primary-btn"
                          >
                            {enablingAuthenticator ? "Enabling..." : "Enable Authenticator"}
                          </Button>

                          <Button
                            variant="outline-secondary"
                            onClick={handleGenerateNewQr}
                            disabled={loadingAuthenticator || enablingAuthenticator}
                            className="capshop-outline-btn"
                          >
                            Generate New QR
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
};

export default UserDashboardPage;