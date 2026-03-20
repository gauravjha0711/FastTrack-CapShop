import React, { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Row, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";

const ProductDetailPage = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setError(err.response?.data?.message || "Product detail load nahi ho payi.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="mt-4">{error}</Alert>;
  }

  if (!product) {
    return <Alert variant="warning" className="mt-4">Product nahi mila.</Alert>;
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="mt-4">
      <Card className="p-4 card-shadow">
        <Row>
          <Col md={5}>
            <img
              src={product.imageUrl || "https://via.placeholder.com/500x350"}
              alt={product.name}
              className="img-fluid rounded"
              style={{ width: "100%", maxHeight: "400px", objectFit: "cover" }}
            />
          </Col>

          <Col md={7}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <h2 className="mb-0">{product.name}</h2>
              {product.isFeatured && <Badge bg="warning" text="dark">Featured</Badge>}
            </div>

            <p className="text-muted mb-2">Category: {product.categoryName}</p>

            <h3 className="mb-3">₹{product.price}</h3>

            <div className="mb-3">
              <Badge bg={isOutOfStock ? "danger" : "success"}>
                {isOutOfStock ? "Out of Stock" : `In Stock: ${product.stock}`}
              </Badge>
            </div>

            <p>{product.description}</p>

            <Button disabled={isOutOfStock} variant="primary">
              {isOutOfStock ? "Unavailable" : "Add to Cart"}
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ProductDetailPage;