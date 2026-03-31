import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Card,
  Col,
  ProgressBar,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
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
      setError("");
      const data = await getAdminDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Dashboard load nahi ho paaya.");
    } finally {
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const recentOrders = summary?.recentOrders || [];

    const totalRecentOrders = recentOrders.length;

    const statusCount = {
      Pending: 0,
      Packed: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
      Other: 0,
    };

    recentOrders.forEach((order) => {
      const status = (order.status || "").toLowerCase();

      if (status === "pending") statusCount.Pending += 1;
      else if (status === "packed") statusCount.Packed += 1;
      else if (status === "shipped") statusCount.Shipped += 1;
      else if (status === "delivered") statusCount.Delivered += 1;
      else if (status === "cancelled") statusCount.Cancelled += 1;
      else statusCount.Other += 1;
    });

    const safePercent = (value, total) => {
      if (!total) return 0;
      return Math.round((value / total) * 100);
    };

    const productActivePercent = safePercent(
      summary?.activeProducts || 0,
      summary?.totalProducts || 0
    );

    const pendingOrderPercent = safePercent(
      summary?.pendingOrders || 0,
      summary?.totalOrders || 0
    );

    const recentRevenue =
      recentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;

    return {
      totalRecentOrders,
      statusCount,
      productActivePercent,
      pendingOrderPercent,
      recentRevenue,
    };
  }, [summary]);

  const getStatusBadge = (status) => {
    const normalized = (status || "").toLowerCase();

    switch (normalized) {
      case "pending":
        return "warning";
      case "packed":
        return "info";
      case "shipped":
        return "primary";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-3 mb-0 text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <div
        className="p-4 p-md-5 mb-4 rounded-4 text-white shadow-sm"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #2563eb 100%)",
        }}
      >
        <Row className="align-items-center">
          <Col md={8}>
            <h2 className="fw-bold mb-2">Admin Dashboard</h2>
            <p className="mb-0 text-white-50" style={{ maxWidth: "720px" }}>
              Welcome back. Here you can monitor products, orders, sales performance,
              and recent order activity in one professional view.
            </p>
          </Col>
          <Col md={4} className="text-md-end mt-3 mt-md-0">
            <button className="btn btn-light fw-semibold px-4" onClick={fetchSummary}>
              Refresh Dashboard
            </button>
          </Col>
        </Row>
      </div>

      {error && (
        <Alert variant="danger" className="rounded-4 shadow-sm">
          {error}
        </Alert>
      )}

      {summary && (
        <>
          <Row className="g-4">
            <Col xl={3} md={6}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-2 fw-semibold">Total Products</p>
                      <h2 className="fw-bold mb-1">{summary.totalProducts ?? 0}</h2>
                      <small className="text-muted">All catalog items</small>
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
                      <h2 className="fw-bold mb-1">{summary.activeProducts ?? 0}</h2>
                      <small className="text-success fw-semibold">
                        {analytics.productActivePercent}% active in catalog
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
                      now={analytics.productActivePercent}
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
                      <p className="text-muted mb-2 fw-semibold">Total Orders</p>
                      <h2 className="fw-bold mb-1">{summary.totalOrders ?? 0}</h2>
                      <small className="text-muted">Orders received</small>
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
                      🛒
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
                      <p className="text-muted mb-2 fw-semibold">Pending Orders</p>
                      <h2 className="fw-bold mb-1">{summary.pendingOrders ?? 0}</h2>
                      <small className="text-warning fw-semibold">
                        {analytics.pendingOrderPercent}% of total orders
                      </small>
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
                      ⏳
                    </div>
                  </div>

                  <div className="mt-3">
                    <ProgressBar
                      variant="warning"
                      now={analytics.pendingOrderPercent}
                      style={{ height: "8px", borderRadius: "999px" }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mt-1">
            <Col lg={8}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h4 className="fw-bold mb-1">Sales Overview</h4>
                      <p className="text-muted mb-0">
                        Quick revenue and order performance summary
                      </p>
                    </div>
                  </div>

                  <Row className="g-4">
                    <Col md={6}>
                      <div
                        className="rounded-4 p-4 h-100 text-white"
                        style={{
                          background: "linear-gradient(135deg, #111827 0%, #374151 100%)",
                        }}
                      >
                        <p className="mb-2 text-white-50">Total Sales</p>
                        <h2 className="fw-bold mb-2">
                          {formatCurrency(summary.totalSales)}
                        </h2>
                        <small className="text-white-50">
                          Overall completed revenue snapshot
                        </small>
                      </div>
                    </Col>

                    <Col md={6}>
                      <div
                        className="rounded-4 p-4 h-100"
                        style={{ backgroundColor: "#f8fafc", border: "1px solid #e5e7eb" }}
                      >
                        <p className="text-muted mb-2">Recent Orders Revenue</p>
                        <h2 className="fw-bold mb-2">
                          {formatCurrency(analytics.recentRevenue)}
                        </h2>
                        <small className="text-muted">
                          Based on currently loaded recent orders
                        </small>
                      </div>
                    </Col>
                  </Row>

                  <div className="mt-4">
                    <h6 className="fw-bold mb-3">Performance Highlights</h6>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Product Activation Rate</span>
                        <span className="fw-semibold">
                          {analytics.productActivePercent}%
                        </span>
                      </div>
                      <ProgressBar
                        now={analytics.productActivePercent}
                        style={{ height: "10px", borderRadius: "999px" }}
                      />
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Pending Order Load</span>
                        <span className="fw-semibold">
                          {analytics.pendingOrderPercent}%
                        </span>
                      </div>
                      <ProgressBar
                        variant="warning"
                        now={analytics.pendingOrderPercent}
                        style={{ height: "10px", borderRadius: "999px" }}
                      />
                    </div>

                    <div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Recent Delivered Ratio</span>
                        <span className="fw-semibold">
                          {analytics.totalRecentOrders > 0
                            ? Math.round(
                                (analytics.statusCount.Delivered /
                                  analytics.totalRecentOrders) *
                                  100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <ProgressBar
                        variant="success"
                        now={
                          analytics.totalRecentOrders > 0
                            ? Math.round(
                                (analytics.statusCount.Delivered /
                                  analytics.totalRecentOrders) *
                                  100
                              )
                            : 0
                        }
                        style={{ height: "10px", borderRadius: "999px" }}
                      />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="p-4">
                  <h4 className="fw-bold mb-1">Order Status Analytics</h4>
                  <p className="text-muted mb-4">
                    Distribution from recent orders
                  </p>

                  {[
                    { label: "Pending", value: analytics.statusCount.Pending, variant: "warning" },
                    { label: "Packed", value: analytics.statusCount.Packed, variant: "info" },
                    { label: "Shipped", value: analytics.statusCount.Shipped, variant: "primary" },
                    { label: "Delivered", value: analytics.statusCount.Delivered, variant: "success" },
                    { label: "Cancelled", value: analytics.statusCount.Cancelled, variant: "danger" },
                  ].map((item) => {
                    const percent =
                      analytics.totalRecentOrders > 0
                        ? Math.round((item.value / analytics.totalRecentOrders) * 100)
                        : 0;

                    return (
                      <div key={item.label} className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold">{item.label}</span>
                          <span className="text-muted">
                            {item.value} orders ({percent}%)
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
                    className="rounded-4 p-3 mt-2"
                    style={{ backgroundColor: "#f8fafc", border: "1px solid #e5e7eb" }}
                  >
                    <p className="text-muted mb-1">Recent Orders Loaded</p>
                    <h3 className="fw-bold mb-0">{analytics.totalRecentOrders}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm rounded-4 mt-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <h4 className="fw-bold mb-1">Recent Orders</h4>
                  <p className="text-muted mb-0">
                    Latest customer activity and order tracking
                  </p>
                </div>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead style={{ backgroundColor: "#f8fafc" }}>
                    <tr>
                      <th className="py-3">Order ID</th>
                      <th className="py-3">Customer</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Total</th>
                      <th className="py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary.recentOrders || []).length > 0 ? (
                      summary.recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="fw-semibold">#{order.id}</td>
                          <td>{order.fullName || "N/A"}</td>
                          <td>
                            <Badge bg={getStatusBadge(order.status)} className="px-3 py-2 rounded-pill">
                              {order.status || "Unknown"}
                            </Badge>
                          </td>
                          <td className="fw-semibold">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td className="text-muted">
                            {formatDateTime(order.orderDate)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">
                          No recent orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default DashboardPage;