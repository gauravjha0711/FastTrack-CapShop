import React from "react";
import { Button, Card } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { FaBoxOpen, FaCheckCircle, FaClipboardList, FaShoppingBag } from "react-icons/fa";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();

  return (
    <>
      <style>
        {`
          .capshop-confirmation-page {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 16px;
          }

          .capshop-confirmation-card {
            width: 100%;
            max-width: 760px;
            border: none !important;
            border-radius: 28px !important;
            padding: 42px 32px;
            text-align: center;
            background: #ffffff;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
            position: relative;
            overflow: hidden;
          }

          .capshop-confirmation-card::before {
            content: "";
            position: absolute;
            top: -80px;
            right: -80px;
            width: 220px;
            height: 220px;
            background: rgba(59, 130, 246, 0.06);
            border-radius: 50%;
          }

          .capshop-confirmation-card::after {
            content: "";
            position: absolute;
            bottom: -90px;
            left: -90px;
            width: 240px;
            height: 240px;
            background: rgba(34, 197, 94, 0.06);
            border-radius: 50%;
          }

          .capshop-success-icon-wrap {
            width: 96px;
            height: 96px;
            margin: 0 auto 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #dcfce7, #f0fdf4);
            box-shadow: 0 12px 30px rgba(34, 197, 94, 0.15);
            position: relative;
            z-index: 1;
          }

          .capshop-success-icon {
            font-size: 42px;
            color: #16a34a;
          }

          .capshop-confirmation-title {
            font-size: 2rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
          }

          .capshop-confirmation-text {
            color: #64748b;
            font-size: 15px;
            line-height: 1.7;
            margin-bottom: 14px;
            position: relative;
            z-index: 1;
          }

          .capshop-order-id-box {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 14px 20px;
            margin: 16px 0 22px;
            font-weight: 700;
            color: #0f172a;
            position: relative;
            z-index: 1;
          }

          .capshop-order-id-label {
            color: #64748b;
            font-weight: 600;
          }

          .capshop-order-id-value {
            color: #2563eb;
            font-size: 1.05rem;
            font-weight: 800;
          }

          .capshop-confirmation-info {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
            margin: 10px 0 28px;
            position: relative;
            z-index: 1;
          }

          .capshop-info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 18px;
            padding: 18px 16px;
          }

          .capshop-info-icon {
            font-size: 20px;
            color: #2563eb;
            margin-bottom: 10px;
          }

          .capshop-info-title {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 6px;
          }

          .capshop-info-text {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 0;
            line-height: 1.6;
          }

          .capshop-confirmation-actions {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 14px;
            position: relative;
            z-index: 1;
          }

          .capshop-btn {
            min-width: 200px;
            border-radius: 14px !important;
            padding: 12px 18px !important;
            font-weight: 700 !important;
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .capshop-primary-btn {
            background: linear-gradient(90deg, #2563eb, #3b82f6) !important;
            border: none !important;
            box-shadow: 0 10px 24px rgba(37, 99, 235, 0.16);
          }

          .capshop-outline-btn {
            background: #ffffff !important;
            border: 1px solid #dbeafe !important;
            color: #2563eb !important;
          }

          .capshop-outline-btn:hover {
            background: #eff6ff !important;
            color: #1d4ed8 !important;
          }

          @media (max-width: 767px) {
            .capshop-confirmation-card {
              padding: 32px 20px;
            }

            .capshop-confirmation-title {
              font-size: 1.6rem;
            }

            .capshop-confirmation-info {
              grid-template-columns: 1fr;
            }

            .capshop-btn {
              width: 100%;
              min-width: unset;
            }
          }
        `}
      </style>

      <div className="capshop-confirmation-page">
        <Card className="capshop-confirmation-card">
          <div className="capshop-success-icon-wrap">
            <FaCheckCircle className="capshop-success-icon" />
          </div>

          <h2 className="capshop-confirmation-title">
            Order Placed Successfully
          </h2>

          <p className="capshop-confirmation-text">
            Thank you for shopping with CapShop. Your order has been received
            successfully and is now being processed.
          </p>

          <div className="capshop-order-id-box">
            <span className="capshop-order-id-label">Order ID</span>
            <span className="capshop-order-id-value">#{orderId}</span>
          </div>

          <div className="capshop-confirmation-info">
            <div className="capshop-info-card">
              <FaBoxOpen className="capshop-info-icon" />
              <div className="capshop-info-title">Order Processing</div>
              <p className="capshop-info-text">
                Your items are being prepared and will move to the next stage soon.
              </p>
            </div>

            <div className="capshop-info-card">
              <FaShoppingBag className="capshop-info-icon" />
              <div className="capshop-info-title">Track Your Purchase</div>
              <p className="capshop-info-text">
                You can check complete order details and status from your orders page.
              </p>
            </div>
          </div>

          <div className="capshop-confirmation-actions">
            <Button
              as={Link}
              to={`/orders/${orderId}`}
              className="capshop-btn capshop-primary-btn"
            >
              <FaClipboardList />
              View Order Details
            </Button>

            <Button
              as={Link}
              to="/orders"
              className="capshop-btn capshop-outline-btn"
            >
              <FaShoppingBag />
              My Orders
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export default OrderConfirmationPage;