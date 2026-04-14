import React, { useState } from "react";
import { Badge, Button, Card, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addToCart } from "../services/cartService";
import { FaShoppingCart, FaEye, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login as customer first.");
      navigate("/login");
      return;
    }

    if (role !== "Customer") {
      toast.error("Only customers can add items to cart.");
      return;
    }

    try {
      setAdding(true);
      await addToCart(product.id, 1);
      toast.success("Item added to cart successfully.");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Add to cart failed.");
    } finally {
      setAdding(false);
    }
  };

  const imageSrc =
    !imgError && product.imageUrl
      ? product.imageUrl
      : "https://via.placeholder.com/500x350/f8fafc/64748b?text=CapShop+Product";

  return (
    <>
      <style>
        {`
          .capshop-product-card {
            border: none;
            border-radius: 18px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
            transition: all 0.28s ease;
            height: 100%;
          }

          .capshop-product-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 18px 36px rgba(15, 23, 42, 0.14);
          }

          .capshop-product-image-wrap {
            position: relative;
            overflow: hidden;
            background: #f8fafc;
          }

          .capshop-product-image {
            width: 100%;
            height: 220px;
            object-fit: cover;
            transition: transform 0.35s ease;
          }

          .capshop-product-card:hover .capshop-product-image {
            transform: scale(1.04);
          }

          .capshop-top-badges {
            position: absolute;
            top: 12px;
            left: 12px;
            right: 12px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            z-index: 2;
          }

          .capshop-badge-soft {
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 600;
            backdrop-filter: blur(8px);
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
          }

          .capshop-featured {
            background: rgba(255, 255, 255, 0.92);
            color: #f59e0b;
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }

          .capshop-stock {
            color: #fff;
          }

          .capshop-stock.in {
            background: #16a34a;
          }

          .capshop-stock.out {
            background: #dc2626;
          }

          .capshop-card-body {
            padding: 18px;
            display: flex;
            flex-direction: column;
          }

          .capshop-category {
            display: inline-block;
            background: #eff6ff;
            color: #2563eb;
            font-size: 12px;
            font-weight: 600;
            border-radius: 999px;
            padding: 5px 10px;
            margin-bottom: 10px;
            width: fit-content;
          }

          .capshop-title {
            font-size: 1rem;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.4;
            margin-bottom: 8px;
            min-height: 44px;
          }

          .capshop-description {
            color: #64748b;
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 14px;
            min-height: 42px;
          }

          .capshop-price-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          }

          .capshop-price {
            font-size: 1.35rem;
            font-weight: 800;
            color: #111827;
            margin: 0;
          }

          .capshop-price-note {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
          }

          .capshop-btn-group {
            display: grid;
            gap: 10px;
            margin-top: auto;
          }

          .capshop-btn {
            border-radius: 12px !important;
            padding: 10px 14px !important;
            font-weight: 600 !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .capshop-btn-view {
            background: #ffffff !important;
            border: 1px solid #dbeafe !important;
            color: #2563eb !important;
          }

          .capshop-btn-view:hover {
            background: #eff6ff !important;
            border-color: #bfdbfe !important;
            color: #1d4ed8 !important;
          }

          .capshop-btn-cart {
            background: linear-gradient(90deg, #2563eb, #3b82f6) !important;
            border: none !important;
            color: white !important;
            box-shadow: 0 8px 18px rgba(37, 99, 235, 0.2);
          }

          .capshop-btn-cart:hover:not(:disabled) {
            transform: translateY(-1px);
          }

          .capshop-btn-cart:disabled {
            background: #cbd5e1 !important;
            color: #475569 !important;
            box-shadow: none !important;
          }
        `}
      </style>

      <Card className="capshop-product-card">
        <div className="capshop-product-image-wrap">
          <Card.Img
            variant="top"
            src={imageSrc}
            alt={product.name}
            className="capshop-product-image"
            onError={() => setImgError(true)}
          />

          <div className="capshop-top-badges">
            <div>
              {product.isFeatured && (
                <span className="capshop-badge-soft capshop-featured">
                  <FaStar size={11} />
                  Featured
                </span>
              )}
            </div>

            <span
              className={`capshop-badge-soft capshop-stock ${
                isOutOfStock ? "out" : "in"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : `${product.stock} Left`}
            </span>
          </div>
        </div>

        <Card.Body className="capshop-card-body">
          <span className="capshop-category">
            {product.categoryName || "General"}
          </span>

          <div className="capshop-title">{product.name}</div>

          <div className="capshop-description">
            {product.description?.length > 72
              ? `${product.description.substring(0, 72)}...`
              : product.description || "No description available."}
          </div>

          <div className="capshop-price-row">
            <h5 className="capshop-price">₹{product.price}</h5>
            <span className="capshop-price-note">
              {isOutOfStock ? "Unavailable" : "Ready to order"}
            </span>
          </div>

          <div className="capshop-btn-group">
            <Button
              as={Link}
              to={`/products/${product.id}`}
              className="capshop-btn capshop-btn-view"
            >
              <FaEye />
              View Details
            </Button>

            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              className="capshop-btn capshop-btn-cart"
            >
              {adding ? (
                <>
                  <Spinner animation="border" size="sm" />
                  Adding...
                </>
              ) : isOutOfStock ? (
                "Unavailable"
              ) : (
                <>
                  <FaShoppingCart />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default ProductCard;