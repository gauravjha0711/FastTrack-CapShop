import React, { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getMyOrders } from "../../services/cartService";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Orders load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "success";
      case "cancelled":
        return "danger";
      case "packed":
        return "warning";
      case "shipped":
        return "info";
      case "delivered":
        return "primary";
      default:
        return "secondary";
    }
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
      <h2 className="mb-4">My Orders</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {orders.length === 0 ? (
        <Card className="p-4 card-shadow">
          <h4>No orders found</h4>
          <p>You have not placed any orders yet.</p>
          <Button as={Link} to="/products">
            Start Shopping
          </Button>
        </Card>
      ) : (
        <Card className="p-3 card-shadow">
          <Table responsive hover>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Delivery</th>
                <th>Items</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{new Date(order.orderDate).toLocaleString()}</td>
                  <td>₹{order.totalAmount}</td>
                  <td>
                    <Badge bg={getBadgeVariant(order.status)}>{order.status}</Badge>
                  </td>
                  <td>{order.paymentMethod}</td>
                  <td>{order.deliveryOption}</td>
                  <td>{order.totalItems}</td>
                  <td>
                    <Button as={Link} to={`/orders/${order.id}`} size="sm">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default OrdersPage;