import { useState, useEffect, useCallback } from "react";

import Spinner from "../Components/Spinner";
import "./Board.scss";

// Normalizer for the 6 official batches
function getBatchInfo(rawYear, rawName) {
  const str = `${rawYear || ""} ${rawName || ""}`.trim().toLowerCase();

  if (str.includes("mtech second") || str.includes("m.tech 2") || str.includes("mtech 2")) {
    return { name: "M.Tech 2nd Year", tag: "MTech Second", key: "mtech-2" };
  }
  if (str.includes("mtech first") || str.includes("m.tech 1") || str.includes("mtech 1") || str.includes("mtech")) {
    return { name: "M.Tech 1st Year", tag: "MTech First", key: "mtech-1" };
  }
  if (str.includes("fourth") || str.includes("4th") || str.includes("year 4")) {
    return { name: "4th Year", tag: "Fourth", key: "fourth" };
  }
  if (str.includes("third") || str.includes("3rd") || str.includes("year 3")) {
    return { name: "3rd Year", tag: "Third", key: "third" };
  }
  if (str.includes("second") || str.includes("2nd") || str.includes("year 2")) {
    return { name: "2nd Year", tag: "Second", key: "second" };
  }
  if (str.includes("first") || str.includes("1st") || str.includes("year 1")) {
    return { name: "1st Year", tag: "First", key: "first" };
  }
  return { name: rawName || "Batch", tag: rawYear || "", key: rawName || "other" };
}

function Board() {
  const [boardData, setBoardData] = useState(() => {
    try {
      const cached = localStorage.getItem("daksha_board_cache_v2");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [lastUpdatedTime, setLastUpdatedTime] = useState(null);
  const [timeAgo, setTimeAgo] = useState("Just now");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Update relative time display
  useEffect(() => {
    if (!lastUpdatedTime) return;

    const updateRelative = () => {
      const sec = Math.floor((new Date() - lastUpdatedTime) / 1000);
      if (sec < 45) {
        setTimeAgo("Just now");
      } else if (sec < 90) {
        setTimeAgo("1 min ago");
      } else {
        setTimeAgo(`${Math.floor(sec / 60)} mins ago`);
      }
    };

    updateRelative();
    const timer = setInterval(updateRelative, 15000);
    return () => clearInterval(timer);
  }, [lastUpdatedTime]);

  // Fetch leaderboard data with fallback
  const getBoardData = useCallback((manual = false) => {
    if (manual) setIsRefreshing(true);
    else if (boardData.length === 0) setIsLoading(true);

    setError(null);

    fetch(
      "https://script.google.com/macros/s/AKfycbxCw-ulTAh7K7olhKI_jNzDJZI8rc8S7ucLmCSWJDnh8bN8vyqbYf6SqPb7LRSuDllp/exec?type=points"
    )
      .then((response) => {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data) && data.data.length > 0) {
          const sorted = data.data
            .map((item) => ({
              YearName: item.YearName || item.teamName,
              Year: item.Year || item.year,
              Point: Number(item.Point ?? item.point ?? 0),
            }))
            .sort((a, b) => b.Point - a.Point);

          setBoardData(sorted);
          setLastUpdatedTime(new Date());
          try {
            localStorage.setItem("daksha_board_cache_v2", JSON.stringify(sorted));
          } catch (e) {
            void e;
          }
          setIsLoading(false);
          setIsRefreshing(false);
        } else {
          throw new Error("Invalid points data format");
        }
      })
      .catch(() => {
        // Fallback to bundled board data
        fetch("/boardData.json")
          .then((res) => res.json())
          .then((localData) => {
            if (Array.isArray(localData) && localData.length > 0) {
              const formatted = localData
                .map((item) => ({
                  YearName: item.teamName,
                  Year: item.year,
                  Point: Number(item.point ?? 0),
                }))
                .sort((a, b) => b.Point - a.Point);

              setBoardData(formatted);
              setLastUpdatedTime(new Date());
              try {
                localStorage.setItem("daksha_board_cache_v2", JSON.stringify(formatted));
              } catch (e) {
                void e;
              }
              setError(null);
            } else {
              setError("Failed to load leaderboard.");
            }
          })
          .catch(() => {
            setError("Failed to load leaderboard. Please check your connection.");
          })
          .finally(() => {
            setIsLoading(false);
            setIsRefreshing(false);
          });
      });
  }, [boardData.length]);

  // Initial load
  useEffect(() => {
    getBoardData();
  }, [getBoardData]);

  // Real-time polling every 30 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      getBoardData();
    }, 30000);
    return () => clearInterval(pollInterval);
  }, [getBoardData]);

  // Max points for relative progress bar
  const maxPoints = boardData.length > 0 ? Math.max(...boardData.map((d) => d.Point), 1) : 100;

  return (
    <main className="board--box">
      <div className="title--box">
        <h1>Leader Board</h1>
        <div className="board-status-row">
          <span className="board-status-dot" aria-hidden="true" />
          <span className="board-status-text">
            Live Standings • {lastUpdatedTime ? timeAgo : "Updating…"}
          </span>
          <button
            type="button"
            className={"board-refresh-btn" + (isRefreshing ? " is-refreshing" : "")}
            onClick={() => getBoardData(true)}
            aria-label="Refresh standings"
            title="Refresh standings"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" style={{ textAlign: "center", color: "rgba(255,100,100,0.9)", padding: "2rem" }}>
          {error}
        </p>
      )}

      {isLoading && boardData.length === 0 ? (
        <Spinner />
      ) : (
        <div className="board-table-container">
          <table className="board-table">
            <thead>
              <tr>
                <th className="th-rank">Rank</th>
                <th className="th-batch">Batch</th>
                <th className="th-points">Points</th>
              </tr>
            </thead>
            <tbody>
              {boardData.map((row, index) => {
                const rank = index + 1;
                const batch = getBatchInfo(row.Year, row.YearName);
                const progressPct = Math.round((row.Point / maxPoints) * 100);

                return (
                  <tr key={batch.key} className={`tr-rank tr-rank--${rank <= 3 ? rank : "regular"}`}>
                    <td className="td-rank">
                      <span className={`rank-badge rank-badge--${rank <= 3 ? rank : "default"}`}>
                        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                      </span>
                    </td>
                    <td className="td-batch">
                      <div className="batch-name-wrap">
                        <span className="batch-name">{batch.name}</span>
                        <span className="batch-tag">{batch.tag}</span>
                      </div>
                      <div className="batch-bar-track">
                        <div
                          className="batch-bar-fill"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </td>
                    <td className="td-points">
                      <span className="points-value">{row.Point}</span>
                      <span className="points-label">pts</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default Board;
