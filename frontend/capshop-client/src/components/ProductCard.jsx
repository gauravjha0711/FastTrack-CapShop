import React, { useState } from "react";
import { Badge, Button, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addToCart } from "../services/cartService";

const ProductCard = ({ product }) => {
  const isOutOfStock = product.stock <= 0;
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Please login as customer first.");
      navigate("/login");
      return;
    }

    if (role !== "Customer") {
      alert("Only customer can add items to cart.");
      return;
    }

    try {
      setAdding(true);
      await addToCart(product.id, 1);
      alert("Item added to cart successfully.");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Add to cart failed.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card className="h-100 card-shadow">
      <Card.Img
        variant="top"
        src={product.imageUrl || "https://via.placeholder.com/300x220"}
        style={{ height: "220px", objectFit: "cover" }}
      />

      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="mb-0">{product.name}</Card.Title>
          <Badge bg={isOutOfStock ? "danger" : "success"}>
            {isOutOfStock ? "Out of Stock" : `Stock: ${product.stock}`}
          </Badge>
        </div>

        <div className="mb-2">
          <Badge bg="secondary">{product.categoryName}</Badge>
          {product.isFeatured && (
            <Badge bg="warning" text="dark" className="ms-2">
              Featured
            </Badge>
          )}
        </div>

        <Card.Text style={{ flexGrow: 1 }}>
          {product.description?.length > 90
            ? `${product.description.substring(0, 90)}...`
            : product.description}
        </Card.Text>

        <h5 className="mb-3">₹{product.price}</h5>

        <div className="d-grid gap-2">
          <Button as={Link} to={`/products/${product.id}`} variant="outline-primary">
            View Details
          </Button>

          <Button disabled={isOutOfStock || adding} variant="primary" onClick={handleAddToCart}>
            {isOutOfStock ? "Unavailable" : adding ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;