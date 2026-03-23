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
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
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

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyProfile();
      setProfile(data);

      setProfileForm({
        username: data.username || "",
        fullName: data.fullName || "",
        phone: data.phone || "",
        avatarUrl: data.avatarUrl || "",
        addressLine: data.addressLine || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Profile load nahi ho paaya.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
      setSuccessMessage("");

      const updatedProfile = await updateMyProfile(profileForm);

      setProfile(updatedProfile);
      updateName(updatedProfile.fullName);
      setSuccessMessage("Profile successfully updated.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Profile update failed.");
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
      alert(err.response?.data?.message || "Password change failed.");
    } finally {
      setChangingPassword(false);
    }
  };

  const hasAddress =
    profileForm.addressLine ||
    profileForm.city ||
    profileForm.state ||
    profileForm.pincode;

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="mt-4 mb-5">
      <Row>
        <Col md={3}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="text-center p-4">
              <Image
                src={
                  profileForm.avatarUrl?.trim()
                    ? profileForm.avatarUrl
                    : "https://via.placeholder.com/150"
                }
                roundedCircle
                width={120}
                height={120}
                style={{ objectFit: "cover", border: "4px solid #f1f3f5" }}
                className="mb-3"
              />

              <h4 className="mb-1">{profile?.fullName}</h4>
              <p className="text-muted mb-2">@{profile?.username}</p>

              <Badge bg="dark" className="mb-3">
                {profile?.roleName}
              </Badge>

              <div className="text-start mt-3">
                <p className="mb-2">
                  <strong>Email:</strong>
                  <br />
                  <span className="text-muted">{profile?.email}</span>
                </p>

                <p className="mb-2">
                  <strong>Phone:</strong>
                  <br />
                  <span className="text-muted">
                    {profile?.phone || "Not added"}
                  </span>
                </p>

                <p className="mb-0">
                  <strong>Address Status:</strong>
                  <br />
                  <span className="text-muted">
                    {hasAddress ? "Saved" : "Not added yet"}
                  </span>
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Account Sections</h5>
              <div className="d-grid gap-2">
                <Button
                  variant={activeSection === "profile" ? "dark" : "outline-dark"}
                  size="sm"
                  onClick={() => setActiveSection("profile")}
                >
                  Profile Details
                </Button>

                <Button
                  variant={activeSection === "address" ? "dark" : "outline-secondary"}
                  size="sm"
                  onClick={() => setActiveSection("address")}
                >
                  Saved Address
                </Button>

                <Button
                  variant={activeSection === "password" ? "dark" : "outline-secondary"}
                  size="sm"
                  onClick={() => setActiveSection("password")}
                >
                  Change Password
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="mb-1">My Account</h2>
              <p className="text-muted mb-0">
                This is your account dashboard. You can change your profile
                details, manage your address, and update your password from here.
              </p>
            </div>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}

          {activeSection === "profile" && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0">Personal Information</h4>
                  <Badge bg="primary">Editable</Badge>
                </div>

                <Form onSubmit={handleSaveProfile}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                          name="username"
                          value={profileForm.username}
                          onChange={handleProfileChange}
                          placeholder="Enter username"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          name="fullName"
                          value={profileForm.fullName}
                          onChange={handleProfileChange}
                          placeholder="Enter full name"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control value={profile?.email || ""} disabled />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          name="phone"
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                          placeholder="Enter phone number"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Avatar / DP URL</Form.Label>
                    <Form.Control
                      name="avatarUrl"
                      value={profileForm.avatarUrl}
                      onChange={handleProfileChange}
                      placeholder="Paste your profile image URL"
                    />
                    <Form.Text className="text-muted">
                      You can use an image URL to show your profile picture here.
                    </Form.Text>
                  </Form.Group>

                  <div className="text-end">
                    <Button type="submit" disabled={savingProfile}>
                      {savingProfile ? "Saving..." : "Save Profile"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          {activeSection === "address" && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0">Saved Address</h4>
                  <Badge bg="success">{hasAddress ? "Saved" : "Add Now"}</Badge>
                </div>

                <Form onSubmit={handleSaveProfile}>
                  <Form.Group className="mb-3">
                    <Form.Label>Address Line</Form.Label>
                    <Form.Control
                      name="addressLine"
                      value={profileForm.addressLine}
                      onChange={handleProfileChange}
                      placeholder="House number, street, area"
                    />
                  </Form.Group>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          name="city"
                          value={profileForm.city}
                          onChange={handleProfileChange}
                          placeholder="Enter city"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                          name="state"
                          value={profileForm.state}
                          onChange={handleProfileChange}
                          placeholder="Enter state"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Pincode</Form.Label>
                        <Form.Control
                          name="pincode"
                          value={profileForm.pincode}
                          onChange={handleProfileChange}
                          placeholder="Enter pincode"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="text-end">
                    <Button type="submit" disabled={savingProfile}>
                      {savingProfile ? "Saving..." : "Save Address"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          {activeSection === "password" && (
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0">Change Password</h4>
                  <Badge bg="warning" text="dark">
                    Secure
                  </Badge>
                </div>

                <Form onSubmit={handleChangePassword}>
                  <Form.Group className="mb-3">
                    <Form.Label>Old Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="oldPassword"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter old password"
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="text-end">
                    <Button
                      variant="dark"
                      type="submit"
                      disabled={changingPassword}
                    >
                      {changingPassword ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default UserDashboardPage;