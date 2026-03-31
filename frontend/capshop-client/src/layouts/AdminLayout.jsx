import React, { useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Col,
  Container,
  Offcanvas,
  Row,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { name, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);

  const currentPage = useMemo(() => {
    const path = location.pathname;

    if (path.includes("/admin/dashboard")) return "Dashboard";
    if (path.includes("/admin/products")) return "Product Management";
    if (path.includes("/admin/orders")) return "Order Management";
    if (path.includes("/admin/reports")) return "Reports & Analytics";

    return "Admin Panel";
  }, [location.pathname]);

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: "📊",
      description: "Overview & analytics",
    },
    {
      label: "Manage Products",
      path: "/admin/products",
      icon: "📦",
      description: "Catalog & inventory",
    },
    {
      label: "Manage Orders",
      path: "/admin/orders",
      icon: "🧾",
      description: "Track and update orders",
    },
    {
      label: "Reports",
      path: "/admin/reports",
      icon: "📈",
      description: "Sales and status reports",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const renderSidebarContent = () => (
    <div
      className="d-flex flex-column h-100 text-white"
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #111827 50%, #1e293b 100%)",
      }}
    >
      <div className="p-4 border-bottom border-secondary-subtle">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-4"
            style={{
              width: "52px",
              height: "52px",
              background: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
              fontSize: "22px",
              boxShadow: "0 10px 25px rgba(37, 99, 235, 0.35)",
            }}
          >
            🛍️
          </div>

          <div>
            <h4 className="fw-bold mb-1">CapShop Admin</h4>
            <p className="mb-0 text-white-50 small">Management Console</p>
          </div>
        </div>

        <div
          className="rounded-4 p-3"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <p className="text-white-50 small mb-1">Welcome back</p>
          <div className="d-flex align-items-center justify-content-between gap-2">
            <div>
              <h6 className="mb-0 fw-semibold text-truncate">
                {name || "Admin User"}
              </h6>
            </div>
            <Badge bg="success" className="rounded-pill px-3 py-2">
              Online
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-3 flex-grow-1">
        <p className="text-uppercase small text-white-50 fw-semibold px-2 mb-3">
          Main Navigation
        </p>

        <div className="d-flex flex-column gap-2">
          {menuItems.map((item) => {
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setShowSidebar(false)}
                className="text-decoration-none"
              >
                <div
                  className="d-flex align-items-center gap-3 rounded-4 px-3 py-3 transition"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                      : "transparent",
                    color: "#ffffff",
                    border: active
                      ? "1px solid rgba(255,255,255,0.12)"
                      : "1px solid transparent",
                    boxShadow: active
                      ? "0 10px 22px rgba(37, 99, 235, 0.28)"
                      : "none",
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: "42px",
                      height: "42px",
                      background: active
                        ? "rgba(255,255,255,0.14)"
                        : "rgba(255,255,255,0.06)",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div className="flex-grow-1">
                    <div className="fw-semibold">{item.label}</div>
                    <small className={active ? "text-white-50" : "text-light opacity-75"}>
                      {item.description}
                    </small>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-3 border-top border-secondary-subtle">
        <div
          className="rounded-4 p-3 mb-3"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p className="text-white-50 small mb-1">Current Workspace</p>
          <h6 className="mb-0 fw-semibold">{currentPage}</h6>
        </div>

        <Button
          variant="outline-light"
          className="w-100 rounded-pill py-2 fw-semibold"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Container fluid className="px-0">
        <Row className="g-0">
          <Col
            lg={3}
            xl={2}
            className="d-none d-lg-block"
            style={{
              minHeight: "100vh",
              position: "sticky",
              top: 0,
            }}
          >
            {renderSidebarContent()}
          </Col>

          <Col lg={9} xl={10}>
            <div
              className="px-3 px-md-4 px-xl-5 py-3 py-md-4"
              style={{ minHeight: "100vh" }}
            >
              <div
                className="d-flex justify-content-between align-items-center mb-4 rounded-4 px-3 px-md-4 py-3 bg-white shadow-sm"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <div className="d-flex align-items-center gap-3">
                  <Button
                    variant="light"
                    className="d-lg-none rounded-circle border"
                    style={{ width: "44px", height: "44px" }}
                    onClick={() => setShowSidebar(true)}
                  >
                    ☰
                  </Button>

                  <div>
                    <p className="text-muted small mb-1">Admin Workspace</p>
                    <h4 className="fw-bold mb-0">{currentPage}</h4>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="text-end d-none d-md-block">
                    <p className="text-muted small mb-1">Signed in as</p>
                    <h6 className="mb-0 fw-semibold">{name || "Admin User"}</h6>
                  </div>

                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                    style={{
                      width: "46px",
                      height: "46px",
                      background: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
                      boxShadow: "0 8px 18px rgba(37, 99, 235, 0.28)",
                    }}
                  >
                    {name ? name.charAt(0).toUpperCase() : "A"}
                  </div>
                </div>
              </div>

              <Outlet />
            </div>
          </Col>
        </Row>
      </Container>

      <Offcanvas
        show={showSidebar}
        onHide={() => setShowSidebar(false)}
        placement="start"
        className="d-lg-none"
        style={{ width: "310px", backgroundColor: "#0f172a" }}
      >
        <Offcanvas.Header closeButton closeVariant="white" className="border-bottom border-secondary-subtle">
          <Offcanvas.Title className="text-white fw-bold">
            CapShop Admin
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {renderSidebarContent()}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default AdminLayout;