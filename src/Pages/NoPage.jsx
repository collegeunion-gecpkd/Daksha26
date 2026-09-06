import { Link } from "react-router-dom";
import "./NoPage.scss";

function NoPage() {
  return (
    <main className="errBox">
      <h1 className="errBox__code">404</h1>
      <h2 className="errBox__title">Page Not Found</h2>
      <p className="errBox__desc">
        The page you are looking for doesn&apos;t exist or might be coming soon.
      </p>
      <Link to="/" className="errBox__home-btn">
        Return to Home
      </Link>
    </main>
  );
}

export default NoPage;
