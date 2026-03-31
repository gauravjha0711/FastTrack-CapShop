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
import { getAdminOrders, updateAdminOrderStatus } from "../../services/adminService";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [error, setError] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let updated = [...orders];

    if (searchTerm.trim()) {
      const keyword = searchTerm.toLowerCase();
      updated = updated.filter(
        (order) =>
          order.fullName?.toLowerCase().includes(keyword) ||
          order.paymentMethod?.toLowerCase().includes(keyword) ||
          order.deliveryOption?.toLowerCase().includes(keyword) ||
          String(order.id).includes(keyword) ||
          String(order.userId).includes(keyword)
      );
    }

    if (statusFilter !== "all") {
      updated = updated.filter(
        (order) => (order.status || "").toLowerCase() === statusFilter
      );
    }

    if (paymentFilter !== "all") {
      updated = updated.filter(
        (order) => (order.paymentMethod || "").toLowerCase() === paymentFilter
      );
    }

    if (deliveryFilter !== "all") {
      updated = updated.filter(
        (order) => (order.deliveryOption || "").toLowerCase() === deliveryFilter
      );
    }

    setFilteredOrders(updated);
  }, [orders, searchTerm, statusFilter, paymentFilter, deliveryFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      setPageMessage("");
      const data = await getAdminOrders();
      const orderList = Array.isArray(data) ? data : [];
      setOrders(orderList);
      setFilteredOrders(orderList);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Orders load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
    );

    const paidOrders = orders.filter(
      (order) => (order.status || "").toLowerCase() === "paid"
    ).length;

    const packedOrders = orders.filter(
      (order) => (order.status || "").toLowerCase() === "packed"
    ).length;

    const shippedOrders = orders.filter(
      (order) => (order.status || "").toLowerCase() === "shipped"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => (order.status || "").toLowerCase() === "delivered"
    ).length;

    const cancelledOrders = orders.filter(
      (order) => (order.status || "").toLowerCase() === "cancelled"
    ).length;

    const totalItems = orders.reduce(
      (sum, order) => sum + Number(order.totalItems || 0),
      0
    );

    const deliveredRate =
      totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

    const cancelledRate =
      totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0;

    return {
      totalOrders,
      totalRevenue,
      paidOrders,
      packedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalItems,
      deliveredRate,
      cancelledRate,
    };
  }, [orders]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusBadge = (status) => {
    const normalized = (status || "").toLowerCase();

    switch (normalized) {
      case "paid":
        return <Badge bg="info" className="rounded-pill px-3 py-2">Paid</Badge>;
      case "packed":
        return <Badge bg="warning" text="dark" className="rounded-pill px-3 py-2">Packed</Badge>;
      case "shipped":
        return <Badge bg="primary" className="rounded-pill px-3 py-2">Shipped</Badge>;
      case "delivered":
        return <Badge bg="success" className="rounded-pill px-3 py-2">Delivered</Badge>;
      case "cancelled":
        return <Badge bg="danger" className="rounded-pill px-3 py-2">Cancelled</Badge>;
      default:
        return <Badge bg="secondary" className="rounded-pill px-3 py-2">{status || "Unknown"}</Badge>;
    }
  };

  const getPaymentBadge = (paymentMethod) => {
    const normalized = (paymentMethod || "").toLowerCase();

    if (normalized.includes("cod")) {
      return <Badge bg="warning" text="dark" className="rounded-pill px-3 py-2">Cash on Delivery</Badge>;
    }

    if (normalized.includes("upi")) {
      return <Badge bg="success" className="rounded-pill px-3 py-2">UPI</Badge>;
    }

    if (normalized.includes("card")) {
      return <Badge bg="primary" className="rounded-pill px-3 py-2">Card</Badge>;
    }

    return <Badge bg="secondary" className="rounded-pill px-3 py-2">{paymentMethod || "N/A"}</Badge>;
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      setPageMessage("");
      setError("");
      await updateAdminOrderStatus(orderId, status);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status } : prev));
      }

      setPageMessage(`Order #${orderId} status updated to ${status}.`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Status update failed.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setShowDetailsModal(false);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center py-5"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-3 mb-0 text-muted">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <div
        className="p-4 p-md-5 mb-4 rounded-4 text-white shadow-sm"
        style={{
          background: "linear-gradient(135deg, #111827 0%, #1d4ed8 50%, #2563eb 100%)",
        }}
      >
        <Row className="align-items-center">
          <Col lg={8}>
            <h2 className="fw-bold mb-2">Order Management</h2>
            <p className="mb-0 text-white-50" style={{ maxWidth: "760px" }}>
              Track customer orders, update fulfillment stages, monitor delivery
              performance, and manage the complete order pipeline from one place.
            </p>
          </Col>
          <Col lg={4} className="text-lg-end mt-3 mt-lg-0">
            <Button variant="light" className="fw-semibold px-4" onClick={fetchOrders}>
              Refresh Orders
            </Button>
          </Col>
        </Row>
      </div>

      {error && (
        <Alert variant="danger" className="rounded-4 shadow-sm">
          {error}
        </Alert>
      )}

      {pageMessage && (
        <Alert variant="success" className="rounded-4 shadow-sm">
          {pageMessage}
        </Alert>
      )}

      <Row className="g-4 mb-4">
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-2 fw-semibold">Total Orders</p>
                  <h2 className="fw-bold mb-1">{analytics.totalOrders}</h2>
                  <small className="text-muted">All received orders</small>
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
                  🧾
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
                  <p className="text-muted mb-2 fw-semibold">Total Revenue</p>
                  <h2 className="fw-bold mb-1">{formatCurrency(analytics.totalRevenue)}</h2>
                  <small className="text-muted">Current order value</small>
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
                  💰
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
                  <p className="text-muted mb-2 fw-semibold">Delivered Orders</p>
                  <h2 className="fw-bold mb-1">{analytics.deliveredOrders}</h2>
                  <small className="text-success fw-semibold">
                    {analytics.deliveredRate}% delivery success
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
                  variant="success"
                  now={analytics.deliveredRate}
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
                  <p className="text-muted mb-2 fw-semibold">Cancelled Orders</p>
                  <h2 className="fw-bold mb-1">{analytics.cancelledOrders}</h2>
                  <small className="text-danger fw-semibold">
                    {analytics.cancelledRate}% cancelled
                  </small>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "#fee2e2",
                    fontSize: "22px",
                  }}
                >
                  ❌
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar
                  variant="danger"
                  now={analytics.cancelledRate}
                  style={{ height: "8px", borderRadius: "999px" }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="mb-4">
                <h4 className="fw-bold mb-1">Order Controls</h4>
                <p className="text-muted mb-0">
                  Search and filter orders for faster admin operations
                </p>
              </div>

              <Row className="g-3">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Search Orders</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>🔍</InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search by order id, user id, customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Status</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Payment</Form.Label>
                    <Form.Select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="cod">COD</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Delivery</Form.Label>
                    <Form.Select
                      value={deliveryFilter}
                      onChange={(e) => setDeliveryFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="standard">Standard</option>
                      <option value="express">Express</option>
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
              <h4 className="fw-bold mb-1">Pipeline Overview</h4>
              <p className="text-muted mb-4">Current order stage distribution</p>

              {[
                { label: "Paid", value: analytics.paidOrders, variant: "info" },
                { label: "Packed", value: analytics.packedOrders, variant: "warning" },
                { label: "Shipped", value: analytics.shippedOrders, variant: "primary" },
                { label: "Delivered", value: analytics.deliveredOrders, variant: "success" },
                { label: "Cancelled", value: analytics.cancelledOrders, variant: "danger" },
              ].map((item) => {
                const percent =
                  analytics.totalOrders > 0
                    ? Math.round((item.value / analytics.totalOrders) * 100)
                    : 0;

                return (
                  <div key={item.label} className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="fw-semibold">{item.label}</span>
                      <span className="text-muted">
                        {item.value} ({percent}%)
                      </span>
                    </div>
                    <ProgressBar
                      variant={item.variant}
                      now={percent}
                      style={{ height: "10px", borderRadius: "999px" }}
                    />
                  </div>
                );
              })}

              <div
                className="rounded-4 p-3"
                style={{ backgroundColor: "#f8fafc", border: "1px solid #e5e7eb" }}
              >
                <p className="text-muted mb-1">Filtered Orders</p>
                <h3 className="fw-bold mb-0">{filteredOrders.length}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <h4 className="fw-bold mb-1">Order List</h4>
              <p className="text-muted mb-0">
                Manage order status and review customer order details
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead style={{ backgroundColor: "#f8fafc" }}>
                <tr>
                  <th className="py-3">Order</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Payment</th>
                  <th className="py-3">Delivery</th>
                  <th className="py-3">Items</th>
                  <th className="py-3">Update Status</th>
                  <th className="py-3 text-center">More</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <div className="fw-semibold">#{order.id}</div>
                        <small className="text-muted">User ID: {order.userId}</small>
                      </td>
                      <td>
                        <div className="fw-semibold">{order.fullName || "N/A"}</div>
                        <small className="text-muted">
                          {formatDateTime(order.orderDate)}
                        </small>
                      </td>
                      <td className="fw-semibold">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{getPaymentBadge(order.paymentMethod)}</td>
                      <td>
                        <Badge bg="light" text="dark" className="rounded-pill px-3 py-2 border">
                          {order.deliveryOption || "N/A"}
                        </Badge>
                      </td>
                      <td>
                        <span className="fw-semibold">{order.totalItems || 0}</span>
                      </td>
                      <td style={{ minWidth: "220px" }}>
                        <Form.Select
                          value={order.status || ""}
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
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-dark"
                          className="rounded-pill px-3"
                          onClick={() => handleOpenDetails(order)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-muted">
                      No orders found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showDetailsModal} onHide={handleCloseDetails} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Order Details</Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-3">
          {selectedOrder && (
            <>
              <Row className="g-3">
                <Col md={6}>
                  <Card className="border-0 rounded-4" style={{ backgroundColor: "#f8fafc" }}>
                    <Card.Body>
                      <p className="text-muted mb-1">Order ID</p>
                      <h5 className="fw-bold mb-0">#{selectedOrder.id}</h5>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border-0 rounded-4" style={{ backgroundColor: "#f8fafc" }}>
                    <Card.Body>
                      <p className="text-muted mb-1">Customer</p>
                      <h5 className="fw-bold mb-0">{selectedOrder.fullName || "N/A"}</h5>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border-0 rounded-4" style={{ backgroundColor: "#f8fafc" }}>
                    <Card.Body>
                      <p className="text-muted mb-1">Amount</p>
                      <h5 className="fw-bold mb-0">
                        {formatCurrency(selectedOrder.totalAmount)}
                      </h5>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border-0 rounded-4" style={{ backgroundColor: "#f8fafc" }}>
                    <Card.Body>
                      <p className="text-muted mb-1">Items</p>
                      <h5 className="fw-bold mb-0">{selectedOrder.totalItems || 0}</h5>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border-0 rounded-4" style={{ backgroundColor: "#f8fafc" }}>
                    <Card.Body>
                      <p className="text-muted mb-1">Payment Method</p>
                      <div>{getPaymentBadge(selectedOrder.paymentMethod)}</div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border-0 rounded-4" style={{ backgroundColor: "#f8fafc" }}>
                    <Card.Body>
                      <p className="text-muted mb-1">Delivery Option</p>
                      <h5 className="fw-bold mb-0">
                        {selectedOrder.deliveryOption || "N/A"}
                      </h5>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border-0 rounded-4" style={{ backgroundColor: "#f8fafc" }}>
                    <Card.Body>
                      <p className="text-muted mb-1">Current Status</p>
                      <div>{getStatusBadge(selectedOrder.status)}</div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border-0 rounded-4" style={{ backgroundColor: "#f8fafc" }}>
                    <Card.Body>
                      <p className="text-muted mb-1">Order Date</p>
                      <h6 className="fw-bold mb-0">
                        {formatDateTime(selectedOrder.orderDate)}
                      </h6>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={handleCloseDetails} className="rounded-pill px-4">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminOrdersPage;