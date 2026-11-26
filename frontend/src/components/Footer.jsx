import logo from '../assets/logo.png'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <img src={logo} alt="iSport" />
          <span>© 2026 iSport Platform. Tous droits réservés.</span>
        </div>

        <nav className="footer-links">
          <span>Règles de jeu</span>
          <span>Terrains partenaires</span>
          <span>Support</span>
        </nav>
      </div>
    </footer>
  )
}

export default Footer