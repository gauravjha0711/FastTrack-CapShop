import React, { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Spinner,
  Table,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaBoxOpen,
  FaClipboardList,
  FaEye,
  FaShoppingBag,
} from "react-icons/fa";
import { getMyOrders } from "../../services/cartService";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyOrders();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "capshop-status-pending";
      case "confirmed":
        return "capshop-status-confirmed";
      case "packed":
        return "capshop-status-packed";
      case "shipped":
        return "capshop-status-shipped";
      case "delivered":
        return "capshop-status-delivered";
      case "cancelled":
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
            .capshop-orders-loading {
              min-height: 60vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
          `}
        </style>

        <div className="capshop-orders-loading">
          <Spinner animation="border" />
          <p className="text-muted mt-3 mb-0">Loading your orders...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>
        {`
          .capshop-orders-page {
            padding-top: 24px;
            padding-bottom: 32px;
          }

          .capshop-orders-header {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 22px;
          }

          .capshop-orders-title {
            font-size: 2rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 4px;
          }

          .capshop-orders-subtitle {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 0;
          }

          .capshop-shop-btn {
            border-radius: 12px !important;
            padding: 10px 16px !important;
            font-weight: 600 !important;
            display: inline-flex !important;
            align-items: center;
            gap: 8px;
          }

          .capshop-orders-card {
            border: none !important;
            border-radius: 24px !important;
            background: #ffffff;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
            overflow: hidden;
          }

          .capshop-table-wrap {
            padding: 10px;
          }

          .capshop-orders-table {
            margin-bottom: 0 !important;
            vertical-align: middle;
          }

          .capshop-orders-table thead th {
            border-bottom: 1px solid #e2e8f0 !important;
            color: #475569;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            padding: 16px 14px !important;
            background: #f8fafc;
            white-space: nowrap;
          }

          .capshop-orders-table tbody td {
            padding: 16px 14px !important;
            border-top: 1px solid #eef2f7 !important;
            color: #334155;
            font-size: 14px;
          }

          .capshop-order-id {
            font-weight: 800;
            color: #0f172a;
          }

          .capshop-order-date {
            min-width: 150px;
            color: #64748b;
            font-size: 13px;
            line-height: 1.5;
          }

          .capshop-order-total {
            font-weight: 800;
            color: #111827;
          }

          .capshop-order-items {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-weight: 600;
            color: #475569;
          }

          .capshop-status-badge {
            border-radius: 999px !important;
            padding: 8px 12px !important;
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
            background: #fef3c7 !important;
            color: #b45309 !important;
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

          .capshop-payment-pill,
          .capshop-delivery-pill {
            display: inline-block;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 600;
            color: #475569;
            white-space: nowrap;
          }

          .capshop-view-btn {
            border-radius: 12px !important;
            padding: 8px 14px !important;
            font-weight: 700 !important;
            display: inline-flex !important;
            align-items: center;
            gap: 6px;
            border: none !important;
            background: linear-gradient(90deg, #2563eb, #3b82f6) !important;
            box-shadow: 0 8px 18px rgba(37, 99, 235, 0.14);
          }

          .capshop-view-btn:hover {
            transform: translateY(-1px);
          }

          .capshop-empty-card {
            border: none !important;
            border-radius: 24px !important;
            background: #ffffff;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
            padding: 42px 24px;
            text-align: center;
          }

          .capshop-empty-icon {
            width: 86px;
            height: 86px;
            margin: 0 auto 18px;
            border-radius: 50%;
            background: #eff6ff;
            color: #2563eb;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
          }

          .capshop-empty-title {
            font-size: 1.5rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 10px;
          }

          .capshop-empty-text {
            color: #64748b;
            font-size: 15px;
            margin-bottom: 22px;
          }

          @media (max-width: 767px) {
            .capshop-orders-title {
              font-size: 1.65rem;
            }

            .capshop-table-wrap {
              padding: 0;
            }

            .capshop-orders-card {
              border-radius: 18px !important;
            }
          }
        `}
      </style>

      <div className="capshop-orders-page">
        <div className="capshop-orders-header">
          <div>
            <h2 className="capshop-orders-title">My Orders</h2>
            <p className="capshop-orders-subtitle">
              Track, review, and manage your recent purchases
            </p>
          </div>

          <Button as={Link} to="/products" className="capshop-shop-btn">
            <FaShoppingBag />
            Continue Shopping
          </Button>
        </div>

        {error && (
          <Alert variant="danger" className="rounded-4 border-0 shadow-sm">
            {error}
          </Alert>
        )}

        {orders.length === 0 ? (
          <Card className="capshop-empty-card">
            <div className="capshop-empty-icon">
              <FaClipboardList />
            </div>

            <div className="capshop-empty-title">No orders found</div>
            <div className="capshop-empty-text">
              You have not placed any orders yet. Start exploring products and
              place your first order.
            </div>

            <div>
              <Button
                as={Link}
                to="/products"
                className="capshop-shop-btn"
                style={{ minWidth: "220px" }}
              >
                <FaShoppingBag />
                Start Shopping
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="capshop-orders-card">
            <div className="capshop-table-wrap">
              <Table responsive hover className="capshop-orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Delivery</th>
                    <th>Items</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <div className="capshop-order-id">#{order.id}</div>
                      </td>

                      <td>
                        <div className="capshop-order-date">
                          {new Date(order.orderDate).toLocaleDateString()}
                          <br />
                          {new Date(order.orderDate).toLocaleTimeString()}
                        </div>
                      </td>

                      <td>
                        <div className="capshop-order-total">
                          ₹{order.totalAmount}
                        </div>
                      </td>

                      <td>
                        <Badge
                          className={`capshop-status-badge ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </Badge>
                      </td>

                      <td>
                        <span className="capshop-payment-pill">
                          {order.paymentMethod}
                        </span>
                      </td>

                      <td>
                        <span className="capshop-delivery-pill">
                          {order.deliveryOption}
                        </span>
                      </td>

                      <td>
                        <span className="capshop-order-items">
                          <FaBoxOpen size={13} />
                          {order.totalItems}
                        </span>
                      </td>

                      <td>
                        <Button
                          as={Link}
                          to={`/orders/${order.id}`}
                          size="sm"
                          className="capshop-view-btn"
                        >
                          <FaEye />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </>
  );
};

export default OrdersPage;