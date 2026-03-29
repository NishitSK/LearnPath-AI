import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";
import "./Navbar.css";

const Navbar = () => {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/assessments", label: "Assessments" },
    { to: "/learning-plans", label: "Learning Plans" },
    { to: "/progress", label: "Progress" },
    { to: "/ai-assistant", label: "AI Assistant" },
    { to: "/about", label: "About Us" },
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className={`navbar ${mobileMenuOpen ? "mobile-open" : ""}`}>
      <Link to="/" className="navbar-logo">
        <img src="/logo.png" alt="LearnPath AI" className="logo-icon" />
        <span className="brand-gradient">LearnPath AI</span>
      </Link>

      <button
        type="button"
        className={`navbar-menu-toggle ${mobileMenuOpen ? "active" : ""}`}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
        onClick={() => setMobileMenuOpen(prev => !prev)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className="navbar-links">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link ${pathname === to ? "active" : ""}`}
          >
            {label}
            {pathname === to && <span className="nav-dot" />}
          </Link>
        ))}
      </div>

      <div className="navbar-actions">
        <SignedOut>
          <SignInButton mode="modal" fallbackRedirectUrl="/learning-plans?auth=login" forceRedirectUrl="/learning-plans?auth=login" signUpFallbackRedirectUrl="/learning-plans?auth=login">
            <button className="btn-signin">Sign In</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/?auth=logout" />
        </SignedIn>
      </div>

      <div className="mobile-menu" aria-hidden={!mobileMenuOpen}>
        <div className="mobile-menu-links">
          {links.map(({ to, label }) => (
            <Link
              key={`mobile-${to}`}
              to={to}
              className={`nav-link ${pathname === to ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="mobile-menu-actions">
          <SignedOut>
            <SignInButton mode="modal" fallbackRedirectUrl="/learning-plans?auth=login" forceRedirectUrl="/learning-plans?auth=login" signUpFallbackRedirectUrl="/learning-plans?auth=login">
              <button className="btn-signin">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/?auth=logout" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
