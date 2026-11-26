import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'
import './Navbar.css'

const LINKS = [
  { to: '/tableau-de-bord', label: 'Tableau de bord' },
  { to: '/creer-match', label: 'Créer un match' },
  { to: '/rechercher', label: 'Rechercher des matchs' },
  { to: '/sports', label: 'Sports' },
]

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/tableau-de-bord" className="navbar-logo">
          <img src={logo} alt="iSport - Connect. Play. Discover." />
        </NavLink>

        <nav className="navbar-links">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? 'navbar-link navbar-link-active' : 'navbar-link'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Navbar