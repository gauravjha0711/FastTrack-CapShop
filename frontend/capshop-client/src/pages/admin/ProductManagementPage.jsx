import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Form, Modal, Spinner, Table } from "react-bootstrap";
import {
  createAdminProduct,
  deactivateAdminProduct,
  getAdminProducts,
  updateAdminProduct,
  updateAdminStock
} from "../../services/adminService";

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
  imageUrl: "",
  isFeatured: false,
  isActive: true
};

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAdminProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Products load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl || "",
      isFeatured: product.isFeatured,
      isActive: product.isActive
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        categoryId: Number(formData.categoryId)
      };

      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
        alert("Product updated successfully.");
      } else {
        await createAdminProduct(payload);
        alert("Product created successfully.");
      }

      setShowModal(false);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await deactivateAdminProduct(id);
      alert("Product deactivated successfully.");
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Deactivate failed.");
    }
  };

  const handleStockUpdate = async (id, currentStock) => {
    const newStock = prompt("Enter new stock value:", currentStock);

    if (newStock === null) return;

    try {
      await updateAdminStock(id, Number(newStock));
      alert("Stock updated successfully.");
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Stock update failed.");
    }
  };

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Product Management</h2>
        <Button onClick={handleOpenCreate}>Add Product</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="p-3 card-shadow">
        <Table responsive hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Featured</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.categoryName}</td>
                <td>₹{product.price}</td>
                <td>{product.stock}</td>
                <td>{product.isFeatured ? "Yes" : "No"}</td>
                <td>{product.isActive ? "Yes" : "No"}</td>
                <td className="d-flex gap-2">
                  <Button size="sm" onClick={() => handleOpenEdit(product)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => handleStockUpdate(product.id, product.stock)}
                  >
                    Stock
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeactivate(product.id)}
                  >
                    Deactivate
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? "Edit Product" : "Add Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" value={formData.name} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control name="price" value={formData.price} onChange={handleChange} />
                </Form.Group>
              </div>

              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control name="stock" value={formData.stock} onChange={handleChange} />
                </Form.Group>
              </div>

              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Category Id</Form.Label>
                  <Form.Control
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Featured Product"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="mb-2"
            />

            {editingProduct && (
              <Form.Check
                type="checkbox"
                label="Active"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductManagementPage;