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

  // Compute display time only when a valid timestamp exists
  const getLastUpdatedTime = useCallback(() => {
    if (!lastUpdatedTime) {
      setMins(null);
      return;
    }
    setMins(Math.floor(Math.abs(new Date() - lastUpdatedTime) / 60000));
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
      .then((response) => {
        if (!response.ok) throw new Error("HTTP error " + response.status);
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data) && data.data.length > 0) {
          setBoardData(data.data.sort((a, b) => b.Point - a.Point));
          setLastUpdatedTime(new Date());
          setIsLoading(false);
        } else {
          throw new Error("Invalid data format");
        }
      })
      .catch(() => {
        // Fall back to bundled fallback data so users never see an empty broken table
        fetch("/boardData.json")
          .then((res) => res.json())
          .then((localData) => {
            if (Array.isArray(localData) && localData.length > 0) {
              const formatted = localData.map((item) => ({
                YearName: item.teamName,
                Year: parseInt(item.year, 10) || 1,
                Point: item.point || 0,
              }));
              setBoardData(formatted.sort((a, b) => b.Point - a.Point));
              setError(null);
            } else {
              setError("Failed to load leaderboard. Please try again.");
            }
          })
          .catch(() => {
            setError("Failed to load leaderboard. Please try again.");
          })
          .finally(() => {
            setIsLoading(false);
          });
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
        <span>{mins !== null ? `Updated ${mins} minute(s) ago` : "Standings"}</span>
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
              {columns.map((title) => (
                <th key={title}>{title}</th>
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
