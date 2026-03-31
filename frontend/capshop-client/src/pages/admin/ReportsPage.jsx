import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  ProgressBar,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getAdminOrders,
  getSalesReport,
  getStatusSplitReport,
} from "../../services/adminService";

const ReportsPage = () => {
  const [salesReport, setSalesReport] = useState([]);
  const [statusReport, setStatusReport] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (selectedStatus === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter(
          (order) =>
            (order.status || "").toLowerCase() === selectedStatus.toLowerCase()
        )
      );
    }
  }, [orders, selectedStatus]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [sales, status, adminOrders] = await Promise.all([
        getSalesReport(),
        getStatusSplitReport(),
        getAdminOrders(),
      ]);

      setSalesReport(Array.isArray(sales) ? sales : []);
      setStatusReport(Array.isArray(status) ? status : []);
      setOrders(Array.isArray(adminOrders) ? adminOrders : []);
      setFilteredOrders(Array.isArray(adminOrders) ? adminOrders : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Reports load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const totalSales = salesReport.reduce(
      (sum, item) => sum + Number(item.totalSales || 0),
      0
    );

    const totalOrdersFromSales = salesReport.reduce(
      (sum, item) => sum + Number(item.orderCount || 0),
      0
    );

    const totalOrders = orders.length;

    const totalRevenueFromOrders = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
    );

    const deliveredCount =
      statusReport.find(
        (item) => (item.status || "").toLowerCase() === "delivered"
      )?.count || 0;

    const cancelledCount =
      statusReport.find(
        (item) => (item.status || "").toLowerCase() === "cancelled"
      )?.count || 0;

    const pendingCount =
      statusReport.find((item) => (item.status || "").toLowerCase() === "pending")
        ?.count || 0;

    const packedCount =
      statusReport.find((item) => (item.status || "").toLowerCase() === "packed")
        ?.count || 0;

    const shippedCount =
      statusReport.find((item) => (item.status || "").toLowerCase() === "shipped")
        ?.count || 0;

    const deliveryRate =
      totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;

    const cancellationRate =
      totalOrders > 0 ? Math.round((cancelledCount / totalOrders) * 100) : 0;

    return {
      totalSales,
      totalOrdersFromSales,
      totalOrders,
      totalRevenueFromOrders,
      deliveredCount,
      cancelledCount,
      pendingCount,
      packedCount,
      shippedCount,
      deliveryRate,
      cancellationRate,
    };
  }, [salesReport, statusReport, orders]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const normalized = (status || "").toLowerCase();

    switch (normalized) {
      case "paid":
        return <Badge bg="info" className="rounded-pill px-3 py-2">Paid</Badge>;
      case "pending":
        return (
          <Badge bg="warning" text="dark" className="rounded-pill px-3 py-2">
            Pending
          </Badge>
        );
      case "packed":
        return (
          <Badge bg="secondary" className="rounded-pill px-3 py-2">
            Packed
          </Badge>
        );
      case "shipped":
        return (
          <Badge bg="primary" className="rounded-pill px-3 py-2">
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge bg="success" className="rounded-pill px-3 py-2">
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge bg="danger" className="rounded-pill px-3 py-2">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge bg="dark" className="rounded-pill px-3 py-2">
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  const exportOrdersToPdf = async () => {
    try {
      setExporting(true);

      const doc = new jsPDF("l", "mm", "a4");
      const today = new Date();

      doc.setFontSize(18);
      doc.text("CapShop Orders Report", 14, 15);

      doc.setFontSize(10);
      doc.text(
        `Generated on: ${today.toLocaleDateString("en-IN")} ${today.toLocaleTimeString("en-IN")}`,
        14,
        22
      );

      doc.text(
        `Filter: ${selectedStatus === "all" ? "All Orders" : selectedStatus}`,
        14,
        28
      );

      autoTable(doc, {
        startY: 34,
        head: [
          [
            "Order ID",
            "User ID",
            "Customer",
            "Status",
            "Payment",
            "Delivery",
            "Items",
            "Amount",
            "Date",
          ],
        ],
        body: filteredOrders.map((order) => [
          `#${order.id}`,
          order.userId || "-",
          order.fullName || "-",
          order.status || "-",
          order.paymentMethod || "-",
          order.deliveryOption || "-",
          order.totalItems || 0,
          formatCurrency(order.totalAmount),
          formatDate(order.orderDate),
        ]),
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [37, 99, 235],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      doc.save(`capshop-orders-report-${today.getTime()}.pdf`);
    } catch (err) {
      console.error(err);
      setError("PDF export failed.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center py-5"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-3 mb-0 text-muted">Loading reports...</p>
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
            <h2 className="fw-bold mb-2">Reports & Analytics</h2>
            <p className="mb-0 text-white-50" style={{ maxWidth: "760px" }}>
              Monitor sales trends, track order status distribution, and export
              order reports in PDF format for documentation and analysis.
            </p>
          </Col>

          <Col lg={4} className="text-lg-end mt-3 mt-lg-0">
            <div className="d-flex gap-2 justify-content-lg-end flex-wrap">
              <Button variant="light" className="fw-semibold px-4" onClick={fetchReports}>
                Refresh Reports
              </Button>
              <Button
                variant="warning"
                className="fw-semibold px-4"
                onClick={exportOrdersToPdf}
                disabled={exporting || filteredOrders.length === 0}
              >
                {exporting ? "Exporting PDF..." : "Download Orders PDF"}
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {error && (
        <Alert variant="danger" className="rounded-4 shadow-sm">
          {error}
        </Alert>
      )}

      <Row className="g-4 mb-4">
        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <p className="text-muted mb-2 fw-semibold">Total Revenue</p>
              <h2 className="fw-bold mb-1">
                {formatCurrency(analytics.totalRevenueFromOrders)}
              </h2>
              <small className="text-muted">From all loaded orders</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <p className="text-muted mb-2 fw-semibold">Total Orders</p>
              <h2 className="fw-bold mb-1">{analytics.totalOrders}</h2>
              <small className="text-muted">Overall order count</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <p className="text-muted mb-2 fw-semibold">Delivered Orders</p>
              <h2 className="fw-bold mb-1">{analytics.deliveredCount}</h2>
              <small className="text-success fw-semibold">
                {analytics.deliveryRate}% delivery success
              </small>
              <div className="mt-3">
                <ProgressBar
                  variant="success"
                  now={analytics.deliveryRate}
                  style={{ height: "8px", borderRadius: "999px" }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <p className="text-muted mb-2 fw-semibold">Cancelled Orders</p>
              <h2 className="fw-bold mb-1">{analytics.cancelledCount}</h2>
              <small className="text-danger fw-semibold">
                {analytics.cancellationRate}% cancellation rate
              </small>
              <div className="mt-3">
                <ProgressBar
                  variant="danger"
                  now={analytics.cancellationRate}
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
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <div>
                  <h4 className="fw-bold mb-1">Order Export Controls</h4>
                  <p className="text-muted mb-0">
                    Filter orders and download professional PDF reports
                  </p>
                </div>
              </div>

              <Row className="align-items-end g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Filter By Status</Form.Label>
                    <Form.Select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">All Orders</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Card
                    className="border-0 rounded-4 h-100"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <Card.Body className="py-3">
                      <p className="text-muted mb-1">Filtered Orders</p>
                      <h3 className="fw-bold mb-0">{filteredOrders.length}</h3>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card
                    className="border-0 rounded-4 h-100"
                    style={{ backgroundColor: "#f8fafc" }}
                  >
                    <Card.Body className="py-3">
                      <p className="text-muted mb-1">Sales Rows</p>
                      <h3 className="fw-bold mb-0">{salesReport.length}</h3>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h4 className="fw-bold mb-1">Status Overview</h4>
              <p className="text-muted mb-4">Current order stage distribution</p>

              {[
                {
                  label: "Pending",
                  value: analytics.pendingCount,
                  variant: "warning",
                },
                {
                  label: "Packed",
                  value: analytics.packedCount,
                  variant: "secondary",
                },
                {
                  label: "Shipped",
                  value: analytics.shippedCount,
                  variant: "primary",
                },
                {
                  label: "Delivered",
                  value: analytics.deliveredCount,
                  variant: "success",
                },
                {
                  label: "Cancelled",
                  value: analytics.cancelledCount,
                  variant: "danger",
                },
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="mb-3">
                <h4 className="fw-bold mb-1">Sales Report</h4>
                <p className="text-muted mb-0">
                  Date-wise sales and order trend summary
                </p>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead style={{ backgroundColor: "#f8fafc" }}>
                    <tr>
                      <th className="py-3">Date</th>
                      <th className="py-3">Total Sales</th>
                      <th className="py-3">Order Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesReport.length > 0 ? (
                      salesReport.map((item, index) => (
                        <tr key={index}>
                          <td className="fw-semibold">{formatDate(item.date)}</td>
                          <td>{formatCurrency(item.totalSales)}</td>
                          <td>{item.orderCount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-5 text-muted">
                          No sales report data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="mb-3">
                <h4 className="fw-bold mb-1">Status Split Report</h4>
                <p className="text-muted mb-0">
                  Count of orders based on current status
                </p>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead style={{ backgroundColor: "#f8fafc" }}>
                    <tr>
                      <th className="py-3">Status</th>
                      <th className="py-3">Count</th>
                      <th className="py-3">Visual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusReport.length > 0 ? (
                      statusReport.map((item, index) => {
                        const percent =
                          analytics.totalOrders > 0
                            ? Math.round((Number(item.count || 0) / analytics.totalOrders) * 100)
                            : 0;

                        return (
                          <tr key={index}>
                            <td>{getStatusBadge(item.status)}</td>
                            <td className="fw-semibold">{item.count}</td>
                            <td style={{ minWidth: "160px" }}>
                              <ProgressBar
                                now={percent}
                                style={{ height: "8px", borderRadius: "999px" }}
                              />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-5 text-muted">
                          No status report data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4 mt-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <h4 className="fw-bold mb-1">Orders Preview</h4>
              <p className="text-muted mb-0">
                These orders will be included in the exported PDF
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
                  <th className="py-3">Amount</th>
                  <th className="py-3">Payment</th>
                  <th className="py-3">Delivery</th>
                  <th className="py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.slice(0, 10).map((order) => (
                    <tr key={order.id}>
                      <td className="fw-semibold">#{order.id}</td>
                      <td>{order.fullName || "-"}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>{order.paymentMethod || "-"}</td>
                      <td>{order.deliveryOption || "-"}</td>
                      <td>{formatDate(order.orderDate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No orders available for preview.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {filteredOrders.length > 10 && (
            <div className="mt-3 text-muted small">
              Showing first 10 orders in preview. PDF export will include all filtered orders.
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReportsPage;