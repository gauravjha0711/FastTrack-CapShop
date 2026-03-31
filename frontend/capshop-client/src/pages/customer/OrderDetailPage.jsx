import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Image,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaReceipt,
  FaTimesCircle,
  FaTruck,
} from "react-icons/fa";
import { cancelOrder, getOrderById } from "../../services/cartService";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load order details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      await cancelOrder(id);
      alert("Order cancelled successfully.");
      await fetchOrder();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Cancel failed.");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel =
    order &&
    !["Packed", "Shipped", "Delivered", "Cancelled"].includes(order.status);

  const totalItems = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [order]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "capshop-status-pending";
      case "Confirmed":
        return "capshop-status-confirmed";
      case "Packed":
        return "capshop-status-packed";
      case "Shipped":
        return "capshop-status-shipped";
      case "Delivered":
        return "capshop-status-delivered";
      case "Cancelled":
        return "capshop-status-cancelled";
      default:
        return "capshop-status-default";
    }
  };

  if (loading) {
    return (
      <>
        <style>
          {`
            .capshop-order-loading {
              min-height: 60vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
          `}
        </style>

        <div className="capshop-order-loading">
          <Spinner animation="border" />
          <p className="text-muted mt-3 mb-0">Loading order details...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="mt-4">
        <Alert variant="danger" className="rounded-4 border-0 shadow-sm">
          {error}
        </Alert>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mt-4">
        <Alert variant="warning" className="rounded-4 border-0 shadow-sm">
          Order not found.
        </Alert>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .capshop-order-page {
            padding-top: 24px;
            padding-bottom: 32px;
          }

          .capshop-top-bar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 22px;
          }

          .capshop-back-btn {
            border-radius: 12px !important;
            padding: 10px 16px !important;
            font-weight: 600 !important;
            display: inline-flex !important;
            align-items: center;
            gap: 8px;
          }

          .capshop-order-hero {
            border: none !important;
            border-radius: 24px !important;
            background: linear-gradient(135deg, #ffffff, #f8fbff);
            box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
            padding: 24px;
            margin-bottom: 22px;
          }

          .capshop-order-id {
            font-size: 2rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 6px;
          }

          .capshop-order-subtext {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 0;
          }

          .capshop-order-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 18px;
          }

          .capshop-meta-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 999px;
            padding: 9px 14px;
            font-size: 13px;
            font-weight: 600;
            color: #334155;
          }

          .capshop-status-badge {
            border-radius: 999px !important;
            padding: 8px 14px !important;
            font-size: 12px !important;
            font-weight: 700 !important;
          }

          .capshop-status-pending {
            background: #fff7ed !important;
            color: #ea580c !important;
          }

          .capshop-status-confirmed {
            background: #eff6ff !important;
            color: #2563eb !important;
          }

          .capshop-status-packed {
            background: #f5f3ff !important;
            color: #7c3aed !important;
          }

          .capshop-status-shipped {
            background: #ecfeff !important;
            color: #0891b2 !important;
          }

          .capshop-status-delivered {
            background: #dcfce7 !important;
            color: #166534 !important;
          }

          .capshop-status-cancelled {
            background: #fee2e2 !important;
            color: #b91c1c !important;
          }

          .capshop-status-default {
            background: #f1f5f9 !important;
            color: #475569 !important;
          }

          .capshop-section-card {
            border: none !important;
            border-radius: 22px !important;
            background: #ffffff;
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
            padding: 22px;
            margin-bottom: 20px;
          }

          .capshop-section-title {
            font-size: 1.25rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .capshop-order-item {
            border: 1px solid #eef2f7;
            border-radius: 18px;
            padding: 16px;
            margin-bottom: 14px;
            background: #fbfdff;
            transition: all 0.2s ease;
          }

          .capshop-order-item:hover {
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
          }

          .capshop-order-item:last-child {
            margin-bottom: 0;
          }

          .capshop-item-image {
            width: 100%;
            height: 90px;
            object-fit: cover;
            border-radius: 14px;
            background: #f8fafc;
          }

          .capshop-item-name {
            font-size: 1rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 6px;
          }

          .capshop-item-meta {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 4px;
          }

          .capshop-item-price {
            font-size: 14px;
            color: #334155;
            margin-bottom: 0;
          }

          .capshop-item-total {
            font-size: 1.05rem;
            font-weight: 800;
            color: #111827;
            text-align: right;
          }

          .capshop-address-line {
            color: #475569;
            font-size: 15px;
            margin-bottom: 6px;
          }

          .capshop-summary-grid {
            display: grid;
            gap: 14px;
          }

          .capshop-summary-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
            font-size: 15px;
            color: #475569;
          }

          .capshop-summary-row strong {
            color: #0f172a;
          }

          .capshop-summary-total {
            padding-top: 16px;
            margin-top: 4px;
            border-top: 1px solid #e2e8f0;
          }

          .capshop-summary-total .capshop-summary-row strong:last-child {
            font-size: 1.25rem;
            color: #111827;
          }

          .capshop-payment-ref {
            word-break: break-word;
            text-align: right;
          }

          .capshop-cancel-btn {
            width: 100%;
            margin-top: 20px;
            border: none !important;
            border-radius: 14px !important;
            padding: 12px 16px !important;
            font-weight: 700 !important;
            background: linear-gradient(90deg, #ef4444, #dc2626) !important;
          }

          .capshop-cancel-btn:hover:not(:disabled) {
            transform: translateY(-1px);
          }

          .capshop-cancel-btn:disabled {
            opacity: 0.85;
          }

          .capshop-helper-note {
            margin-top: 12px;
            font-size: 13px;
            color: #64748b;
          }

          @media (max-width: 991px) {
            .capshop-item-total {
              text-align: left;
              margin-top: 10px;
            }
          }

          @media (max-width: 767px) {
            .capshop-order-id {
              font-size: 1.6rem;
            }

            .capshop-order-hero,
            .capshop-section-card {
              padding: 18px;
            }

            .capshop-item-image {
              height: 180px;
              margin-bottom: 12px;
            }
          }
        `}
      </style>

      <div className="capshop-order-page">
        <div className="capshop-top-bar">
          <div />
          <Button
            variant="outline-secondary"
            className="capshop-back-btn"
            onClick={() => navigate("/orders")}
          >
            <FaArrowLeft />
            Back to Orders
          </Button>
        </div>

        <Card className="capshop-order-hero">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
            <div>
              <div className="capshop-order-id">Order #{order.id}</div>
              <p className="capshop-order-subtext">
                Placed on {new Date(order.orderDate).toLocaleString()}
              </p>
            </div>

            <Badge className={`capshop-status-badge ${getStatusClass(order.status)}`}>
              {order.status}
            </Badge>
          </div>

          <div className="capshop-order-meta">
            <div className="capshop-meta-pill">
              <FaBoxOpen />
              {totalItems} item{totalItems > 1 ? "s" : ""}
            </div>
            <div className="capshop-meta-pill">
              <FaMoneyBillWave />
              Payment: {order.paymentStatus}
            </div>
            <div className="capshop-meta-pill">
              <FaTruck />
              Delivery: {order.deliveryOption}
            </div>
          </div>
        </Card>

        <Row className="g-4">
          <Col lg={8}>
            <Card className="capshop-section-card">
              <div className="capshop-section-title">
                <FaBoxOpen />
                Order Items
              </div>

              {order.items.map((item, index) => (
                <div className="capshop-order-item" key={index}>
                  <Row className="align-items-center g-3">
                    <Col md={2} sm={3}>
                      <Image
                        src={
                          item.productImageUrl ||
                          "https://via.placeholder.com/120/f8fafc/64748b?text=Product"
                        }
                        alt={item.productName}
                        fluid
                        className="capshop-item-image"
                      />
                    </Col>

                    <Col md={6} sm={9}>
                      <h6 className="capshop-item-name">{item.productName}</h6>
                      <p className="capshop-item-meta">Quantity: {item.quantity}</p>
                      <p className="capshop-item-price mb-0">
                        Unit Price: ₹{item.unitPrice}
                      </p>
                    </Col>

                    <Col md={4}>
                      <div className="capshop-item-total">₹{item.lineTotal}</div>
                    </Col>
                  </Row>
                </div>
              ))}
            </Card>

            <Card className="capshop-section-card">
              <div className="capshop-section-title">
                <FaMapMarkerAlt />
                Shipping Address
              </div>

              <p className="capshop-address-line">
                <strong>{order.fullName}</strong>
              </p>
              <p className="capshop-address-line">{order.phone}</p>
              <p className="capshop-address-line">{order.addressLine}</p>
              <p className="capshop-address-line mb-0">
                {order.city}, {order.state} - {order.pincode}
              </p>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="capshop-section-card">
              <div className="capshop-section-title">
                <FaReceipt />
                Order Summary
              </div>

              <div className="capshop-summary-grid">
                <div className="capshop-summary-row">
                  <span>Order Date</span>
                  <strong>{new Date(order.orderDate).toLocaleDateString()}</strong>
                </div>

                <div className="capshop-summary-row">
                  <span>Total Items</span>
                  <strong>{totalItems}</strong>
                </div>

                <div className="capshop-summary-row">
                  <span>Payment Method</span>
                  <strong>{order.paymentMethod}</strong>
                </div>

                <div className="capshop-summary-row">
                  <span>Payment Status</span>
                  <strong>{order.paymentStatus}</strong>
                </div>

                <div className="capshop-summary-row">
                  <span>Delivery Option</span>
                  <strong>{order.deliveryOption}</strong>
                </div>

                <div className="capshop-summary-row">
                  <span>Payment Ref</span>
                  <strong className="capshop-payment-ref">
                    {order.paymentReference || "N/A"}
                  </strong>
                </div>

                <div className="capshop-summary-total">
                  <div className="capshop-summary-row">
                    <strong>Total Amount</strong>
                    <strong>₹{order.totalAmount}</strong>
                  </div>
                </div>
              </div>

              {canCancel && (
                <Button
                  className="capshop-cancel-btn"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="me-2" />
                      Cancel Order
                    </>
                  )}
                </Button>
              )}

              {!canCancel && (
                <p className="capshop-helper-note mb-0">
                  This order can no longer be cancelled because it is already{" "}
                  <strong>{order.status}</strong>.
                </p>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default OrderDetailPage;