import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Image, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getCart, removeCartItem, updateCartItemQuantity } from "../../services/cartService";

const CartPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState({
    cartId: 0,
    userId: 0,
    items: [],
    totalAmount: 0
  });

  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Cart load nahi ho paaya.");
    } finally {
      setLoading(false);
    }
  };

  const handleIncrease = async (item) => {
    try {
      setUpdatingItemId(item.id);
      await updateCartItemQuantity(item.id, item.quantity + 1);
      await fetchCart();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Quantity update failed.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDecrease = async (item) => {
    if (item.quantity <= 1) return;

    try {
      setUpdatingItemId(item.id);
      await updateCartItemQuantity(item.id, item.quantity - 1);
      await fetchCart();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Quantity update failed.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      setUpdatingItemId(itemId);
      await removeCartItem(itemId);
      await fetchCart();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Remove failed.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleStartCheckout = () => {
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h2 className="mb-4">My Cart</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {cart.items.length === 0 ? (
        <Card className="p-4 card-shadow">
          <h4>Your cart is empty</h4>
          <p>Add products to continue shopping.</p>
          <Button variant="primary" onClick={() => navigate("/products")}>
            Browse Products
          </Button>
        </Card>
      ) : (
        <Row>
          <Col md={8}>
            {cart.items.map((item) => (
              <Card className="p-3 mb-3 card-shadow" key={item.id}>
                <Row className="align-items-center">
                  <Col md={2}>
                    <Image
                      src={item.productImageUrl || "https://via.placeholder.com/100"}
                      rounded
                      fluid
                      style={{ height: "80px", objectFit: "cover", width: "100%" }}
                    />
                  </Col>

                  <Col md={4}>
                    <h5>{item.productName}</h5>
                    <p className="mb-0">₹{item.unitPrice}</p>
                  </Col>

                  <Col md={3}>
                    <div className="d-flex align-items-center gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleDecrease(item)}
                        disabled={updatingItemId === item.id || item.quantity <= 1}
                      >
                        -
                      </Button>

                      <span>{item.quantity}</span>

                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleIncrease(item)}
                        disabled={updatingItemId === item.id}
                      >
                        +
                      </Button>
                    </div>
                  </Col>

                  <Col md={2}>
                    <strong>₹{item.lineTotal}</strong>
                  </Col>

                  <Col md={1}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemove(item.id)}
                      disabled={updatingItemId === item.id}
                    >
                      X
                    </Button>
                  </Col>
                </Row>
              </Card>
            ))}
          </Col>

          <Col md={4}>
            <Card className="p-4 card-shadow">
              <h4>Order Summary</h4>
              <hr />
              <div className="d-flex justify-content-between">
                <span>Total Items</span>
                <span>{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <span>Total Amount</span>
                <strong>₹{cart.totalAmount}</strong>
              </div>

              <Button className="w-100 mt-4" onClick={handleStartCheckout}>
                Start Checkout
              </Button>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default CartPage;