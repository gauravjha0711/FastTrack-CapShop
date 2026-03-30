import React from "react";
import { Container, Nav, Navbar as BsNavbar, Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaShoppingBag, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, role, name, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const isLoginActive =
    location.pathname === "/login" || location.pathname === "/forgot-password";

  const isSignupActive = location.pathname === "/signup";

  return (
    <>
      <style>
        {`
          .capshop-navbar {
            background: rgba(15, 23, 42, 0.88);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border-bottom: 1px solid rgba(255,255,255,0.06);
            box-shadow: 0 8px 28px rgba(0,0,0,0.18);
          }

          .capshop-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
          }

          .capshop-brand-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            color: #ffffff;
            box-shadow: 0 10px 22px rgba(79, 70, 229, 0.26);
            flex-shrink: 0;
          }

          .capshop-brand-title {
            margin: 0;
            font-size: 1.8rem;
            font-weight: 800;
            line-height: 1;
            color: #ffffff;
            letter-spacing: 0.2px;
          }

          .capshop-brand-subtitle {
            margin: 0;
            font-size: 0.85rem;
            color: #94a3b8;
            line-height: 1.2;
            font-weight: 500;
          }

          .capshop-nav-wrap {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .capshop-nav-link {
            color: #dbe4f0 !important;
            font-weight: 500;
            font-size: 0.98rem;
            padding: 8px 12px !important;
            border-radius: 10px;
            transition: all 0.22s ease;
          }

          .capshop-nav-link:hover {
            color: #ffffff !important;
            background: rgba(255,255,255,0.06);
          }

          .capshop-nav-link.active-link {
            color: #ffffff !important;
            background: rgba(99,102,241,0.18);
            border: 1px solid rgba(255,255,255,0.05);
          }

          .capshop-auth-actions,
          .capshop-user-actions {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-left: 14px;
          }

          .capshop-login-btn {
            border-radius: 12px;
            padding: 8px 16px;
            font-size: 0.96rem;
            font-weight: 600;
            border: 1px solid rgba(255,255,255,0.12);
            background: transparent;
            color: #ffffff;
            min-width: 88px;
            transition: all 0.22s ease;
          }

          .capshop-login-btn:hover {
            color: #ffffff;
            background: rgba(255,255,255,0.06);
            border-color: rgba(255,255,255,0.18);
          }

          .capshop-login-btn.active-auth-btn {
            color: #ffffff;
            background: rgba(99,102,241,0.18);
            border: 1px solid rgba(129,140,248,0.45);
            box-shadow: 0 0 0 1px rgba(255,255,255,0.03) inset;
          }

          .capshop-signup-btn {
            border-radius: 12px;
            padding: 8px 16px;
            font-size: 0.96rem;
            font-weight: 700;
            border: none;
            color: #ffffff;
            min-width: 96px;
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            box-shadow: 0 10px 22px rgba(79,70,229,0.22);
            transition: all 0.22s ease;
          }

          .capshop-signup-btn:hover {
            color: #ffffff;
            transform: translateY(-1px);
            box-shadow: 0 12px 24px rgba(79,70,229,0.28);
          }

          .capshop-signup-btn.active-signup-btn {
            color: #ffffff;
            background: linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%);
            box-shadow: 0 12px 26px rgba(79,70,229,0.34);
            transform: translateY(-1px);
          }

          .capshop-user-chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #ffffff;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.08);
            padding: 8px 12px;
            border-radius: 999px;
            font-size: 0.92rem;
            font-weight: 500;
          }

          .capshop-logout-btn {
            border-radius: 12px;
            padding: 8px 14px;
            font-size: 0.95rem;
            font-weight: 600;
            border: 1px solid rgba(255,255,255,0.12);
            color: #ffffff;
            background: transparent;
            transition: all 0.22s ease;
          }

          .capshop-logout-btn:hover {
            color: #ffffff;
            background: rgba(255,255,255,0.06);
          }

          .navbar-toggler {
            border-color: rgba(255,255,255,0.14) !important;
            box-shadow: none !important;
          }

          .navbar-toggler:focus {
            box-shadow: none !important;
          }

          @media (max-width: 991.98px) {
            .capshop-mobile-panel {
              margin-top: 14px;
              padding: 14px;
              border-radius: 16px;
              background: rgba(255,255,255,0.04);
              border: 1px solid rgba(255,255,255,0.06);
            }

            .capshop-nav-wrap {
              flex-direction: column;
              align-items: stretch;
              gap: 8px;
            }

            .capshop-auth-actions,
            .capshop-user-actions {
              flex-direction: column;
              align-items: stretch;
              gap: 10px;
              margin-left: 0;
              margin-top: 12px;
            }

            .capshop-login-btn,
            .capshop-signup-btn,
            .capshop-logout-btn {
              width: 100%;
            }

            .capshop-user-chip {
              width: fit-content;
            }
          }
        `}
      </style>

      <BsNavbar expand="lg" sticky="top" className="capshop-navbar py-3">
        <Container>
          <BsNavbar.Brand as={Link} to="/" className="capshop-brand">
            <div className="capshop-brand-icon">
              <FaShoppingBag size={17} />
            </div>

            <div>
              <p className="capshop-brand-title">CapShop</p>
              <p className="capshop-brand-subtitle">Smart Shopping Experience</p>
            </div>
          </BsNavbar.Brand>

          <BsNavbar.Toggle aria-controls="basic-navbar-nav" />

          <BsNavbar.Collapse id="basic-navbar-nav">
            <div className="ms-auto capshop-mobile-panel d-lg-flex align-items-lg-center">
              <div className="capshop-nav-wrap">
                <Nav className="align-items-lg-center gap-lg-1">
                  <Nav.Link
                    as={Link}
                    to="/"
                    className={`capshop-nav-link ${isActive("/") ? "active-link" : ""}`}
                  >
                    Home
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    to="/products"
                    className={`capshop-nav-link ${isActive("/products") ? "active-link" : ""}`}
                  >
                    Products
                  </Nav.Link>

                  {isAuthenticated && role === "Customer" && (
                    <>
                      <Nav.Link
                        as={Link}
                        to="/cart"
                        className={`capshop-nav-link ${isActive("/cart") ? "active-link" : ""}`}
                      >
                        Cart
                      </Nav.Link>

                      <Nav.Link
                        as={Link}
                        to="/orders"
                        className={`capshop-nav-link ${isActive("/orders") ? "active-link" : ""}`}
                      >
                        My Orders
                      </Nav.Link>

                      <Nav.Link
                        as={Link}
                        to="/account"
                        className={`capshop-nav-link ${isActive("/account") ? "active-link" : ""}`}
                      >
                        My Account
                      </Nav.Link>
                    </>
                  )}

                  {isAuthenticated && role === "Admin" && (
                    <Nav.Link
                      as={Link}
                      to="/admin/dashboard"
                      className={`capshop-nav-link ${
                        isActive("/admin/dashboard") ? "active-link" : ""
                      }`}
                    >
                      Admin
                    </Nav.Link>
                  )}
                </Nav>

                {!isAuthenticated && (
                  <div className="capshop-auth-actions">
                    <Button
                      as={Link}
                      to="/login"
                      className={`capshop-login-btn ${isLoginActive ? "active-auth-btn" : ""}`}
                    >
                      Login
                    </Button>

                    <Button
                      as={Link}
                      to="/signup"
                      className={`capshop-signup-btn ${isSignupActive ? "active-signup-btn" : ""}`}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}

                {isAuthenticated && (
                  <div className="capshop-user-actions">
                    <div className="capshop-user-chip">
                      <FaUserCircle size={15} />
                      <span>Hi, {name}</span>
                    </div>

                    <Button className="capshop-logout-btn" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </BsNavbar.Collapse>
        </Container>
      </BsNavbar>
    </>
  );
};

export default Navbar;