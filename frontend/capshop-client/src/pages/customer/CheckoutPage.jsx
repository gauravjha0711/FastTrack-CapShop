import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaCreditCard,
  FaMapMarkerAlt,
  FaMoneyCheckAlt,
  FaShippingFast,
} from "react-icons/fa";
import {
  getCart,
  confirmPayment,
  createRazorpayOrder,
  placeOrder,
  startCheckout,
  verifyRazorpayPayment,
} from "../../services/cartService";

const CheckoutPage = () => {
  const navigate = useNavigate();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existing = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existing) {
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const [cart, setCart] = useState({
    cartId: 0,
    userId: 0,
    items: [],
    totalAmount: 0,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [addressData, setAddressData] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
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
      setError("");
      const data = await getCart();
      setCart(data);

      if (!data.items || data.items.length === 0) {
        navigate("/cart");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load checkout page.");
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
      [e.target.name]: e.target.value,
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
      toast.error(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      await startCheckout(addressData);
      setCurrentStep(2);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Address step failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeliveryNext = () => {
    setCurrentStep(3);
  };

  const handleRazorpayPayment = async (selectedPaymentMethod) => {
    let checkoutOpened = false;

    try {
      setSubmitting(true);

      const ok = await loadRazorpayScript();
      if (!ok) {
        toast.error("Unable to load Razorpay. Please try again.");
        return;
      }

      const order = await createRazorpayOrder();

      const prefillContact = (addressData.phone || "").trim();
      const prefillName = (addressData.fullName || "").trim();

      // Razorpay options with proper test mode configuration
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: order.companyName,
        description: "CapShop Order Payment",
        order_id: order.orderId,
        
        // Prefill user details
        prefill: {
          name: prefillName || undefined,
          contact: prefillContact || undefined,
        },
        
        // Notes for test mode
        notes: {
          test_mode: order.testMode ? "true" : "false",
          payment_method: selectedPaymentMethod,
        },
        
        // Theme
        theme: {
          color: "#2563eb",
        },
        
        handler: async (response) => {
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (!verifyRes.verified) {
              await confirmPayment({
                paymentMethod: selectedPaymentMethod,
                paymentStatus: "Failed",
                paymentReference: response.razorpay_payment_id,
              });

              setPaymentStatus("Failed");
              setPaymentReference(response.razorpay_payment_id || "");
              toast.error("Payment verification failed.");
              return;
            }

            const confirmRes = await confirmPayment({
              paymentMethod: selectedPaymentMethod,
              paymentStatus: "Success",
              paymentReference: response.razorpay_payment_id,
            });

            setPaymentStatus(confirmRes.paymentStatus);
            setPaymentReference(confirmRes.paymentReference || "");

            const placed = await placeOrder(deliveryOption);
            navigate(`/orders/confirmation/${placed.orderId}`);
          } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Payment processing failed.");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (resp) => {
        try {
          await confirmPayment({
            paymentMethod: selectedPaymentMethod,
            paymentStatus: "Failed",
            paymentReference: resp?.error?.metadata?.payment_id || null,
          });
        } catch (err) {
          console.error(err);
        }

        setPaymentStatus("Failed");
        setPaymentReference(resp?.error?.metadata?.payment_id || "");
        toast.error(resp?.error?.description || "Payment failed.");
        setSubmitting(false);
      });

      checkoutOpened = true;
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Unable to start Razorpay payment.");
    } finally {
      if (!checkoutOpened) {
        setSubmitting(false);
      }
    }
  };

  const handleCodContinue = async () => {
    try {
      setSubmitting(true);
      const confirmRes = await confirmPayment({
        paymentMethod: "COD",
        paymentStatus: "Success",
        paymentReference: null,
      });

      setPaymentStatus(confirmRes.paymentStatus);
      setPaymentReference(confirmRes.paymentReference || "");

      const placed = await placeOrder(deliveryOption);
      navigate(`/orders/confirmation/${placed.orderId}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Unable to continue with COD.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPaymentMethod = (method) => {
    setPaymentMethod(method);
    setPaymentStatus("");
    setPaymentReference("");
  };

  const handlePlaceOrder = async () => {
    try {
      setSubmitting(true);
      const response = await placeOrder(deliveryOption);
      navigate(`/orders/confirmation/${response.orderId}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Place order failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepConfig = [
    { id: 1, title: "Address", icon: <FaMapMarkerAlt /> },
    { id: 2, title: "Delivery", icon: <FaShippingFast /> },
    { id: 3, title: "Payment", icon: <FaCreditCard /> },
  ];

  if (loading) {
    return (
      <>
        <style>
          {`
            .capshop-checkout-loading {
              min-height: 60vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
          `}
        </style>
        <div className="capshop-checkout-loading">
          <Spinner animation="border" />
          <p className="text-muted mt-3 mb-0">Preparing checkout...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>
        {`
          .capshop-checkout-page {
            padding-top: 24px;
            padding-bottom: 32px;
          }

          .capshop-page-title {
            font-size: 2rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 6px;
          }

          .capshop-page-subtitle {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 24px;
          }

          .capshop-stepper {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
            margin-bottom: 24px;
          }

          .capshop-payment-method-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }

          .capshop-payment-method-tile {
            border: none;
            border-radius: 16px;
            padding: 14px 14px;
            background: #ffffff;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            gap: 12px;
            align-items: center;
          }

          .capshop-payment-method-tile:hover {
            transform: translateY(-1px);
          }

          .capshop-payment-method-tile.active {
            background: linear-gradient(135deg, #eff6ff, #ffffff);
            border: 1px solid #bfdbfe;
            box-shadow: 0 12px 26px rgba(37, 99, 235, 0.1);
          }

          .capshop-payment-method-icon {
            width: 44px;
            height: 44px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            color: #2563eb;
            font-size: 16px;
            flex: 0 0 auto;
          }

          .capshop-payment-method-title {
            font-weight: 800;
            color: #0f172a;
            font-size: 14px;
            margin-bottom: 2px;
          }

          .capshop-payment-method-subtitle {
            color: #64748b;
            font-size: 12px;
            margin-bottom: 0;
          }

          @media (max-width: 768px) {
            .capshop-stepper {
              grid-template-columns: repeat(1, 1fr);
            }

            .capshop-payment-method-grid {
              grid-template-columns: repeat(1, 1fr);
            }
          }

          .capshop-step-card {
            border: none;
            border-radius: 18px;
            padding: 16px 14px;
            text-align: center;
            background: #ffffff;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
            transition: all 0.25s ease;
          }

          .capshop-step-card.active {
            background: linear-gradient(135deg, #eff6ff, #ffffff);
            border: 1px solid #bfdbfe;
            box-shadow: 0 12px 26px rgba(37, 99, 235, 0.1);
          }

          .capshop-step-card.completed {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
          }

          .capshop-step-icon {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            margin: 0 auto 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            color: #2563eb;
            font-size: 16px;
          }

          .capshop-step-card.completed .capshop-step-icon {
            background: #dcfce7;
            color: #16a34a;
          }

          .capshop-step-title {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 2px;
          }

          .capshop-step-number {
            font-size: 12px;
            color: #64748b;
          }

          .capshop-main-card,
          .capshop-summary-card {
            border: none !important;
            border-radius: 24px !important;
            background: #ffffff;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
          }

          .capshop-main-card {
            padding: 26px;
          }

          .capshop-summary-card {
            padding: 24px;
            position: sticky;
            top: 90px;
          }

          .capshop-card-title {
            font-size: 1.35rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 20px;
          }

          .capshop-label {
            font-weight: 600;
            color: #334155;
            margin-bottom: 8px;
          }

          .capshop-input,
          .capshop-select {
            border-radius: 12px !important;
            padding: 11px 14px !important;
            border: 1px solid #dbe2ea !important;
            box-shadow: none !important;
          }

          .capshop-input:focus,
          .capshop-select:focus {
            border-color: #93c5fd !important;
            box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.08) !important;
          }

          .capshop-option-card {
            border: 1px solid #e2e8f0;
            border-radius: 18px;
            padding: 16px;
            transition: all 0.25s ease;
            cursor: pointer;
            background: #ffffff;
          }

          .capshop-option-card.active {
            border-color: #93c5fd;
            background: #eff6ff;
            box-shadow: 0 8px 18px rgba(37, 99, 235, 0.08);
          }

          .capshop-option-title {
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 4px;
          }

          .capshop-option-text {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 0;
          }

          .capshop-action-row {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 24px;
          }

          .capshop-btn {
            border-radius: 14px !important;
            padding: 11px 18px !important;
            font-weight: 700 !important;
          }

          .capshop-primary-btn {
            background: linear-gradient(90deg, #2563eb, #3b82f6) !important;
            border: none !important;
            box-shadow: 0 10px 22px rgba(37, 99, 235, 0.16);
          }

          .capshop-outline-btn {
            border: 1px solid #dbeafe !important;
            background: #ffffff !important;
            color: #2563eb !important;
          }

          .capshop-outline-btn:hover {
            background: #eff6ff !important;
          }

          .capshop-danger-btn {
            border: none !important;
            background: linear-gradient(90deg, #ef4444, #dc2626) !important;
          }

          .capshop-success-btn {
            border: none !important;
            background: linear-gradient(90deg, #16a34a, #22c55e) !important;
          }

          .capshop-payment-status {
            margin-top: 18px;
            border-radius: 14px !important;
          }

          .capshop-review-block {
            padding: 16px 0;
            border-bottom: 1px solid #edf2f7;
          }

          .capshop-review-block:last-child {
            border-bottom: none;
          }

          .capshop-review-heading {
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 10px;
          }

          .capshop-review-text {
            color: #475569;
            margin-bottom: 4px;
            font-size: 14px;
          }

          .capshop-item-row,
          .capshop-summary-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 10px;
          }

          .capshop-item-row {
            margin-bottom: 12px;
          }

          .capshop-item-name {
            font-size: 14px;
            color: #334155;
            margin-bottom: 0;
          }

          .capshop-item-price {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            white-space: nowrap;
          }

          .capshop-summary-title {
            font-size: 1.3rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 18px;
          }

          .capshop-summary-row {
            margin-bottom: 12px;
            color: #475569;
            font-size: 15px;
          }

          .capshop-summary-total {
            margin-top: 18px;
            padding-top: 18px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .capshop-summary-total span {
            font-weight: 700;
            color: #0f172a;
          }

          .capshop-summary-total strong {
            font-size: 1.35rem;
            color: #111827;
          }

          .capshop-summary-note {
            margin-top: 12px;
            font-size: 13px;
            color: #64748b;
          }

          @media (max-width: 991px) {
            .capshop-summary-card {
              position: static;
              margin-top: 18px;
            }
          }

          @media (max-width: 767px) {
            .capshop-stepper {
              grid-template-columns: repeat(2, 1fr);
            }

            .capshop-main-card,
            .capshop-summary-card {
              padding: 20px;
            }

            .capshop-page-title {
              font-size: 1.65rem;
            }
          }

          @media (max-width: 576px) {
            .capshop-stepper {
              grid-template-columns: 1fr;
            }

            .capshop-action-row {
              flex-direction: column;
            }

            .capshop-btn {
              width: 100%;
            }
          }
        `}
      </style>

      <div className="capshop-checkout-page">
        <h2 className="capshop-page-title">Checkout</h2>
        <p className="capshop-page-subtitle">
          Complete your order in a few simple steps
        </p>

        {error && (
          <Alert variant="danger" className="rounded-4 border-0 shadow-sm">
            {error}
          </Alert>
        )}

        <div className="capshop-stepper">
          {stepConfig.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div
                key={step.id}
                className={`capshop-step-card ${isActive ? "active" : ""} ${
                  isCompleted ? "completed" : ""
                }`}
              >
                <div className="capshop-step-icon">{step.icon}</div>
                <div className="capshop-step-title">{step.title}</div>
                <div className="capshop-step-number">Step {step.id}</div>
              </div>
            );
          })}
        </div>

        <Row className="g-4">
          <Col lg={8}>
            {currentStep === 1 && (
              <Card className="capshop-main-card">
                <h4 className="capshop-card-title">Shipping Address</h4>

                <Form onSubmit={handleAddressSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="capshop-label">Full Name</Form.Label>
                        <Form.Control
                          name="fullName"
                          value={addressData.fullName}
                          onChange={handleAddressChange}
                          placeholder="Enter full name"
                          className="capshop-input"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="capshop-label">Phone</Form.Label>
                        <Form.Control
                          name="phone"
                          value={addressData.phone}
                          onChange={handleAddressChange}
                          placeholder="Enter phone number"
                          className="capshop-input"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="capshop-label">Address Line</Form.Label>
                    <Form.Control
                      name="addressLine"
                      value={addressData.addressLine}
                      onChange={handleAddressChange}
                      placeholder="Enter full address"
                      className="capshop-input"
                    />
                  </Form.Group>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="capshop-label">City</Form.Label>
                        <Form.Control
                          name="city"
                          value={addressData.city}
                          onChange={handleAddressChange}
                          placeholder="Enter city"
                          className="capshop-input"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="capshop-label">State</Form.Label>
                        <Form.Control
                          name="state"
                          value={addressData.state}
                          onChange={handleAddressChange}
                          placeholder="Enter state"
                          className="capshop-input"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="capshop-label">Pincode</Form.Label>
                        <Form.Control
                          name="pincode"
                          value={addressData.pincode}
                          onChange={handleAddressChange}
                          placeholder="Enter pincode"
                          className="capshop-input"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="capshop-action-row">
                    <Button type="submit" disabled={submitting} className="capshop-btn capshop-primary-btn">
                      {submitting ? "Saving..." : "Save Address & Continue"}
                    </Button>
                  </div>
                </Form>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="capshop-main-card">
                <h4 className="capshop-card-title">Choose Delivery Option</h4>

                <Row className="g-3">
                  <Col md={6}>
                    <div
                      className={`capshop-option-card ${
                        deliveryOption === "Standard" ? "active" : ""
                      }`}
                      onClick={() => setDeliveryOption("Standard")}
                    >
                      <div className="capshop-option-title">
                        Standard Delivery
                      </div>
                      <p className="capshop-option-text">
                        Delivery in 2-4 business days
                      </p>
                      <Form.Check
                        type="radio"
                        checked={deliveryOption === "Standard"}
                        onChange={() => setDeliveryOption("Standard")}
                        label="Recommended for regular orders"
                        className="mt-3"
                      />
                    </div>
                  </Col>

                  <Col md={6}>
                    <div
                      className={`capshop-option-card ${
                        deliveryOption === "Express" ? "active" : ""
                      }`}
                      onClick={() => setDeliveryOption("Express")}
                    >
                      <div className="capshop-option-title">
                        Express Delivery
                      </div>
                      <p className="capshop-option-text">
                        Delivery in 1-2 business days
                      </p>
                      <Form.Check
                        type="radio"
                        checked={deliveryOption === "Express"}
                        onChange={() => setDeliveryOption("Express")}
                        label="Faster delivery for urgent orders"
                        className="mt-3"
                      />
                    </div>
                  </Col>
                </Row>

                <div className="capshop-action-row">
                  <Button
                    variant="light"
                    className="capshop-btn capshop-outline-btn"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    className="capshop-btn capshop-primary-btn"
                    onClick={handleDeliveryNext}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="capshop-main-card">
                <h4 className="capshop-card-title">Payment</h4>

                <div className="mb-4">
                  <div className="capshop-label mb-2">Select Payment Method</div>

                  <div className="capshop-payment-method-grid">
                    <div
                      className={`capshop-payment-method-tile ${
                        paymentMethod === "UPI" ? "active" : ""
                      }`}
                      onClick={() => handleSelectPaymentMethod("UPI")}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="capshop-payment-method-icon">
                        <FaMoneyCheckAlt />
                      </div>
                      <div>
                        <div className="capshop-payment-method-title">UPI</div>
                        <p className="capshop-payment-method-subtitle">
                          Pay using UPI (via Razorpay)
                        </p>
                      </div>
                    </div>

                    <div
                      className={`capshop-payment-method-tile ${
                        paymentMethod === "Card" ? "active" : ""
                      }`}
                      onClick={() => handleSelectPaymentMethod("Card")}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="capshop-payment-method-icon">
                        <FaCreditCard />
                      </div>
                      <div>
                        <div className="capshop-payment-method-title">Card</div>
                        <p className="capshop-payment-method-subtitle">
                          Debit/Credit cards + 3DS/OTP (via Razorpay)
                        </p>
                      </div>
                    </div>

                    <div
                      className={`capshop-payment-method-tile ${
                        paymentMethod === "COD" ? "active" : ""
                      }`}
                      onClick={() => handleSelectPaymentMethod("COD")}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="capshop-payment-method-icon">
                        <FaCheckCircle />
                      </div>
                      <div>
                        <div className="capshop-payment-method-title">Cash on Delivery</div>
                        <p className="capshop-payment-method-subtitle">
                          Pay when your order arrives
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="capshop-action-row">
                  <Button
                    variant="light"
                    className="capshop-btn capshop-outline-btn"
                    onClick={() => setCurrentStep(2)}
                  >
                    Back
                  </Button>

                  {paymentMethod === "COD" ? (
                    <Button
                      className="capshop-btn capshop-primary-btn"
                      onClick={handleCodContinue}
                      disabled={submitting}
                    >
                      {submitting ? "Processing..." : "Continue"}
                    </Button>
                  ) : (
                    <Button
                      className="capshop-btn capshop-primary-btn"
                      onClick={() => handleRazorpayPayment(paymentMethod)}
                      disabled={submitting}
                    >
                      {submitting ? "Opening Razorpay..." : `Pay Now (${paymentMethod})`}
                    </Button>
                  )}
                </div>

                {paymentStatus && (
                  <Alert
                    variant={paymentStatus === "Success" ? "success" : "danger"}
                    className="capshop-payment-status"
                  >
                    <strong>Payment Status:</strong> {paymentStatus}
                    {paymentReference ? ` | Ref: ${paymentReference}` : ""}
                  </Alert>
                )}
              </Card>
            )}

          </Col>

          <Col lg={4}>
            <Card className="capshop-summary-card">
              <div className="capshop-summary-title">Order Summary</div>

              {cart.items.map((item) => (
                <div key={item.id} className="capshop-item-row">
                  <p className="capshop-item-name">
                    {item.productName} × {item.quantity}
                  </p>
                  <span className="capshop-item-price">₹{item.lineTotal}</span>
                </div>
              ))}

              <div className="capshop-summary-total">
                <span>Total Items</span>
                <strong>{totalItems}</strong>
              </div>

              <div className="capshop-summary-row mt-3">
                <span>Delivery</span>
                <span>{deliveryOption}</span>
              </div>

              <div className="capshop-summary-total">
                <span>Total Amount</span>
                <strong>₹{cart.totalAmount}</strong>
              </div>

              <p className="capshop-summary-note">
                Final payable amount including selected delivery option.
              </p>

              <Button
                variant="light"
                className="capshop-btn capshop-outline-btn w-100 mt-3"
                onClick={() => navigate("/cart")}
              >
                Back to Cart
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default CheckoutPage;