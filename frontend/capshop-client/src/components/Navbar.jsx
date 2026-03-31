import React from "react";
import { Container, Nav, Navbar as BsNavbar, Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
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
  const isAdminActive = location.pathname.startsWith("/admin");

  return (
    <>
      <style>
        {`
          .capshop-navbar {
            background:
              linear-gradient(135deg, rgba(18, 33, 66, 0.96) 0%, rgba(28, 49, 95, 0.95) 45%, rgba(20, 32, 61, 0.97) 100%);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(255,255,255,0.07);
            box-shadow: 0 12px 34px rgba(8, 15, 35, 0.28);
          }

          .capshop-brand {
            display: flex;
            align-items: center;
            gap: 14px;
            text-decoration: none;
          }

          .capshop-brand:hover {
            text-decoration: none;
          }

          .capshop-logo-wrap {
            position: relative;
            width: 58px;
            height: 58px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .capshop-logo-base {
            position: absolute;
            inset: 0;
            border-radius: 18px;
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 55%, #7c3aed 100%);
            box-shadow: 0 14px 28px rgba(79, 70, 229, 0.30);
            overflow: hidden;
          }

          .capshop-logo-base::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(255,255,255,0.20), rgba(255,255,255,0));
            pointer-events: none;
          }

          .capshop-logo-cap-crown {
            position: absolute;
            top: 17px;
            left: 16px;
            width: 27px;
            height: 15px;
            background: #ffffff;
            border-radius: 14px 14px 8px 8px;
            transform: rotate(-12deg);
            z-index: 3;
            box-shadow: 0 4px 10px rgba(15, 23, 42, 0.18);
          }

          .capshop-logo-cap-topline {
            position: absolute;
            top: 14px;
            left: 23px;
            width: 9px;
            height: 5px;
            border-top: 2px solid rgba(37, 99, 235, 0.95);
            border-radius: 50%;
            transform: rotate(-12deg);
            z-index: 4;
          }

          .capshop-logo-cap-brim {
            position: absolute;
            top: 25px;
            left: 35px;
            width: 17px;
            height: 6px;
            background: #ffffff;
            border-radius: 0 8px 8px 0;
            transform: rotate(-14deg);
            z-index: 3;
            box-shadow: 0 3px 8px rgba(15, 23, 42, 0.16);
          }

          .capshop-logo-cap-shadow {
            position: absolute;
            top: 28px;
            left: 21px;
            width: 18px;
            height: 5px;
            background: rgba(37, 99, 235, 0.22);
            border-radius: 10px;
            transform: rotate(-12deg);
            z-index: 2;
          }

          .capshop-brand-text {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .capshop-brand-title {
            margin: 0;
            font-size: 1.95rem;
            line-height: 1;
            font-weight: 900;
            letter-spacing: 0.3px;
            color: #ffffff;
            font-family: "Segoe UI", "Trebuchet MS", "Poppins", sans-serif;
          }

          .capshop-brand-title .accent {
            background: linear-gradient(135deg, #7dd3fc 0%, #a78bfa 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .capshop-brand-subtitle {
            margin: 3px 0 0 0;
            font-size: 0.82rem;
            color: #b8c6e3;
            line-height: 1.2;
            font-weight: 600;
            letter-spacing: 0.35px;
          }

          .capshop-nav-wrap {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .capshop-nav-link {
            color: #dbe7ff !important;
            font-weight: 600;
            font-size: 0.97rem;
            padding: 10px 14px !important;
            border-radius: 12px;
            transition: all 0.22s ease;
            border: 1px solid transparent;
          }

          .capshop-nav-link:hover {
            color: #ffffff !important;
            background: rgba(96, 165, 250, 0.10);
            border-color: rgba(125, 211, 252, 0.10);
          }

          .capshop-nav-link.active-link {
            color: #ffffff !important;
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.24) 0%, rgba(99, 102, 241, 0.20) 100%);
            border: 1px solid rgba(125, 211, 252, 0.16);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
          }

          .capshop-auth-actions,
          .capshop-user-actions {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-left: 16px;
          }

          .capshop-login-btn {
            border-radius: 12px;
            padding: 9px 18px;
            font-size: 0.95rem;
            font-weight: 700;
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(255,255,255,0.04);
            color: #ffffff;
            min-width: 92px;
            transition: all 0.22s ease;
          }

          .capshop-login-btn:hover {
            color: #ffffff;
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.18);
            transform: translateY(-1px);
          }

          .capshop-login-btn.active-auth-btn {
            color: #ffffff;
            background: rgba(37, 99, 235, 0.20);
            border: 1px solid rgba(125, 211, 252, 0.20);
          }

          .capshop-signup-btn {
            border-radius: 12px;
            padding: 9px 18px;
            font-size: 0.95rem;
            font-weight: 800;
            border: none;
            color: #ffffff;
            min-width: 100px;
            background: linear-gradient(135deg, #2563eb 0%, #6366f1 55%, #7c3aed 100%);
            box-shadow: 0 12px 24px rgba(79,70,229,0.24);
            transition: all 0.22s ease;
          }

          .capshop-signup-btn:hover {
            color: #ffffff;
            transform: translateY(-1px);
            box-shadow: 0 14px 28px rgba(79,70,229,0.32);
          }

          .capshop-signup-btn.active-signup-btn {
            background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 55%, #6d28d9 100%);
          }

          .capshop-user-chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #ffffff;
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(255,255,255,0.08);
            padding: 8px 14px;
            border-radius: 999px;
            font-size: 0.93rem;
            font-weight: 600;
          }

          .capshop-logout-btn {
            border-radius: 12px;
            padding: 9px 16px;
            font-size: 0.95rem;
            font-weight: 700;
            border: none;
            color: #ffffff;
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            box-shadow: 0 10px 22px rgba(239, 68, 68, 0.24);
            transition: all 0.22s ease;
          }

          .capshop-logout-btn:hover {
            color: #ffffff;
            transform: translateY(-1px);
            box-shadow: 0 12px 24px rgba(239, 68, 68, 0.30);
            background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);
          }

          .navbar-toggler {
            border-color: rgba(255,255,255,0.14) !important;
            box-shadow: none !important;
            background: rgba(255,255,255,0.06);
            border-radius: 12px;
            padding: 8px 12px;
          }

          .navbar-toggler:focus {
            box-shadow: none !important;
          }

          .navbar-toggler-icon {
            filter: brightness(0) invert(1);
          }

          @media (max-width: 991.98px) {
            .capshop-mobile-panel {
              margin-top: 14px;
              padding: 14px;
              border-radius: 18px;
              background: rgba(18, 33, 66, 0.94);
              border: 1px solid rgba(255,255,255,0.06);
              box-shadow: 0 10px 30px rgba(15, 23, 42, 0.20);
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
              width: 100%;
              justify-content: center;
            }

            .capshop-brand-title {
              font-size: 1.7rem;
            }

            .capshop-brand-subtitle {
              font-size: 0.78rem;
            }
          }
        `}
      </style>

      <BsNavbar expand="lg" sticky="top" className="capshop-navbar py-3">
        <Container>
          <BsNavbar.Brand as={Link} to="/" className="capshop-brand">
            <div className="capshop-logo-wrap">
              <div className="capshop-logo-base"></div>
              <div className="capshop-logo-cap-crown"></div>
              <div className="capshop-logo-cap-topline"></div>
              <div className="capshop-logo-cap-brim"></div>
              <div className="capshop-logo-cap-shadow"></div>
            </div>

            <div className="capshop-brand-text">
              <p className="capshop-brand-title">
                <span className="accent">Cap</span>Shop
              </p>
              <p className="capshop-brand-subtitle">Premium Smart Shopping Store</p>
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
                      className={`capshop-nav-link ${isAdminActive ? "active-link" : ""}`}
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
                      <FaUserCircle size={16} />
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