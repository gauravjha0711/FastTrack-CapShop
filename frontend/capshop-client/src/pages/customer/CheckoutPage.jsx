import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getCart, placeOrder, simulatePayment, startCheckout } from "../../services/cartService";

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState({
    cartId: 0,
    userId: 0,
    items: [],
    totalAmount: 0
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [addressData, setAddressData] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: ""
  });
  const [deliveryOption, setDeliveryOption] = useState("Standard");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const totalItems = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart.items]);

  const handleAddressChange = (e) => {
    setAddressData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateAddress = () => {
    if (!addressData.fullName.trim()) return "Full name is required.";
    if (!addressData.phone.trim()) return "Phone is required.";
    if (!addressData.addressLine.trim()) return "Address is required.";
    if (!addressData.city.trim()) return "City is required.";
    if (!addressData.state.trim()) return "State is required.";
    if (!addressData.pincode.trim()) return "Pincode is required.";
    return "";
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    const validationMessage = validateAddress();
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      await startCheckout(addressData);
      setCurrentStep(2);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Address step failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeliveryNext = () => {
    setCurrentStep(3);
  };

  const handleSimulatePayment = async (successFlag) => {
    try {
      setSubmitting(true);
      const response = await simulatePayment(paymentMethod, successFlag);
      setPaymentStatus(response.paymentStatus);
      setPaymentReference(response.paymentReference || "");

      if (response.paymentStatus === "Success") {
        setCurrentStep(4);
      } else {
        alert("Payment failed. Please simulate success to continue.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Payment simulation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setSubmitting(true);
      const response = await placeOrder(deliveryOption);
      navigate(`/orders/confirmation/${response.orderId}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Place order failed.");
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

      <Row className="mb-4">
        <Col md={3}>
          <Card className={`p-3 text-center ${currentStep === 1 ? "border-primary" : ""}`}>
            <strong>1. Address</strong>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={`p-3 text-center ${currentStep === 2 ? "border-primary" : ""}`}>
            <strong>2. Delivery</strong>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={`p-3 text-center ${currentStep === 3 ? "border-primary" : ""}`}>
            <strong>3. Payment</strong>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={`p-3 text-center ${currentStep === 4 ? "border-primary" : ""}`}>
            <strong>4. Review</strong>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          {currentStep === 1 && (
            <Card className="p-4 card-shadow">
              <h4 className="mb-3">Shipping Address</h4>

              <Form onSubmit={handleAddressSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        name="fullName"
                        value={addressData.fullName}
                        onChange={handleAddressChange}
                        placeholder="Enter full name"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        name="phone"
                        value={addressData.phone}
                        onChange={handleAddressChange}
                        placeholder="Enter phone number"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Address Line</Form.Label>
                  <Form.Control
                    name="addressLine"
                    value={addressData.addressLine}
                    onChange={handleAddressChange}
                    placeholder="Enter address"
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        name="city"
                        value={addressData.city}
                        onChange={handleAddressChange}
                        placeholder="Enter city"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        name="state"
                        value={addressData.state}
                        onChange={handleAddressChange}
                        placeholder="Enter state"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Pincode</Form.Label>
                      <Form.Control
                        name="pincode"
                        value={addressData.pincode}
                        onChange={handleAddressChange}
                        placeholder="Enter pincode"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Address & Continue"}
                </Button>
              </Form>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="p-4 card-shadow">
              <h4 className="mb-3">Delivery Option</h4>

              <Form>
                <Form.Check
                  type="radio"
                  label="Standard Delivery (2-4 days)"
                  name="deliveryOption"
                  value="Standard"
                  checked={deliveryOption === "Standard"}
                  onChange={(e) => setDeliveryOption(e.target.value)}
                  className="mb-3"
                />
                <Form.Check
                  type="radio"
                  label="Express Delivery (1-2 days)"
                  name="deliveryOption"
                  value="Express"
                  checked={deliveryOption === "Express"}
                  onChange={(e) => setDeliveryOption(e.target.value)}
                  className="mb-3"
                />

                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button onClick={handleDeliveryNext}>
                    Continue to Payment
                  </Button>
                </div>
              </Form>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="p-4 card-shadow">
              <h4 className="mb-3">Payment Simulation</h4>

              <Form.Group className="mb-3">
                <Form.Label>Select Payment Method</Form.Label>
                <Form.Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="COD">COD</option>
                </Form.Select>
              </Form.Group>

              <div className="d-flex gap-2">
                <Button
                  variant="success"
                  onClick={() => handleSimulatePayment(true)}
                  disabled={submitting}
                >
                  Simulate Payment Success
                </Button>

                <Button
                  variant="danger"
                  onClick={() => handleSimulatePayment(false)}
                  disabled={submitting}
                >
                  Simulate Payment Failure
                </Button>
              </div>

              {paymentStatus && (
                <Alert
                  variant={paymentStatus === "Success" ? "success" : "danger"}
                  className="mt-3"
                >
                  Payment Status: {paymentStatus}
                  {paymentReference ? ` | Ref: ${paymentReference}` : ""}
                </Alert>
              )}
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="p-4 card-shadow">
              <h4 className="mb-3">Review Order</h4>

              <h5>Shipping Address</h5>
              <p className="mb-1">{addressData.fullName}</p>
              <p className="mb-1">{addressData.phone}</p>
              <p className="mb-1">{addressData.addressLine}</p>
              <p className="mb-1">
                {addressData.city}, {addressData.state} - {addressData.pincode}
              </p>

              <hr />

              <h5>Delivery</h5>
              <p>{deliveryOption}</p>

              <h5>Payment</h5>
              <p>
                {paymentMethod} | {paymentStatus}
                {paymentReference ? ` | Ref: ${paymentReference}` : ""}
              </p>

              <h5>Items</h5>
              {cart.items.map((item) => (
                <div key={item.id} className="d-flex justify-content-between mb-2">
                  <span>
                    {item.productName} x {item.quantity}
                  </span>
                  <span>₹{item.lineTotal}</span>
                </div>
              ))}

              <hr />

              <div className="d-flex justify-content-between">
                <strong>Total</strong>
                <strong>₹{cart.totalAmount}</strong>
              </div>

              <div className="d-flex gap-2 mt-4">
                <Button variant="outline-secondary" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <Button onClick={handlePlaceOrder} disabled={submitting}>
                  {submitting ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </Card>
          )}
        </Col>

        <Col md={4}>
          <Card className="p-4 card-shadow">
            <h4>Order Summary</h4>
            <hr />

            {cart.items.map((item) => (
              <div key={item.id} className="mb-2">
                <div className="d-flex justify-content-between">
                  <span>{item.productName} x {item.quantity}</span>
                  <span>₹{item.lineTotal}</span>
                </div>
              </div>
            ))}

            <hr />
            <div className="d-flex justify-content-between">
              <span>Total Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <strong>Total Amount</strong>
              <strong>₹{cart.totalAmount}</strong>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutPage;