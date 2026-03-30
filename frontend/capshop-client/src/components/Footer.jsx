import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  FaEnvelope,
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
  FaShoppingBag,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
        color: "#f9fafb",
        marginTop: "0px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Container>
        <Row className="py-5 gy-4">
          <Col lg={4} md={6}>
            <div className="mb-3 d-flex align-items-center gap-2">
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(37, 99, 235, 0.35)",
                }}
              >
                <FaShoppingBag size={18} color="#fff" />
              </div>

              <div>
                <h4 className="mb-0 fw-bold text-white">CapShop</h4>
                <small style={{ color: "#9ca3af" }}>
                  Smart Shopping Experience
                </small>
              </div>
            </div>

            <p
              className="mb-3"
              style={{
                color: "#d1d5db",
                lineHeight: "1.8",
                fontSize: "0.95rem",
              }}
            >
              CapShop is a modern eCommerce platform built to deliver a secure,
              smooth, and user-friendly shopping experience. Explore products,
              manage orders, and enjoy a professional online store experience.
            </p>

            <div className="d-flex gap-2 mt-3">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                style={socialIconStyle}
              >
                <FaGithub />
              </a>
              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noreferrer"
                style={socialIconStyle}
              >
                <FaLinkedinIn />
              </a>
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noreferrer"
                style={socialIconStyle}
              >
                <FaInstagram />
              </a>
              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noreferrer"
                style={socialIconStyle}
              >
                <FaFacebookF />
              </a>
            </div>
          </Col>

          <Col lg={2} md={6}>
            <h5 className="fw-semibold mb-3 text-white">Quick Links</h5>
            <ul className="list-unstyled footer-links">
              <li>
                <Link to="/" className="footer-link-item">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="footer-link-item">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="footer-link-item">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="footer-link-item">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/account" className="footer-link-item">
                  My Account
                </Link>
              </li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h5 className="fw-semibold mb-3 text-white">Customer Support</h5>
            <ul className="list-unstyled footer-links">
              <li>
                <Link to="/about" className="footer-link-item">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link-item">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="footer-link-item">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="footer-link-item">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/faq" className="footer-link-item">
                  FAQ
                </Link>
              </li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h5 className="fw-semibold mb-3 text-white">Contact Info</h5>

            <div className="d-flex align-items-start gap-2 mb-3">
              <FaMapMarkerAlt
                style={{ marginTop: "5px", color: "#60a5fa" }}
                size={15}
              />
              <span style={{ color: "#d1d5db", fontSize: "0.95rem" }}>
                Punjab, India
              </span>
            </div>

            <div className="d-flex align-items-start gap-2 mb-3">
              <FaEnvelope
                style={{ marginTop: "5px", color: "#60a5fa" }}
                size={15}
              />
              <span style={{ color: "#d1d5db", fontSize: "0.95rem" }}>
                support@capshop.com
              </span>
            </div>

            <div className="d-flex align-items-start gap-2 mb-3">
              <FaPhoneAlt
                style={{ marginTop: "5px", color: "#60a5fa" }}
                size={15}
              />
              <span style={{ color: "#d1d5db", fontSize: "0.95rem" }}>
                +91 98765 43210
              </span>
            </div>

            <div
              className="mt-4 p-3"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaShieldAlt color="#34d399" />
                <span className="fw-semibold text-white">Secure Platform</span>
              </div>
              <small style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
                Protected login, email OTP verification, and two-factor
                authentication for safer shopping.
              </small>
            </div>
          </Col>
        </Row>
      </Container>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.18)",
        }}
      >
        <Container>
          <div className="py-3 d-md-flex justify-content-between align-items-center text-center text-md-start">
            <p className="mb-2 mb-md-0" style={{ color: "#cbd5e1", fontSize: "0.92rem" }}>
              © {currentYear} CapShop. All rights reserved.
            </p>
            <p className="mb-0" style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
              Designed & Developed by <span className="text-white fw-semibold">Gaurav Kumar</span>
            </p>
          </div>
        </Container>
      </div>

      <style>{`
        .footer-links li {
          margin-bottom: 10px;
        }

        .footer-link-item {
          color: #d1d5db;
          text-decoration: none;
          transition: all 0.25s ease;
          font-size: 0.95rem;
          display: inline-block;
        }

        .footer-link-item:hover {
          color: #60a5fa;
          transform: translateX(4px);
        }
      `}</style>
    </footer>
  );
};

const socialIconStyle = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  color: "#ffffff",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  transition: "all 0.3s ease",
};

export default Footer;