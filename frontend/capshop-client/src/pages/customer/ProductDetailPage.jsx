import React, { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaStar,
} from "react-icons/fa";
import axiosInstance from "../../services/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { addToCart } from "../../services/cartService";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    fetchProductById();
  }, [id]);

  const fetchProductById = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(`/gateway/catalog/products/${id}`);
      setProduct(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load product details.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (value) => {
    if (!product) return;

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      setQuantity(1);
      return;
    }

    if (numericValue < 1) {
      setQuantity(1);
      return;
    }

    if (numericValue > product.stock) {
      setQuantity(product.stock);
      return;
    }

    setQuantity(numericValue);
  };

  const increaseQuantity = () => {
    if (!product || product.stock <= 0) return;
    setQuantity((prev) => Math.min(prev + 1, product.stock));
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Please login as customer first.");
      navigate("/login");
      return;
    }

    if (role !== "Customer") {
      alert("Only customers can add items to cart.");
      return;
    }

    try {
      setAdding(true);
      await addToCart(product.id, Number(quantity));
      alert("Item added to cart successfully.");
      navigate("/cart");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Add to cart failed.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="capshop-detail-loading">
        <Spinner animation="border" />
        <p className="mb-0 mt-3 text-muted">Loading product details...</p>

        <style>
          {`
            .capshop-detail-loading {
              min-height: 60vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4">
        <Alert variant="danger" className="rounded-4 shadow-sm border-0">
          {error}
        </Alert>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mt-4">
        <Alert variant="warning" className="rounded-4 shadow-sm border-0">
          Product not found.
        </Alert>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const imageSrc =
    !imgError && product.imageUrl
      ? product.imageUrl
      : "https://via.placeholder.com/700x500/f8fafc/64748b?text=CapShop+Product";

  return (
    <>
      <style>
        {`
          .capshop-detail-page {
            padding-top: 24px;
            padding-bottom: 32px;
          }

          .capshop-back-btn {
            border-radius: 12px !important;
            font-weight: 600 !important;
            padding: 9px 14px !important;
            display: inline-flex !important;
            align-items: center;
            gap: 8px;
            margin-bottom: 18px;
          }

          .capshop-detail-card {
            border: none !important;
            border-radius: 24px !important;
            overflow: hidden;
            background: #ffffff;
            box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
          }

          .capshop-image-panel {
            position: relative;
            height: 100%;
            background: linear-gradient(180deg, #f8fafc, #f1f5f9);
            padding: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .capshop-image-box {
            width: 100%;
            border-radius: 20px;
            overflow: hidden;
            background: #ffffff;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          }

          .capshop-product-image {
            width: 100%;
            height: 460px;
            object-fit: cover;
            display: block;
          }

          .capshop-image-badges {
            position: absolute;
            top: 18px;
            left: 18px;
            right: 18px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            pointer-events: none;
          }

          .capshop-floating-badge {
            border-radius: 999px;
            padding: 8px 14px;
            font-size: 12px;
            font-weight: 700;
            box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
          }

          .capshop-featured-badge {
            background: #fff7ed;
            color: #ea580c;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .capshop-stock-badge.in-stock {
            background: #dcfce7;
            color: #166534;
          }

          .capshop-stock-badge.out-stock {
            background: #fee2e2;
            color: #991b1b;
          }

          .capshop-info-panel {
            padding: 32px 30px;
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .capshop-category-badge {
            display: inline-block;
            width: fit-content;
            background: #eff6ff;
            color: #2563eb;
            border-radius: 999px;
            padding: 7px 13px;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 14px;
          }

          .capshop-product-title {
            font-size: 2rem;
            font-weight: 800;
            color: #0f172a;
            line-height: 1.25;
            margin-bottom: 10px;
          }

          .capshop-sub-info {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 18px;
          }

          .capshop-sub-pill {
            background: #f8fafc;
            color: #475569;
            border: 1px solid #e2e8f0;
            border-radius: 999px;
            padding: 7px 12px;
            font-size: 13px;
            font-weight: 600;
          }

          .capshop-price {
            font-size: 2rem;
            font-weight: 800;
            color: #111827;
            margin-bottom: 8px;
          }

          .capshop-price-note {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 22px;
          }

          .capshop-section-title {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 10px;
          }

          .capshop-description {
            color: #475569;
            font-size: 15px;
            line-height: 1.75;
            margin-bottom: 24px;
          }

          .capshop-quantity-wrapper {
            margin-bottom: 24px;
          }

          .capshop-quantity-box {
            display: inline-flex;
            align-items: center;
            border: 1px solid #dbe2ea;
            border-radius: 14px;
            overflow: hidden;
            background: #ffffff;
          }

          .capshop-qty-btn {
            width: 44px;
            height: 44px;
            border: none;
            background: #f8fafc;
            color: #0f172a;
            font-size: 14px;
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

          .capshop-qty-input {
            width: 70px !important;
            height: 44px;
            border: none !important;
            border-left: 1px solid #e2e8f0 !important;
            border-right: 1px solid #e2e8f0 !important;
            border-radius: 0 !important;
            text-align: center;
            font-weight: 700;
            box-shadow: none !important;
          }

          .capshop-action-row {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 6px;
          }

          .capshop-main-btn {
            min-width: 210px;
            border-radius: 14px !important;
            padding: 12px 18px !important;
            font-weight: 700 !important;
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            gap: 9px;
          }

          .capshop-add-btn {
            background: linear-gradient(90deg, #2563eb, #3b82f6) !important;
            border: none !important;
            box-shadow: 0 10px 22px rgba(37, 99, 235, 0.18);
          }

          .capshop-add-btn:hover:not(:disabled) {
            transform: translateY(-1px);
          }

          .capshop-add-btn:disabled {
            background: #cbd5e1 !important;
            color: #475569 !important;
            box-shadow: none !important;
          }

          .capshop-secondary-btn {
            border: 1px solid #dbeafe !important;
            color: #2563eb !important;
            background: #ffffff !important;
          }

          .capshop-secondary-btn:hover {
            background: #eff6ff !important;
            color: #1d4ed8 !important;
          }

          @media (max-width: 991px) {
            .capshop-product-image {
              height: 360px;
            }

            .capshop-info-panel {
              padding: 24px 22px;
            }

            .capshop-product-title {
              font-size: 1.7rem;
            }

            .capshop-price {
              font-size: 1.7rem;
            }
          }

          @media (max-width: 576px) {
            .capshop-image-panel {
              padding: 16px;
            }

            .capshop-product-image {
              height: 280px;
            }

            .capshop-product-title {
              font-size: 1.45rem;
            }

            .capshop-main-btn {
              width: 100%;
              min-width: unset;
            }

            .capshop-action-row {
              flex-direction: column;
            }
          }
        `}
      </style>

      <div className="capshop-detail-page">
        <Button
          variant="outline-secondary"
          className="capshop-back-btn"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
          Back
        </Button>

        <Card className="capshop-detail-card">
          <Row className="g-0">
            <Col lg={5}>
              <div className="capshop-image-panel">
                <div className="capshop-image-badges">
                  <div>
                    {product.isFeatured && (
                      <span className="capshop-floating-badge capshop-featured-badge">
                        <FaStar size={12} />
                        Featured
                      </span>
                    )}
                  </div>

                  <span
                    className={`capshop-floating-badge capshop-stock-badge ${
                      isOutOfStock ? "out-stock" : "in-stock"
                    }`}
                  >
                    {isOutOfStock ? "Out of Stock" : `${product.stock} In Stock`}
                  </span>
                </div>

                <div className="capshop-image-box">
                  <img
                    src={imageSrc}
                    alt={product.name}
                    className="capshop-product-image"
                    onError={() => setImgError(true)}
                  />
                </div>
              </div>
            </Col>

            <Col lg={7}>
              <div className="capshop-info-panel">
                <span className="capshop-category-badge">
                  {product.categoryName || "General"}
                </span>

                <h1 className="capshop-product-title">{product.name}</h1>

                <div className="capshop-sub-info">
                  <span className="capshop-sub-pill">
                    <FaBoxOpen className="me-2" />
                    {isOutOfStock ? "Unavailable now" : "Ready for order"}
                  </span>

                  <span className="capshop-sub-pill">
                    Product ID: {product.id}
                  </span>
                </div>

                <div className="capshop-price">₹{product.price}</div>
                <div className="capshop-price-note">
                  Inclusive of all taxes
                </div>

                <div className="capshop-section-title">Description</div>
                <p className="capshop-description">
                  {product.description || "No description available for this product."}
                </p>

                <div className="capshop-quantity-wrapper">
                  <div className="capshop-section-title">Quantity</div>

                  <div className="capshop-quantity-box">
                    <button
                      type="button"
                      className="capshop-qty-btn"
                      onClick={decreaseQuantity}
                      disabled={isOutOfStock || quantity <= 1}
                    >
                      <FaMinus size={12} />
                    </button>

                    <Form.Control
                      type="number"
                      min="1"
                      max={product.stock > 0 ? product.stock : 1}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      disabled={isOutOfStock}
                      className="capshop-qty-input"
                    />

                    <button
                      type="button"
                      className="capshop-qty-btn"
                      onClick={increaseQuantity}
                      disabled={isOutOfStock || quantity >= product.stock}
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                </div>

                <div className="capshop-action-row">
                  <Button
                    className="capshop-main-btn capshop-add-btn"
                    disabled={isOutOfStock || adding}
                    onClick={handleAddToCart}
                  >
                    {isOutOfStock ? (
                      "Unavailable"
                    ) : adding ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <FaShoppingCart />
                        Add to Cart
                      </>
                    )}
                  </Button>

                  <Button
                    variant="light"
                    className="capshop-main-btn capshop-secondary-btn"
                    onClick={() => navigate("/products")}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </>
  );
};

export default ProductDetailPage;