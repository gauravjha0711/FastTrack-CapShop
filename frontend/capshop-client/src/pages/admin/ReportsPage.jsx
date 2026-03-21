import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Row, Spinner, Table } from "react-bootstrap";
import { getSalesReport, getStatusSplitReport } from "../../services/adminService";

const ReportsPage = () => {
  const [salesReport, setSalesReport] = useState([]);
  const [statusReport, setStatusReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const sales = await getSalesReport();
      const status = await getStatusSplitReport();

      setSalesReport(sales || []);
      setStatusReport(status || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Reports load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reports</h2>
        <Button variant="outline-primary">Export CSV (Placeholder)</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={6}>
          <Card className="p-3 card-shadow">
            <h4>Sales Report</h4>
            <Table responsive hover className="mt-3">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Sales</th>
                  <th>Order Count</th>
                </tr>
              </thead>
              <tbody>
                {salesReport.map((item, index) => (
                  <tr key={index}>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>₹{item.totalSales}</td>
                    <td>{item.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="p-3 card-shadow">
            <h4>Status Split Report</h4>
            <Table responsive hover className="mt-3">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {statusReport.map((item, index) => (
                  <tr key={index}>
                    <td>{item.status}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportsPage;