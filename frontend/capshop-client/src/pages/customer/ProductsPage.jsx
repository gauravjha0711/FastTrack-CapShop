import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Pagination,
  Row,
  Spinner
} from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import ProductCard from "../../components/ProductCard";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(Number(searchParams.get("page")) || 1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(searchParams.get("categoryId") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 6;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [pageNumber, selectedCategoryId, sortBy]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/gateway/catalog/categories");
      setCategories(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/gateway/catalog/products", {
        params: {
          search,
          categoryId: selectedCategoryId || undefined,
          sortBy,
          pageNumber,
          pageSize
        }
      });

      setProducts(response.data.items);
      setTotalPages(response.data.totalPages);

      setSearchParams({
        ...(search ? { search } : {}),
        ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
        ...(sortBy ? { sortBy } : {}),
        page: pageNumber.toString()
      });
    } catch (err) {
      console.error(err);
      setError("Products load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setPageNumber(1);
    await fetchProducts();
  };

  const handleCategoryChange = (value) => {
    setSelectedCategoryId(value);
    setPageNumber(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setPageNumber(1);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategoryId("");
    setSortBy("latest");
    setPageNumber(1);
    setSearchParams({});
    navigate("/products");
  };

  const paginationItems = useMemo(() => {
    const items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === pageNumber}
          onClick={() => setPageNumber(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return items;
  }, [pageNumber, totalPages]);

  return (
    <div className="mt-4">
      <h2 className="mb-4">All Products</h2>

      <Row>
        <Col md={3}>
          <Card className="p-3 card-shadow mb-4">
            <h5 className="mb-3">Filters</h5>

            <Form onSubmit={handleSearchSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={selectedCategoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Sort By</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="latest">Latest</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="nameAsc">Name: A to Z</option>
                  <option value="nameDesc">Name: Z to A</option>
                </Form.Select>
              </Form.Group>

              <div className="d-grid gap-2">
                <Button type="submit" variant="primary">
                  Apply Search
                </Button>
                <Button type="button" variant="outline-secondary" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        <Col md={9}>
          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : products.length === 0 ? (
            <Alert variant="info">Koi product nahi mila.</Alert>
          ) : (
            <>
              <Row>
                {products.map((product) => (
                  <Col md={6} lg={4} className="mb-4" key={product.id}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>

              <div className="d-flex justify-content-center mt-3">
                <Pagination>{paginationItems}</Pagination>
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProductsPage;