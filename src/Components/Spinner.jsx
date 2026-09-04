import "./Spinner.scss";

/**
 * Pure CSS spinner — replaces the 529KB loadingAnim.gif.
 * Uses role="status" and aria-label for screen reader support.
 */
function Spinner() {
  return (
    <div className="spinner" role="status" aria-label="Loading">
      <span className="spinner__ring" aria-hidden="true" />
    </div>
  );
}

export default Spinner;
