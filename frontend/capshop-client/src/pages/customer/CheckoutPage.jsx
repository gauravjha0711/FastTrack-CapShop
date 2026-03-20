import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getCart, startCheckout } from "../../services/cartService";

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState({
    cartId: 0,
    userId: 0,
    items: [],
    totalAmount: 0
  });

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);

      if (!data.items || data.items.length === 0) {
        navigate("/cart");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Checkout load nahi ho paaya.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return "Full name is required.";
    if (!formData.phone.trim()) return "Phone is required.";
    if (!formData.addressLine.trim()) return "Address is required.";
    if (!formData.city.trim()) return "City is required.";
    if (!formData.state.trim()) return "State is required.";
    if (!formData.pincode.trim()) return "Pincode is required.";
    return "";
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      const response = await startCheckout(formData);
      setCheckoutMessage(response.message || "Checkout started successfully.");
      alert("Address step completed. Day 4 checkout skeleton ready.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Checkout start failed.");
    } finally {
      setSubmitting(false);
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
      <h2 className="mb-4">Checkout</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {checkoutMessage && <Alert variant="success">{checkoutMessage}</Alert>}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="p-3 text-center border-primary">
            <strong>1. Address</strong>
            <small>Active Step</small>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 text-center">
            <strong>2. Delivery</strong>
            <small>Next</small>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 text-center">
            <strong>3. Payment</strong>
            <small>Coming Next Day</small>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 text-center">
            <strong>4. Review</strong>
            <small>Coming Later</small>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="p-4 card-shadow">
            <h4 className="mb-3">Shipping Address</h4>

            <Form onSubmit={handleSubmitAddress}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter full name"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Address Line</Form.Label>
                <Form.Control
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Enter state"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Pincode</Form.Label>
                    <Form.Control
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="Enter pincode"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Address & Continue"}
                </Button>

                <Button variant="outline-secondary" onClick={() => navigate("/cart")}>
                  Back to Cart
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-4 card-shadow">
            <h4>Order Summary</h4>
            <hr />

            {cart.items.map((item) => (
              <div key={item.id} className="mb-2">
                <div className="d-flex justify-content-between">
                  <span>
                    {item.productName} x {item.quantity}
                  </span>
                  <span>₹{item.lineTotal}</span>
                </div>
              </div>
            ))}

            <hr />
            <div className="d-flex justify-content-between">
              <strong>Total</strong>
              <strong>₹{cart.totalAmount}</strong>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutPage;