import React, { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Image, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { cancelOrder, getOrderById } from "../../services/cartService";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Order detail load nahi ho payi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      await cancelOrder(id);
      alert("Order cancelled successfully.");
      await fetchOrder();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Cancel failed.");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = order && !["Packed", "Shipped", "Delivered", "Cancelled"].includes(order.status);

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

  if (!order) {
    return <Alert variant="warning" className="mt-4">Order nahi mila.</Alert>;
  }

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Details #{order.id}</h2>
        <Button variant="outline-secondary" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>
      </div>

      <Row>
        <Col md={8}>
          <Card className="p-4 card-shadow mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Order Items</h4>
              <Badge bg="secondary">{order.status}</Badge>
            </div>

            {order.items.map((item, index) => (
              <Row className="align-items-center mb-3" key={index}>
                <Col md={2}>
                  <Image
                    src={item.productImageUrl || "https://via.placeholder.com/100"}
                    rounded
                    fluid
                    style={{ height: "80px", width: "100%", objectFit: "cover" }}
                  />
                </Col>

                <Col md={5}>
                  <h6>{item.productName}</h6>
                  <p className="mb-0">Qty: {item.quantity}</p>
                </Col>

                <Col md={2}>
                  ₹{item.unitPrice}
                </Col>

                <Col md={3}>
                  <strong>₹{item.lineTotal}</strong>
                </Col>
              </Row>
            ))}
          </Card>

          <Card className="p-4 card-shadow">
            <h4 className="mb-3">Shipping Address</h4>
            <p className="mb-1">{order.fullName}</p>
            <p className="mb-1">{order.phone}</p>
            <p className="mb-1">{order.addressLine}</p>
            <p className="mb-0">
              {order.city}, {order.state} - {order.pincode}
            </p>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="p-4 card-shadow">
            <h4>Summary</h4>
            <hr />
            <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
            <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
            <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
            <p><strong>Delivery Option:</strong> {order.deliveryOption}</p>
            <p><strong>Payment Ref:</strong> {order.paymentReference || "N/A"}</p>

            {canCancel && (
              <Button
                variant="danger"
                className="w-100 mt-3"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </Button>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetailPage;