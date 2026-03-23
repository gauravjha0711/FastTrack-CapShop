import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Image, Row, Spinner } from "react-bootstrap";
import { changeMyPassword, getMyProfile, updateMyProfile } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const UserDashboardPage = () => {
  const { updateName } = useAuth();

  const [profile, setProfile] = useState(null);
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);
      setSuccessMessage("");

      const updatedProfile = await updateMyProfile(profileForm);
      setProfile(updatedProfile);
      updateName(updatedProfile.fullName);
      setSuccessMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Profile update failed.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

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

      setSuccessMessage(response.message || "Password changed successfully.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Password change failed.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h2 className="mb-4">My Dashboard</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Row>
        <Col md={4}>
          <Card className="p-4 card-shadow mb-4">
            <div className="text-center">
              <Image
                src={
                  profileForm.avatarUrl?.trim()
                    ? profileForm.avatarUrl
                    : "https://via.placeholder.com/150"
                }
                roundedCircle
                width={140}
                height={140}
                style={{ objectFit: "cover" }}
                className="mb-3"
              />

              <h4>{profile?.fullName}</h4>
              <p className="mb-1"><strong>Username:</strong> {profile?.username}</p>
              <p className="mb-1"><strong>Email:</strong> {profile?.email}</p>
              <p className="mb-1"><strong>Phone:</strong> {profile?.phone}</p>
              <p className="mb-0"><strong>Role:</strong> {profile?.roleName}</p>
            </div>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="p-4 card-shadow mb-4">
            <h4 className="mb-3">Edit Profile & Address</h4>

            <Form onSubmit={handleSaveProfile}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      name="username"
                      value={profileForm.username}
                      onChange={handleProfileChange}
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
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
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
                  placeholder="Paste image URL"
                />
              </Form.Group>

              <hr />

              <h5 className="mb-3">Address</h5>

              <Form.Group className="mb-3">
                <Form.Label>Address Line</Form.Label>
                <Form.Control
                  name="addressLine"
                  value={profileForm.addressLine}
                  onChange={handleProfileChange}
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
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save Profile"}
              </Button>
            </Form>
          </Card>

          <Card className="p-4 card-shadow">
            <h4 className="mb-3">Change Password</h4>

            <Form onSubmit={handleChangePassword}>
              <Form.Group className="mb-3">
                <Form.Label>Old Password</Form.Label>
                <Form.Control
                  type="password"
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </Form.Group>

              <Button type="submit" variant="dark" disabled={changingPassword}>
                {changingPassword ? "Changing..." : "Change Password"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserDashboardPage;