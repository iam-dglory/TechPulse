import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './auth/AuthModal';

function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setAuthModalOpen(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">TexhPulze</span>
          </Link>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <Link
              to="/"
              className={isActive('/')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={isActive('/about')}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={isActive('/contact')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>

            {/* Authentication Controls */}
            <div className="nav-auth">
              {user ? (
                <div className="user-menu-wrapper">
                  <button
                    className="user-menu-trigger"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-label="User menu"
                  >
                    <div className="user-avatar">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt={user.user_metadata?.full_name || 'User'}
                        />
                      ) : (
                        <span>
                          {user.user_metadata?.full_name
                            ? user.user_metadata.full_name.charAt(0).toUpperCase()
                            : user.email.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="user-menu-dropdown">
                      <div className="user-menu-header">
                        <p className="user-name">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="user-email">{user.email}</p>
                      </div>
                      <div className="user-menu-divider"></div>
                      <button className="user-menu-item" onClick={handleSignOut}>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button className="btn-text" onClick={handleSignIn}>
                    Sign In
                  </button>
                  <button className="btn-primary-sm" onClick={handleSignUp}>
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}

export default Navbar;
