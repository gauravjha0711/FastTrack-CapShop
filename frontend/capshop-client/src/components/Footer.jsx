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
    <>
      <style>
        {`
          .capshop-footer {
            position: relative;
            overflow: hidden;
            background:
              radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 28%),
              radial-gradient(circle at top right, rgba(124, 58, 237, 0.14), transparent 30%),
              linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e293b 100%);
            color: #f8fafc;
            border-top: 1px solid rgba(255,255,255,0.06);
            margin-top: 0;
          }

          .capshop-footer::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 1px;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(96, 165, 250, 0.65),
              rgba(168, 85, 247, 0.65),
              transparent
            );
          }

          .capshop-footer-brand {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 16px;
          }

          .capshop-footer-brand-icon {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            box-shadow: 0 10px 24px rgba(79, 70, 229, 0.28);
            flex-shrink: 0;
          }

          .capshop-footer-brand-title {
            margin: 0;
            font-size: 1.9rem;
            font-weight: 800;
            line-height: 1;
            color: #ffffff;
          }

          .capshop-footer-brand-subtitle {
            margin: 0;
            color: #94a3b8;
            font-size: 0.92rem;
            line-height: 1.3;
            font-weight: 500;
          }

          .capshop-footer-text {
            color: #cbd5e1;
            font-size: 0.97rem;
            line-height: 1.9;
            max-width: 420px;
          }

          .capshop-footer-heading {
            color: #ffffff;
            font-size: 1.08rem;
            font-weight: 700;
            margin-bottom: 18px;
            position: relative;
          }

          .capshop-footer-heading::after {
            content: "";
            display: block;
            width: 38px;
            height: 3px;
            border-radius: 999px;
            margin-top: 8px;
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          }

          .capshop-footer-links {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .capshop-footer-links li {
            margin-bottom: 12px;
          }

          .capshop-footer-link {
            color: #cbd5e1;
            text-decoration: none;
            font-size: 0.96rem;
            transition: all 0.22s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .capshop-footer-link:hover {
            color: #60a5fa;
            transform: translateX(4px);
          }

          .capshop-contact-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 14px;
            color: #dbe4f0;
            font-size: 0.96rem;
          }

          .capshop-contact-icon {
            margin-top: 5px;
            color: #60a5fa;
            flex-shrink: 0;
          }

          .capshop-social-wrap {
            display: flex;
            gap: 10px;
            margin-top: 20px;
          }

          .capshop-social-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            color: #ffffff;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.08);
            transition: all 0.25s ease;
          }

          .capshop-social-icon:hover {
            color: #ffffff;
            transform: translateY(-3px);
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            border-color: transparent;
            box-shadow: 0 12px 24px rgba(79,70,229,0.24);
          }

          .capshop-security-card {
            margin-top: 24px;
            padding: 18px;
            border-radius: 16px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
          }

          .capshop-security-title {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #ffffff;
            font-weight: 700;
            margin-bottom: 10px;
            font-size: 1rem;
          }

          .capshop-security-text {
            color: #cbd5e1;
            font-size: 0.93rem;
            line-height: 1.7;
            margin: 0;
          }

          .capshop-footer-bottom {
            border-top: 1px solid rgba(255,255,255,0.06);
            background: rgba(0,0,0,0.18);
          }

          .capshop-footer-bottom-text {
            color: #cbd5e1;
            font-size: 0.92rem;
            margin: 0;
          }

          .capshop-footer-bottom-muted {
            color: #94a3b8;
            font-size: 0.9rem;
            margin: 0;
          }

          @media (max-width: 767.98px) {
            .capshop-footer-brand-title {
              font-size: 1.6rem;
            }

            .capshop-footer-text {
              max-width: 100%;
            }
          }
        `}
      </style>

      <footer className="capshop-footer">
        <Container>
          <Row className="py-5 gy-4">
            <Col lg={4} md={6}>
              <div className="capshop-footer-brand">
                <div className="capshop-footer-brand-icon">
                  <FaShoppingBag size={18} color="#fff" />
                </div>

                <div>
                  <h4 className="capshop-footer-brand-title">CapShop</h4>
                  <p className="capshop-footer-brand-subtitle">
                    Smart Shopping Experience
                  </p>
                </div>
              </div>

              <p className="capshop-footer-text">
                CapShop is a modern eCommerce platform built for smooth browsing,
                secure checkout, and a better shopping experience across every step
                of the customer journey.
              </p>

              <div className="capshop-social-wrap">
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="capshop-social-icon"
                >
                  <FaGithub />
                </a>

                <a
                  href="https://linkedin.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="capshop-social-icon"
                >
                  <FaLinkedinIn />
                </a>

                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="capshop-social-icon"
                >
                  <FaInstagram />
                </a>

                <a
                  href="https://facebook.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="capshop-social-icon"
                >
                  <FaFacebookF />
                </a>
              </div>
            </Col>

            <Col lg={2} md={6}>
              <h5 className="capshop-footer-heading">Quick Links</h5>
              <ul className="capshop-footer-links">
                <li>
                  <Link to="/" className="capshop-footer-link">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="capshop-footer-link">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="capshop-footer-link">
                    Cart
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="capshop-footer-link">
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link to="/account" className="capshop-footer-link">
                    My Account
                  </Link>
                </li>
              </ul>
            </Col>

            <Col lg={3} md={6}>
              <h5 className="capshop-footer-heading">Customer Support</h5>
              <ul className="capshop-footer-links">
                <li>
                  <Link to="/about" className="capshop-footer-link">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="capshop-footer-link">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="capshop-footer-link">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="capshop-footer-link">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="capshop-footer-link">
                    FAQ
                  </Link>
                </li>
              </ul>
            </Col>

            <Col lg={3} md={6}>
              <h5 className="capshop-footer-heading">Contact Info</h5>

              <div className="capshop-contact-item">
                <FaMapMarkerAlt className="capshop-contact-icon" size={15} />
                <span>Punjab, India</span>
              </div>

              <div className="capshop-contact-item">
                <FaEnvelope className="capshop-contact-icon" size={15} />
                <span>support@capshop.com</span>
              </div>

              <div className="capshop-contact-item">
                <FaPhoneAlt className="capshop-contact-icon" size={15} />
                <span>+91 98765 43210</span>
              </div>

              <div className="capshop-security-card">
                <div className="capshop-security-title">
                  <FaShieldAlt color="#34d399" />
                  <span>Secure Platform</span>
                </div>
                <p className="capshop-security-text">
                  Protected login, email verification, and two-factor authentication
                  help keep your shopping experience safer and more reliable.
                </p>
              </div>
            </Col>
          </Row>
        </Container>

        <div className="capshop-footer-bottom">
          <Container>
            <div className="py-3 d-md-flex justify-content-between align-items-center text-center text-md-start">
              <p className="capshop-footer-bottom-text mb-2 mb-md-0">
                © {currentYear} CapShop. All rights reserved.
              </p>

              <p className="capshop-footer-bottom-muted mb-0">
                Designed & Developed by{" "}
                <span className="text-white fw-semibold">Gaurav Kumar</span>
              </p>
            </div>
          </Container>
        </div>
      </footer>
    </>
  );
};

export default Footer;