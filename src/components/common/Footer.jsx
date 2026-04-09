
import { Link } from "react-router-dom";
import "../../assets/pagesCss/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-logo"><span>Amore</span> mebel</div>
          <p className="footer-desc">High quality, stylish and functional furniture designed to elevate your space with comfort and elegance.</p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/categories">Products</Link>
          <Link to="/collections">Collections</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/campaigns">Campaigns</Link>
          <Link to="/categories">Categories</Link>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/profile">My Profile</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Amoremebel. All rights reserved.</p>
        <div className="socials">
          <a className="social-btn" href="#" aria-label="X (Twitter)">𝕏</a>
          <a className="social-btn" href="#" aria-label="Facebook">f</a>
          <a className="social-btn" href="#" aria-label="LinkedIn">in</a>
          <a className="social-btn" href="#" aria-label="YouTube">▶</a>
        </div>
      </div>
    </footer>
  );
}
 