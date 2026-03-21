import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Form, Spinner, Table } from "react-bootstrap";
import { getAdminOrders, updateAdminOrderStatus } from "../../services/adminService";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAdminOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Orders load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      await updateAdminOrderStatus(orderId, status);
      alert("Order status updated successfully.");
      await fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Status update failed.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  return (
    <div>
      <h2 className="mb-4">Admin Orders</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="p-3 card-shadow">
        <Table responsive hover>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User ID</th>
              <th>Customer</th>
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
                <td>{order.userId}</td>
                <td>{order.fullName}</td>
                <td>₹{order.totalAmount}</td>
                <td>{order.status}</td>
                <td>{order.paymentMethod}</td>
                <td>{order.deliveryOption}</td>
                <td>{order.totalItems}</td>
                <td style={{ minWidth: "220px" }}>
                  <Form.Select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={updatingOrderId === order.id}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminOrdersPage;