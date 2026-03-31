import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Modal,
  ProgressBar,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  createAdminProduct,
  deactivateAdminProduct,
  getAdminProducts,
  updateAdminProduct,
  updateAdminStock,
} from "../../services/adminService";

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
  imageUrl: "",
  isFeatured: false,
  isActive: true,
};

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockValue, setStockValue] = useState("");
  const [selectedStockProduct, setSelectedStockProduct] = useState(null);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let updated = [...products];

    if (searchTerm.trim()) {
      const keyword = searchTerm.toLowerCase();
      updated = updated.filter(
        (product) =>
          product.name?.toLowerCase().includes(keyword) ||
          product.categoryName?.toLowerCase().includes(keyword) ||
          product.description?.toLowerCase().includes(keyword)
      );
    }

    if (statusFilter === "active") {
      updated = updated.filter((product) => product.isActive);
    } else if (statusFilter === "inactive") {
      updated = updated.filter((product) => !product.isActive);
    }

    if (featuredFilter === "featured") {
      updated = updated.filter((product) => product.isFeatured);
    } else if (featuredFilter === "not-featured") {
      updated = updated.filter((product) => !product.isFeatured);
    }

    setFilteredProducts(updated);
  }, [products, searchTerm, statusFilter, featuredFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminProducts();
      setProducts(Array.isArray(data) ? data : []);
      setFilteredProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Products load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive).length;
    const inactiveProducts = products.filter((p) => !p.isActive).length;
    const featuredProducts = products.filter((p) => p.isFeatured).length;
    const lowStockProducts = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 10).length;
    const outOfStockProducts = products.filter((p) => Number(p.stock) === 0).length;

    const totalStockValue = products.reduce(
      (sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0),
      0
    );

    const activationRate =
      totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0;

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      featuredProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue,
      activationRate,
    };
  }, [products]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStockBadge = (stock) => {
    const numericStock = Number(stock);

    if (numericStock === 0) {
      return <Badge bg="danger" className="rounded-pill px-3 py-2">Out of Stock</Badge>;
    }

    if (numericStock <= 10) {
      return <Badge bg="warning" text="dark" className="rounded-pill px-3 py-2">Low Stock</Badge>;
    }

    return <Badge bg="success" className="rounded-pill px-3 py-2">In Stock</Badge>;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge bg="success" className="rounded-pill px-3 py-2">Active</Badge>
    ) : (
      <Badge bg="secondary" className="rounded-pill px-3 py-2">Inactive</Badge>
    );
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData(initialForm);
    setModalError("");
    setShowModal(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setModalError("");
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      categoryId: product.categoryId ?? "",
      imageUrl: product.imageUrl || "",
      isFeatured: !!product.isFeatured,
      isActive: !!product.isActive,
    });
    setShowModal(true);
  };

  const handleOpenStockModal = (product) => {
    setSelectedStockProduct(product);
    setStockValue(product.stock?.toString() || "0");
    setModalError("");
    setShowStockModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData(initialForm);
    setEditingProduct(null);
    setModalError("");
  };

  const handleCloseStockModal = () => {
    setShowStockModal(false);
    setSelectedStockProduct(null);
    setStockValue("");
    setModalError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Product name is required.";
    if (!formData.description.trim()) return "Description is required.";
    if (formData.price === "" || Number(formData.price) < 0) return "Valid price is required.";
    if (formData.stock === "" || Number(formData.stock) < 0) return "Valid stock is required.";
    if (formData.categoryId === "" || Number(formData.categoryId) <= 0) return "Valid category id is required.";
    return "";
  };

  const handleSave = async () => {
    try {
      const validationError = validateForm();
      if (validationError) {
        setModalError(validationError);
        return;
      }

      setSaving(true);
      setModalError("");

      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        categoryId: Number(formData.categoryId),
      };

      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
      } else {
        await createAdminProduct(payload);
      }

      handleCloseModal();
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    const confirmed = window.confirm("Are you sure you want to deactivate this product?");
    if (!confirmed) return;

    try {
      await deactivateAdminProduct(id);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Deactivate failed.");
    }
  };

  const handleStockUpdate = async () => {
    if (!selectedStockProduct) return;

    if (stockValue === "" || Number(stockValue) < 0) {
      setModalError("Please enter a valid stock value.");
      return;
    }

    try {
      setSaving(true);
      setModalError("");
      await updateAdminStock(selectedStockProduct.id, Number(stockValue));
      handleCloseStockModal();
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Stock update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-3 mb-0 text-muted">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <div
        className="p-4 p-md-5 mb-4 rounded-4 text-white shadow-sm"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)",
        }}
      >
        <Row className="align-items-center">
          <Col lg={8}>
            <h2 className="fw-bold mb-2">Product Management</h2>
            <p className="mb-0 text-white-50" style={{ maxWidth: "760px" }}>
              Manage your product catalog, update stock, track inventory health,
              and maintain a clean, professional admin workflow.
            </p>
          </Col>
          <Col lg={4} className="text-lg-end mt-3 mt-lg-0">
            <div className="d-flex gap-2 justify-content-lg-end flex-wrap">
              <Button variant="light" className="fw-semibold px-4" onClick={fetchProducts}>
                Refresh
              </Button>
              <Button variant="warning" className="fw-semibold px-4" onClick={handleOpenCreate}>
                + Add Product
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {error && (
        <Alert variant="danger" className="rounded-4 shadow-sm">
          {error}
        </Alert>
      )}

      <Row className="g-4 mb-4">
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-2 fw-semibold">Total Products</p>
                  <h2 className="fw-bold mb-1">{analytics.totalProducts}</h2>
                  <small className="text-muted">Catalog items</small>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "#e0f2fe",
                    fontSize: "22px",
                  }}
                >
                  📦
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-2 fw-semibold">Active Products</p>
                  <h2 className="fw-bold mb-1">{analytics.activeProducts}</h2>
                  <small className="text-success fw-semibold">
                    {analytics.activationRate}% active rate
                  </small>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "#dcfce7",
                    fontSize: "22px",
                  }}
                >
                  ✅
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar
                  now={analytics.activationRate}
                  style={{ height: "8px", borderRadius: "999px" }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-2 fw-semibold">Featured Products</p>
                  <h2 className="fw-bold mb-1">{analytics.featuredProducts}</h2>
                  <small className="text-muted">Promoted items</small>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "#fef3c7",
                    fontSize: "22px",
                  }}
                >
                  ⭐
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-2 fw-semibold">Inventory Value</p>
                  <h2 className="fw-bold mb-1">{formatCurrency(analytics.totalStockValue)}</h2>
                  <small className="text-muted">Approx stock worth</small>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "#ede9fe",
                    fontSize: "22px",
                  }}
                >
                  💰
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                  <h4 className="fw-bold mb-1">Catalog Controls</h4>
                  <p className="text-muted mb-0">
                    Search, filter, and manage products faster
                  </p>
                </div>
              </div>

              <Row className="g-3">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Search Products</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>🔍</InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search by name, category, description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Status Filter</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Products</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Featured Filter</Form.Label>
                    <Form.Select
                      value={featuredFilter}
                      onChange={(e) => setFeaturedFilter(e.target.value)}
                    >
                      <option value="all">All Products</option>
                      <option value="featured">Featured Only</option>
                      <option value="not-featured">Not Featured</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h4 className="fw-bold mb-1">Inventory Alerts</h4>
              <p className="text-muted mb-4">Quick stock health snapshot</p>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-semibold">Low Stock</span>
                  <span className="text-muted">{analytics.lowStockProducts} products</span>
                </div>
                <ProgressBar
                  variant="warning"
                  now={
                    analytics.totalProducts > 0
                      ? Math.round((analytics.lowStockProducts / analytics.totalProducts) * 100)
                      : 0
                  }
                  style={{ height: "10px", borderRadius: "999px" }}
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-semibold">Out of Stock</span>
                  <span className="text-muted">{analytics.outOfStockProducts} products</span>
                </div>
                <ProgressBar
                  variant="danger"
                  now={
                    analytics.totalProducts > 0
                      ? Math.round((analytics.outOfStockProducts / analytics.totalProducts) * 100)
                      : 0
                  }
                  style={{ height: "10px", borderRadius: "999px" }}
                />
              </div>

              <div
                className="rounded-4 p-3"
                style={{ backgroundColor: "#f8fafc", border: "1px solid #e5e7eb" }}
              >
                <p className="text-muted mb-1">Filtered Results</p>
                <h3 className="fw-bold mb-0">{filteredProducts.length}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <h4 className="fw-bold mb-1">Product Catalog</h4>
              <p className="text-muted mb-0">
                Complete list of products with real-time admin actions
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead style={{ backgroundColor: "#f8fafc" }}>
                <tr>
                  <th className="py-3">Product</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Price</th>
                  <th className="py-3">Stock</th>
                  <th className="py-3">Featured</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-3 overflow-hidden border"
                            style={{
                              width: "56px",
                              height: "56px",
                              backgroundColor: "#f8fafc",
                              flexShrink: 0,
                            }}
                          >
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                                📦
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="fw-semibold">{product.name}</div>
                            <small className="text-muted">
                              ID: #{product.id}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{product.categoryName || `Category ${product.categoryId}`}</td>
                      <td className="fw-semibold">{formatCurrency(product.price)}</td>
                      <td>
                        <div className="fw-semibold">{product.stock}</div>
                        <div className="mt-1">{getStockBadge(product.stock)}</div>
                      </td>
                      <td>
                        {product.isFeatured ? (
                          <Badge bg="warning" text="dark" className="rounded-pill px-3 py-2">
                            Featured
                          </Badge>
                        ) : (
                          <Badge bg="light" text="dark" className="rounded-pill px-3 py-2 border">
                            Regular
                          </Badge>
                        )}
                      </td>
                      <td>{getStatusBadge(product.isActive)}</td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center flex-wrap">
                          <Button
                            size="sm"
                            variant="primary"
                            className="rounded-pill px-3"
                            onClick={() => handleOpenEdit(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="warning"
                            className="rounded-pill px-3"
                            onClick={() => handleOpenStockModal(product)}
                          >
                            Stock
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            className="rounded-pill px-3"
                            onClick={() => handleDeactivate(product.id)}
                            disabled={!product.isActive}
                          >
                            Deactivate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No products found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-3">
          {modalError && (
            <Alert variant="danger" className="rounded-4">
              {modalError}
            </Alert>
          )}

          <Form>
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Product Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Category Id</Form.Label>
                  <Form.Control
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    placeholder="Enter category id"
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Price</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>₹</InputGroup.Text>
                    <Form.Control
                      name="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Enter price"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Stock</Form.Label>
                  <Form.Control
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="Enter stock"
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Image URL</Form.Label>
                  <Form.Control
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="Enter image url"
                  />
                </Form.Group>
              </Col>

              {formData.imageUrl && (
                <Col md={12}>
                  <div
                    className="rounded-4 border p-3"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <p className="fw-semibold mb-2">Image Preview</p>
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      style={{
                        maxWidth: "140px",
                        height: "140px",
                        objectFit: "cover",
                        borderRadius: "16px",
                        border: "1px solid #dee2e6",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                </Col>
              )}

              <Col md={6}>
                <Form.Check
                  type="switch"
                  label="Featured Product"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
              </Col>

              {editingProduct && (
                <Col md={6}>
                  <Form.Check
                    type="switch"
                    label="Active Product"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                </Col>
              )}
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={handleCloseModal} className="rounded-pill px-4">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-pill px-4">
            {saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showStockModal} onHide={handleCloseStockModal} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Update Stock</Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-3">
          {modalError && (
            <Alert variant="danger" className="rounded-4">
              {modalError}
            </Alert>
          )}

          <div
            className="rounded-4 p-3 mb-3"
            style={{ backgroundColor: "#f8fafc", border: "1px solid #e5e7eb" }}
          >
            <p className="mb-1 text-muted">Selected Product</p>
            <h5 className="fw-bold mb-0">{selectedStockProduct?.name || "-"}</h5>
          </div>

          <Form.Group>
            <Form.Label className="fw-semibold">New Stock Value</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={stockValue}
              onChange={(e) => setStockValue(e.target.value)}
              placeholder="Enter new stock value"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={handleCloseStockModal} className="rounded-pill px-4">
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={handleStockUpdate}
            disabled={saving}
            className="rounded-pill px-4"
          >
            {saving ? "Updating..." : "Update Stock"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductManagementPage;