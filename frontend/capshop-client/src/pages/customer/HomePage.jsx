import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
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
      setFeaturedProducts(response.data);
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
      setCategories(response.data);
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
      <div className="hero-section">
        <h1>Welcome to CapShop</h1>
        <p>Discover trendy, stylish and comfortable caps for every occasion.</p>
        <Button as={Link} to="/products" variant="light">
          Explore Products
        </Button>
      </div>

      {error && <Alert variant="danger" className="mt-4">{error}</Alert>}

      <section className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Shop by Category</h3>
          <Button as={Link} to="/products" variant="outline-primary">
            View All Products
          </Button>
        </div>

        {loadingCategories ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : (
          <Row>
            {categories.map((category) => (
              <Col md={4} className="mb-4" key={category.id}>
                <CategoryCard category={category} onClick={handleCategoryClick} />
              </Col>
            ))}
          </Row>
        )}
      </section>

      <section className="mt-5 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Featured Products</h3>
          <Button as={Link} to="/products" variant="outline-dark">
            Browse Catalog
          </Button>
        </div>

        {loadingProducts ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : (
          <Row>
            {featuredProducts.map((product) => (
              <Col md={4} className="mb-4" key={product.id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
      </section>
    </>
  );
};

export default HomePage;