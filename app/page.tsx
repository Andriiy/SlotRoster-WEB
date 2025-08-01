export default function HomePage() {
  return (
    <div className="container">
      <div className="content">
        <h1 className="title">
          SlotRoster
        </h1>
        <p className="subtitle">
          Flight Club Management Platform
        </p>
        <div className="buttons">
          <a 
            href="/sign-in" 
            className="button primary"
          >
            Sign In
          </a>
          <a 
            href="/sign-up" 
            className="button secondary"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
} 