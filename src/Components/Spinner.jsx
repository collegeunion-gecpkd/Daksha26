import "./Spinner.scss";

import loadingAnim from "../assets/loadingAnim.gif";

function Spinner() {
  return (
    <div className="spinner" role="status" aria-label="Loading">
      <img src={loadingAnim} alt="Loading..." className="spinner__gif" />
    </div>
  );
}

export default Spinner;
