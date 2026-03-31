import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Pagination,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaBoxOpen,
  FaFilter,
  FaRedoAlt,
  FaSearch,
  FaSlidersH,
  FaTags,
} from "react-icons/fa";
import axiosInstance from "../../services/axiosInstance";
import ProductCard from "../../components/ProductCard";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    searchParams.get("categoryId") || ""
  );
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
      setCategories(response.data || []);
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
          pageSize,
        },
      });

      setProducts(response.data.items || []);
      setTotalPages(response.data.totalPages || 1);

      setSearchParams({
        ...(search ? { search } : {}),
        ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
        ...(sortBy ? { sortBy } : {}),
        page: pageNumber.toString(),
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load products.");
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
    <>
      <style>
        {`
          .capshop-products-page {
            padding-top: 24px;
            padding-bottom: 32px;
          }

          .capshop-products-hero {
            border: none !important;
            border-radius: 24px !important;
            background: linear-gradient(135deg, #ffffff, #f8fbff);
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
            padding: 28px;
            margin-bottom: 24px;
          }

          .capshop-products-title {
            font-size: 2rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 8px;
          }

          .capshop-products-subtitle {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 0;
            max-width: 720px;
          }

          .capshop-filter-card,
          .capshop-products-card {
            border: none !important;
            border-radius: 22px !important;
            background: #ffffff;
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
          }

          .capshop-filter-card {
            padding: 22px;
            position: sticky;
            top: 90px;
          }

          .capshop-filter-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.2rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 18px;
          }

          .capshop-filter-label {
            font-size: 14px;
            font-weight: 700;
            color: #334155;
            margin-bottom: 8px;
          }

          .capshop-search-input-group {
            position: relative;
          }

          .capshop-search-icon {
            position: absolute;
            top: 50%;
            left: 14px;
            transform: translateY(-50%);
            color: #94a3b8;
            z-index: 2;
          }

          .capshop-input,
          .capshop-select {
            border-radius: 14px !important;
            border: 1px solid #dbe2ea !important;
            padding: 12px 14px !important;
            box-shadow: none !important;
          }

          .capshop-search-input {
            padding-left: 40px !important;
          }

          .capshop-input:focus,
          .capshop-select:focus {
            border-color: #93c5fd !important;
            box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.08) !important;
          }

          .capshop-filter-actions {
            display: grid;
            gap: 10px;
          }

          .capshop-btn {
            border-radius: 14px !important;
            padding: 11px 16px !important;
            font-weight: 700 !important;
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .capshop-primary-btn {
            background: linear-gradient(90deg, #2563eb, #3b82f6) !important;
            border: none !important;
            box-shadow: 0 10px 22px rgba(37, 99, 235, 0.16);
          }

          .capshop-outline-btn {
            background: #ffffff !important;
            color: #2563eb !important;
            border: 1px solid #dbeafe !important;
          }

          .capshop-outline-btn:hover {
            background: #eff6ff !important;
            color: #1d4ed8 !important;
          }

          .capshop-products-topbar {
            border: none !important;
            border-radius: 20px !important;
            background: #ffffff;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
            padding: 18px 20px;
            margin-bottom: 18px;
          }

          .capshop-results-title {
            font-size: 1.05rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 4px;
          }

          .capshop-results-subtitle {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 0;
          }

          .capshop-result-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            color: #475569;
            border-radius: 999px;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: 600;
          }

          .capshop-loading-wrap,
          .capshop-empty-wrap {
            min-height: 380px;
            border: none !important;
            border-radius: 22px !important;
            background: #ffffff;
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px 20px;
            text-align: center;
          }

          .capshop-empty-icon {
            width: 84px;
            height: 84px;
            border-radius: 50%;
            background: #eff6ff;
            color: #2563eb;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            margin-bottom: 18px;
          }

          .capshop-empty-title {
            font-size: 1.45rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 10px;
          }

          .capshop-empty-text {
            color: #64748b;
            font-size: 15px;
            margin-bottom: 20px;
            max-width: 460px;
          }

          .capshop-products-grid {
            margin-top: 4px;
          }

          .capshop-pagination-wrap {
            display: flex;
            justify-content: center;
            margin-top: 12px;
          }

          .pagination .page-item .page-link {
            border-radius: 12px !important;
            margin: 0 4px;
            border: 1px solid #e2e8f0;
            color: #2563eb;
            min-width: 42px;
            text-align: center;
            box-shadow: none !important;
          }

          .pagination .page-item.active .page-link {
            background: linear-gradient(90deg, #2563eb, #3b82f6);
            border-color: #2563eb;
            color: white;
          }

          .pagination .page-item .page-link:hover {
            background: #eff6ff;
            border-color: #bfdbfe;
            color: #1d4ed8;
          }

          @media (max-width: 991px) {
            .capshop-filter-card {
              position: static;
              margin-bottom: 18px;
            }
          }

          @media (max-width: 767px) {
            .capshop-products-title {
              font-size: 1.65rem;
            }

            .capshop-products-hero,
            .capshop-filter-card,
            .capshop-products-topbar {
              padding: 20px;
            }
          }
        `}
      </style>

      <div className="capshop-products-page">
        <Card className="capshop-products-hero">
          <h2 className="capshop-products-title">Explore Our Products</h2>
          <p className="capshop-products-subtitle">
            Discover the latest collections, trending essentials, and everyday
            favorites. Use filters to quickly find products that match your
            style and needs.
          </p>
        </Card>

        <Row className="g-4">
          <Col lg={3}>
            <Card className="capshop-filter-card">
              <div className="capshop-filter-title">
                <FaFilter />
                Filters
              </div>

              <Form onSubmit={handleSearchSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="capshop-filter-label">
                    Search Products
                  </Form.Label>
                  <div className="capshop-search-input-group">
                    <FaSearch className="capshop-search-icon" />
                    <Form.Control
                      type="text"
                      placeholder="Search by product name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="capshop-input capshop-search-input"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="capshop-filter-label">
                    Category
                  </Form.Label>
                  <Form.Select
                    value={selectedCategoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="capshop-select"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="capshop-filter-label">
                    Sort By
                  </Form.Label>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="capshop-select"
                  >
                    <option value="latest">Latest</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="nameAsc">Name: A to Z</option>
                    <option value="nameDesc">Name: Z to A</option>
                  </Form.Select>
                </Form.Group>

                <div className="capshop-filter-actions">
                  <Button type="submit" className="capshop-btn capshop-primary-btn">
                    <FaSearch />
                    Apply Search
                  </Button>

                  <Button
                    type="button"
                    className="capshop-btn capshop-outline-btn"
                    onClick={resetFilters}
                  >
                    <FaRedoAlt />
                    Reset Filters
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>

          <Col lg={9}>
            {error && (
              <Alert variant="danger" className="rounded-4 border-0 shadow-sm">
                {error}
              </Alert>
            )}

            <Card className="capshop-products-topbar">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                  <div className="capshop-results-title">Product Results</div>
                  <p className="capshop-results-subtitle">
                    Browse available products and choose your favorites
                  </p>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <span className="capshop-result-pill">
                    <FaBoxOpen />
                    {products.length} products on this page
                  </span>

                  <span className="capshop-result-pill">
                    <FaTags />
                    {selectedCategoryId ? "Filtered by category" : "All categories"}
                  </span>

                  <span className="capshop-result-pill">
                    <FaSlidersH />
                    Sort: {sortBy}
                  </span>
                </div>
              </div>
            </Card>

            {loading ? (
              <Card className="capshop-loading-wrap">
                <Spinner animation="border" />
                <p className="text-muted mt-3 mb-0">Loading products...</p>
              </Card>
            ) : products.length === 0 ? (
              <Card className="capshop-empty-wrap">
                <div className="capshop-empty-icon">
                  <FaBoxOpen />
                </div>
                <div className="capshop-empty-title">No products found</div>
                <div className="capshop-empty-text">
                  We could not find any products matching your current filters.
                  Try changing the search keyword, category, or sorting option.
                </div>
                <Button
                  className="capshop-btn capshop-primary-btn"
                  onClick={resetFilters}
                >
                  <FaRedoAlt />
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <>
                <Row className="g-4 capshop-products-grid">
                  {products.map((product) => (
                    <Col md={6} xl={4} key={product.id}>
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>

                {totalPages > 1 && (
                  <div className="capshop-pagination-wrap">
                    <Pagination>{paginationItems}</Pagination>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
};

export default ProductsPage;