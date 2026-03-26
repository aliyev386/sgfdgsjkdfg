
import "../../assets/css/common/Footer.css";
function Footer(){


    return(
        <footer className="ft">
        <div className="ft-tp">
          <div>
            <div className="ft-lg"><span>AMORE</span> MEBEL</div>
            <p className="ft-tg">Artisan furniture crafted with care,<br />designed for the homes of tomorrow.</p>
            <div className="soc">{["📸","📌","👍","🎵"].map((ic,i) => <button key={i} className="sc-i">{ic}</button>)}</div>
          </div>
          <div className="ft-col">
            <h4>Collections</h4>
            {/* <ul className="ft-ul">{DB.rooms.map(r => <li key={r.id}><a href="#" onClick={e=>{e.preventDefault();onSelectRoom(r)}}>{r.name}</a></li>)}</ul> */}
          </div>
          <div className="ft-col">
            <h4>Company</h4>
            <ul className="ft-ul">{["Our Story","Craftsmanship","Sustainability","Careers","Press"].map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
          </div>
          <div className="ft-col">
            <h4>Contact</h4>
            <div>
              <div className="ft-ci"><span className="ft-ico">📞</span><span>+44 20 7123 4567</span></div>
              <div className="ft-ci"><span className="ft-ico">✉️</span><span>amoremebel@gmail.com</span></div>
            </div>
          </div>
        </div>
        <div className="ft-bt">
          <p className="ft-cp">© 2025 Arvana Furniture Ltd. All rights reserved.</p>

<div className="ft-lgs">
  <a href="#">Privacy Policy</a>
</div>
<div className="ft-lgs">
  <a href="#">Terms of Service</a>
</div>
<div className="ft-lgs">
  <a href="#">Cookie Settings</a>
</div>        </div>
      </footer>
    )
}
export default Footer;