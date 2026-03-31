import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaBoxOpen, FaTags } from "react-icons/fa";
import axiosInstance from "../../services/axiosInstance";
import ProductCard from "../../components/ProductCard";
import CategoryCard from "../../components/CategoryCard";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await axiosInstance.get("/gateway/catalog/featured");
      setFeaturedProducts(response.data || []);
    } catch (err) {
      console.error(err);
      setError("Featured products load nahi ho paaye.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axiosInstance.get("/gateway/catalog/categories");
      setCategories(response.data || []);
    } catch (err) {
      console.error(err);
      setError("Categories load nahi ho paayi.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?categoryId=${categoryId}`);
  };

  return (
    <>
      <style>
        {`
          .capshop-home-wrapper {
            padding-bottom: 32px;
          }

          .capshop-section {
            margin-top: 42px;
          }

          .capshop-section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 18px;
          }

          .capshop-section-title-wrap h3 {
            font-size: 1.7rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 4px;
          }

          .capshop-section-title-wrap p {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 0;
          }

          .capshop-section-btn {
            border-radius: 12px !important;
            padding: 10px 16px !important;
            font-weight: 700 !important;
          }

          .capshop-loading-box,
          .capshop-empty-box {
            min-height: 220px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            background: #ffffff;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
            text-align: center;
            padding: 24px;
          }

          .capshop-empty-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #eff6ff;
            color: #2563eb;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin-bottom: 14px;
          }

          .capshop-empty-box h5 {
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 8px;
          }

          .capshop-empty-box p {
            color: #64748b;
            font-size: 14px;
            max-width: 420px;
            margin-bottom: 16px;
          }

          .capshop-grid-row {
            margin-top: 4px;
          }

          @media (max-width: 768px) {
            .capshop-section {
              margin-top: 34px;
            }

            .capshop-section-title-wrap h3 {
              font-size: 1.35rem;
            }

            .capshop-section-title-wrap p {
              font-size: 13px;
            }
          }
        `}
      </style>

      <div className="capshop-home-wrapper">
        <div className="hero-section">
          <h1>Welcome to CapShop</h1>
          <p>Discover trendy, stylish and comfortable caps for every occasion.</p>
          <Button as={Link} to="/products" variant="light">
            Explore Products
          </Button>
        </div>

        {error && (
          <Alert variant="danger" className="mt-4 rounded-4 border-0 shadow-sm">
            {error}
          </Alert>
        )}

        <section className="capshop-section">
          <div className="capshop-section-header">
            <div className="capshop-section-title-wrap">
              <h3>Shop by Category</h3>
              <p>Browse products by category and find your style faster</p>
            </div>

            <Button
              as={Link}
              to="/products"
              variant="outline-primary"
              className="capshop-section-btn"
            >
              View All Products
            </Button>
          </div>

          {loadingCategories ? (
            <div className="capshop-loading-box">
              <Spinner animation="border" />
              <p className="text-muted mt-3 mb-0">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="capshop-empty-box">
              <div className="capshop-empty-icon">
                <FaTags />
              </div>
              <h5>No categories found</h5>
              <p>Categories abhi available nahi hain. Please thodi der baad check karo.</p>
            </div>
          ) : (
            <Row className="g-4 capshop-grid-row">
              {categories.map((category) => (
                <Col md={6} lg={4} key={category.id}>
                  <CategoryCard
                    category={category}
                    onClick={handleCategoryClick}
                  />
                </Col>
              ))}
            </Row>
          )}
        </section>

        <section className="capshop-section mb-4">
          <div className="capshop-section-header">
            <div className="capshop-section-title-wrap">
              <h3>Featured Products</h3>
              <p>Popular products selected specially for you</p>
            </div>

            <Button
              as={Link}
              to="/products"
              variant="outline-dark"
              className="capshop-section-btn"
            >
              Browse Catalog
            </Button>
          </div>

          {loadingProducts ? (
            <div className="capshop-loading-box">
              <Spinner animation="border" />
              <p className="text-muted mt-3 mb-0">Loading featured products...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="capshop-empty-box">
              <div className="capshop-empty-icon">
                <FaBoxOpen />
              </div>
              <h5>No featured products found</h5>
              <p>Featured products abhi available nahi hain. Aap full catalog browse kar sakte ho.</p>
              <Button as={Link} to="/products" variant="primary" className="capshop-section-btn">
                View Products
              </Button>
            </div>
          ) : (
            <Row className="g-4 capshop-grid-row">
              {featuredProducts.map((product) => (
                <Col md={6} lg={4} key={product.id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          )}
        </section>
      </div>
    </>
  );
};

export default HomePage;