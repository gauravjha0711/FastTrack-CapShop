import React, { useEffect, useState } from "react";
import { Alert, Card, Col, Row, Spinner, Table } from "react-bootstrap";
import { getAdminDashboardSummary } from "../../services/adminService";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Dashboard load nahi ho paaya.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {summary && (
        <>
          <Row className="mt-4">
            <Col md={3}>
              <Card className="p-3 card-shadow">
                <h5>Total Products</h5>
                <h3>{summary.totalProducts}</h3>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="p-3 card-shadow">
                <h5>Active Products</h5>
                <h3>{summary.activeProducts}</h3>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="p-3 card-shadow">
                <h5>Total Orders</h5>
                <h3>{summary.totalOrders}</h3>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="p-3 card-shadow">
                <h5>Pending Orders</h5>
                <h3>{summary.pendingOrders}</h3>
              </Card>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col md={4}>
              <Card className="p-3 card-shadow">
                <h5>Total Sales</h5>
                <h3>₹{summary.totalSales}</h3>
              </Card>
            </Col>
          </Row>

          <Card className="p-3 card-shadow mt-4">
            <h4 className="mb-3">Recent Orders</h4>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(summary.recentOrders || []).map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.fullName}</td>
                    <td>{order.status}</td>
                    <td>₹{order.totalAmount}</td>
                    <td>{new Date(order.orderDate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
};

export default DashboardPage;