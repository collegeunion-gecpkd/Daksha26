import { useState, useEffect, useCallback } from "react";

import "./Board.scss";
import Spinner from "../Components/Spinner";

function Board() {
  const columns = ["Team", "Points"];
  const [boardData, setBoardData] = useState([]);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(null);
  const [mins, setMins] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Compute display time from the lastUpdatedTime state value —
  // avoids the stale closure bug of reading state inside a callback
  const getLastUpdatedTime = useCallback(() => {
    setMins((prev) =>
      Math.floor(Math.abs(new Date() - lastUpdatedTime) / 60000)
    );
  }, [lastUpdatedTime]);

  function ordinal_suffix_of(i) {
    let j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) {
      return i + "st";
    }
    if (j === 2 && k !== 12) {
      return i + "nd";
    }
    if (j === 3 && k !== 13) {
      return i + "rd";
    }
    return i + "th";
  }

  const getBoardData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetch(
      "https://script.google.com/macros/s/AKfycbyGujyOWsqlnFyJGPzIvICGVBLW1yqp99YDkTsb_7a2575PG--75PYZdAD00T0ziwyM/exec?type=points"
    )
      .then((response) => response.json())
      .then((data) => {
        setBoardData(
          data.data.sort((a, b) => b.Point - a.Point)
        );
        setIsLoading(false);
        setLastUpdatedTime(new Date()); // triggers getLastUpdatedTime via useEffect below
      })
      .catch(() => {
        setError("Failed to load leaderboard. Please try again.");
        setIsLoading(false);
      });
  }, []);

  // Recompute displayed minutes whenever lastUpdatedTime changes
  useEffect(() => {
    getLastUpdatedTime();
  }, [lastUpdatedTime, getLastUpdatedTime]);

  useEffect(() => {
    getBoardData();
  }, [getBoardData]);

  useEffect(() => {
    const interval1 = setInterval(getBoardData, 1000 * 60 * 5);
    return () => clearInterval(interval1);
  }, [getBoardData]);

  useEffect(() => {
    const interval2 = setInterval(getLastUpdatedTime, 1000 * 60);
    return () => clearInterval(interval2);
  }, [getLastUpdatedTime]);

  return (
    <div className="board--box">
      <div className="title--box">
        <h1>Leader Board</h1>
        <span>Updated {mins !== null ? `${mins} minute(s) ago` : "just now"}</span>
      </div>
      {error && (
        <p role="alert" style={{ textAlign: "center", color: "rgba(255,100,100,0.9)", padding: "2rem" }}>
          {error}
        </p>
      )}
      {isLoading ? (
        <Spinner />
      ) : (
        <table>
          <thead>
            <tr>
              {columns.map((title, index) => (
                <th key={index}>{title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {boardData.map((row) => (
              <tr key={row.YearName}>
                <td className="teamName">
                  {row.YearName}
                  <span>{`${ordinal_suffix_of(row.Year)} year`}</span>
                </td>
                <td className="points">{row.Point}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Board;
