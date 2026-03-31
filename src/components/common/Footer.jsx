
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
          <a>Home</a><a>About Us</a><a>Products</a><a>Collections</a><a>Contact</a>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <a>Privacy Policy</a><a>Terms of Service</a><a>Shipping Policy</a><a>Refund Policy</a>
        </div>
        <div className="footer-col">
          <h4>Resources</h4>
          <a>Blog</a><a>FAQ</a><a>Support</a><a>Careers</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Amoremebel. All rights reserved.</p>
        <div className="socials">
          <a className="social-btn">𝕏</a>
          <a className="social-btn">f</a>
          <a className="social-btn">in</a>
          <a className="social-btn">▶</a>
        </div>
      </div>
    </footer>
  );
}
 