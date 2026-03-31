import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Image,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaMinus,
  FaPlus,
  FaShoppingBag,
  FaTrashAlt,
} from "react-icons/fa";
import {
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from "../../services/cartService";

const CartPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState({
    cartId: 0,
    userId: 0,
    items: [],
    totalAmount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
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
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load cart.");
    } finally {
      setLoading(false);
    }
  };

  const handleIncrease = async (item) => {
    try {
      setUpdatingItemId(item.id);
      await updateCartItemQuantity(item.id, item.quantity + 1);
      await fetchCart();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Quantity update failed.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDecrease = async (item) => {
    if (item.quantity <= 1) return;

    try {
      setUpdatingItemId(item.id);
      await updateCartItemQuantity(item.id, item.quantity - 1);
      await fetchCart();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Quantity update failed.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      setUpdatingItemId(itemId);
      await removeCartItem(itemId);
      await fetchCart();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Remove failed.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleStartCheckout = () => {
    navigate("/checkout");
  };

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <>
        <style>
          {`
            .capshop-cart-loading {
              min-height: 60vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
          `}
        </style>

        <div className="capshop-cart-loading">
          <Spinner animation="border" />
          <p className="text-muted mt-3 mb-0">Loading your cart...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>
        {`
          .capshop-cart-page {
            padding-top: 24px;
            padding-bottom: 32px;
          }

          .capshop-cart-header {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 22px;
          }

          .capshop-cart-title-wrap h2 {
            font-size: 2rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 4px;
          }

          .capshop-cart-subtitle {
            color: #64748b;
            margin-bottom: 0;
            font-size: 14px;
          }

          .capshop-outline-btn {
            border-radius: 12px !important;
            padding: 10px 16px !important;
            font-weight: 600 !important;
            display: inline-flex !important;
            align-items: center;
            gap: 8px;
          }

          .capshop-cart-item {
            border: none !important;
            border-radius: 20px !important;
            background: #ffffff;
            box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
            padding: 18px;
            margin-bottom: 18px;
            transition: all 0.25s ease;
          }

          .capshop-cart-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
          }

          .capshop-cart-image {
            width: 100%;
            height: 110px;
            object-fit: cover;
            border-radius: 16px;
            background: #f8fafc;
          }

          .capshop-product-name {
            font-size: 1.08rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 6px;
          }

          .capshop-unit-price {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 6px;
          }

          .capshop-price-strong {
            color: #111827;
            font-weight: 800;
            font-size: 1.1rem;
            margin: 0;
          }

          .capshop-qty-label {
            font-size: 13px;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 8px;
          }

          .capshop-qty-box {
            display: inline-flex;
            align-items: center;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            background: #ffffff;
          }

          .capshop-qty-btn {
            width: 38px;
            height: 38px;
            border: none;
            background: #f8fafc;
            color: #0f172a;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.2s ease;
          }

          .capshop-qty-btn:hover:not(:disabled) {
            background: #eff6ff;
            color: #2563eb;
          }

          .capshop-qty-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .capshop-qty-value {
            min-width: 42px;
            text-align: center;
            font-weight: 700;
            color: #0f172a;
            padding: 0 10px;
          }

          .capshop-remove-btn {
            border-radius: 12px !important;
            font-weight: 600 !important;
            padding: 9px 12px !important;
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }

          .capshop-summary-card {
            border: none !important;
            border-radius: 22px !important;
            background: #ffffff;
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
            padding: 24px;
            position: sticky;
            top: 90px;
          }

          .capshop-summary-title {
            font-size: 1.4rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 18px;
          }

          .capshop-summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            color: #475569;
            font-size: 15px;
          }

          .capshop-summary-total {
            padding-top: 16px;
            margin-top: 16px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .capshop-summary-total span {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
          }

          .capshop-summary-total strong {
            font-size: 1.4rem;
            color: #111827;
          }

          .capshop-summary-note {
            margin-top: 12px;
            font-size: 13px;
            color: #64748b;
          }

          .capshop-checkout-btn {
            width: 100%;
            margin-top: 20px;
            border: none !important;
            border-radius: 14px !important;
            padding: 12px 16px !important;
            font-weight: 700 !important;
            background: linear-gradient(90deg, #2563eb, #3b82f6) !important;
            box-shadow: 0 10px 24px rgba(37, 99, 235, 0.18);
          }

          .capshop-checkout-btn:hover {
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
            width: 84px;
            height: 84px;
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

          .capshop-item-right {
            text-align: right;
          }

          @media (max-width: 991px) {
            .capshop-summary-card {
              position: static;
              margin-top: 8px;
            }

            .capshop-item-right {
              text-align: left;
              margin-top: 14px;
            }
          }

          @media (max-width: 767px) {
            .capshop-cart-item {
              padding: 16px;
            }

            .capshop-cart-image {
              height: 180px;
              margin-bottom: 14px;
            }

            .capshop-cart-header {
              align-items: flex-start;
            }

            .capshop-cart-title-wrap h2 {
              font-size: 1.65rem;
            }
          }
        `}
      </style>

      <div className="capshop-cart-page">
        <div className="capshop-cart-header">
          <div className="capshop-cart-title-wrap">
            <h2>My Cart</h2>
            <p className="capshop-cart-subtitle">
              Review your selected products before checkout
            </p>
          </div>

          <Button
            variant="outline-secondary"
            className="capshop-outline-btn"
            onClick={() => navigate("/products")}
          >
            <FaArrowLeft />
            Continue Shopping
          </Button>
        </div>

        {error && (
          <Alert variant="danger" className="rounded-4 border-0 shadow-sm">
            {error}
          </Alert>
        )}

        {cart.items.length === 0 ? (
          <Card className="capshop-empty-card">
            <div className="capshop-empty-icon">
              <FaShoppingBag />
            </div>
            <div className="capshop-empty-title">Your cart is empty</div>
            <div className="capshop-empty-text">
              Looks like you have not added any products yet.
            </div>
            <div>
              <Button
                variant="primary"
                className="capshop-checkout-btn"
                style={{ maxWidth: "260px" }}
                onClick={() => navigate("/products")}
              >
                Browse Products
              </Button>
            </div>
          </Card>
        ) : (
          <Row className="g-4">
            <Col lg={8}>
              {cart.items.map((item) => (
                <Card className="capshop-cart-item" key={item.id}>
                  <Row className="align-items-center g-3">
                    <Col md={3} sm={4}>
                      <Image
                        src={
                          item.productImageUrl ||
                          "https://via.placeholder.com/300x220/f8fafc/64748b?text=Product"
                        }
                        alt={item.productName}
                        className="capshop-cart-image"
                        fluid
                      />
                    </Col>

                    <Col md={4} sm={8}>
                      <h5 className="capshop-product-name">{item.productName}</h5>
                      <p className="capshop-unit-price mb-1">
                        Unit Price: ₹{item.unitPrice}
                      </p>
                      <p className="text-muted small mb-0">
                        Product added to your cart
                      </p>
                    </Col>

                    <Col md={3} sm={6}>
                      <div className="capshop-qty-label">Quantity</div>
                      <div className="capshop-qty-box">
                        <button
                          className="capshop-qty-btn"
                          onClick={() => handleDecrease(item)}
                          disabled={
                            updatingItemId === item.id || item.quantity <= 1
                          }
                        >
                          <FaMinus size={11} />
                        </button>

                        <span className="capshop-qty-value">{item.quantity}</span>

                        <button
                          className="capshop-qty-btn"
                          onClick={() => handleIncrease(item)}
                          disabled={updatingItemId === item.id}
                        >
                          {updatingItemId === item.id ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <FaPlus size={11} />
                          )}
                        </button>
                      </div>
                    </Col>

                    <Col md={2} sm={6}>
                      <div className="capshop-item-right">
                        <p className="capshop-price-strong mb-3">
                          ₹{item.lineTotal}
                        </p>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="capshop-remove-btn"
                          onClick={() => handleRemove(item.id)}
                          disabled={updatingItemId === item.id}
                        >
                          {updatingItemId === item.id ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <>
                              <FaTrashAlt />
                              Remove
                            </>
                          )}
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Col>

            <Col lg={4}>
              <Card className="capshop-summary-card">
                <div className="capshop-summary-title">Order Summary</div>

                <div className="capshop-summary-row">
                  <span>Total Items</span>
                  <span>{totalItems}</span>
                </div>

                <div className="capshop-summary-row">
                  <span>Products</span>
                  <span>{cart.items.length}</span>
                </div>

                <div className="capshop-summary-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>

                <div className="capshop-summary-total">
                  <span>Total Amount</span>
                  <strong>₹{cart.totalAmount}</strong>
                </div>

                <p className="capshop-summary-note">
                  Taxes and discounts will be applied at checkout if available.
                </p>

                <Button
                  className="capshop-checkout-btn"
                  onClick={handleStartCheckout}
                >
                  Proceed to Checkout
                </Button>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </>
  );
};

export default CartPage;