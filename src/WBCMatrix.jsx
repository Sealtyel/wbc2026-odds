import { useState } from "react";

// ─────────────────────────────────────────────
// COMPLETED HEAD-TO-HEAD RESULTS
//
// USA vs MEX (USA won, USA was HOME):
//   USA allowed: 3 runs in 24 outs (MEX didn't bat bottom 9th)
//   MEX allowed: 5 runs in 27 outs
//
// USA vs ITA (ITA won, USA was HOME):
//   USA allowed: 8 runs in 27 outs (ITA batted all 9 half-innings including top 9th)
//   ITA allowed: 6 runs in 27 outs (USA batted bottom 9th trying to come back)
//
// USA FIXED QUOTIENT: 11 runs / 51 outs = 0.21569
//
// ITA vs MEX (ITA is HOME — listed first on schedule):
//   If MEX wins in 9 inn:
//     MEX bats top every inning incl 9th  → ITA records 27 outs against MEX
//     ITA doesn't bat bottom 9th          → MEX records 24 outs against ITA
//   Each extra inning: +3 outs for each team
// ─────────────────────────────────────────────

const USA_RUNS = 11;
const USA_OUTS = 51;
const USA_Q = USA_RUNS / USA_OUTS;

const MEX_BASE_RUNS = 5;   // allowed vs USA
const MEX_BASE_OUTS = 27;  // outs Mexico recorded vs USA

const ITA_BASE_RUNS = 6;   // allowed vs USA
const ITA_BASE_OUTS = 27;  // outs Italy recorded vs USA

function getResult(italyRunsAllowed, mexicoRunsAllowed, extraInnings) {
  // italyRunsAllowed = runs Mexico scores off Italy
  // mexicoRunsAllowed = runs Italy scores off Mexico
  // MEX wins → italyRunsAllowed > mexicoRunsAllowed (enforced by caller)

  const extraOuts = extraInnings * 3;
  // MEX is HOME. If MEX wins in 9 inn:
  //   ITA (away) bats top of every inning incl 9th  → MEX records 27 outs
  //   MEX (home) doesn't bat bottom 9th             → ITA records 24 outs
  const itaOutsVsMex = 24 + extraOuts;  // outs Italy records against Mexico
  const mexOutsVsIta = 27 + extraOuts;  // outs Mexico records against Italy

  // MEX total quotient: (runs allowed vs USA + runs allowed vs ITA) / (outs vs USA + outs vs ITA)
  const mex_q = (MEX_BASE_RUNS + mexicoRunsAllowed) / (MEX_BASE_OUTS + mexOutsVsIta);
  // ITA total quotient: (runs allowed vs USA + runs allowed vs MEX) / (outs vs USA + outs vs MEX)
  const ita_q = (ITA_BASE_RUNS + italyRunsAllowed) / (ITA_BASE_OUTS + itaOutsVsMex);

  const teams = [
    { name: "USA", q: USA_Q },
    { name: "MEX", q: mex_q },
    { name: "ITA", q: ita_q },
  ].sort((a, b) => a.q - b.q);

  return {
    first: teams[0].name,
    second: teams[1].name,
    eliminated: teams[2].name,
    q: { USA: USA_Q, MEX: mex_q, ITA: ita_q },
  };
}

const FLAG = { USA: "🇺🇸", MEX: "🇲🇽", ITA: "🇮🇹" };

function outcomeKey(r) {
  return [r.first, r.second].sort().join("+");
}

const OUTCOME_STYLES = {
  "MEX+USA": { bg: "#040f08", border: "#1a6a35", dot: "#22c55e", label: "🇲🇽🇺🇸  MEX + USA advance  🇮🇹 out" },
  "ITA+MEX": { bg: "#050c10", border: "#1a5a6a", dot: "#38bdf8", label: "🇲🇽🇮🇹  MEX + ITA advance  🇺🇸 out" },
  "ITA+USA": { bg: "#1a0506", border: "#8b1a1a", dot: "#ef4444", label: "🇮🇹🇺🇸  ITA + USA advance  🇲🇽 out" },
};

export default function WBCMatrix() {
  const [hovered, setHovered] = useState(null);
  const [extraInnings, setExtraInnings] = useState(0);

  const maxScore = 12;
  const scores = Array.from({ length: maxScore + 1 }, (_, i) => i); // 0..12

  return (
    <div style={{
      minHeight: "100vh",
      background: "#04060e",
      color: "#ccd0e8",
      fontFamily: "'Space Mono', monospace",
      padding: "28px 16px 48px",
      boxSizing: "border-box",
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#4a5aff", marginBottom: 7, textTransform: "uppercase" }}>
          2026 World Baseball Classic · Pool B · March 11
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
          🇮🇹 Italy vs Mexico 🇲🇽
        </div>
        <div style={{ fontSize: 9, color: "#445", marginTop: 5, letterSpacing: "0.08em" }}>
          If Mexico wins — who advances to the quarterfinals?
        </div>

        <div style={{
          display: "inline-flex", flexDirection: "column", alignItems: "flex-start",
          marginTop: 12, background: "#0a0d1a", border: "1px solid #191d30",
          borderRadius: 7, padding: "9px 16px", fontSize: 9, color: "#6070a0", lineHeight: 2, textAlign: "left",
        }}>
          <span>🇺🇸 <strong style={{ color: "#909ed8" }}>USA fixed quotient: {USA_Q.toFixed(4)}</strong> ({USA_RUNS} R / {USA_OUTS} outs)</span>
          <span>🇮🇹 Mexico is <strong style={{ color: "#c0c8e8" }}>home team</strong> · MEX win in 9 inn → ITA records 24 outs, MEX records 27 outs</span>
          <span>Rows = MEX score &nbsp;·&nbsp; Columns = ITA score &nbsp;·&nbsp; Upper-right triangle = Italy wins outright</span>
        </div>
      </div>

      {/* Extra innings toggle */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {[0, 1, 2, 3].map(n => (
          <button key={n} onClick={() => setExtraInnings(n)} style={{
            background: extraInnings === n ? "#151e50" : "transparent",
            border: `1px solid ${extraInnings === n ? "#4a5aff" : "#1e2235"}`,
            color: extraInnings === n ? "#909eff" : "#40486a",
            borderRadius: 5, padding: "5px 13px",
            fontSize: 9, cursor: "pointer", letterSpacing: "0.12em",
            textTransform: "uppercase", transition: "all 0.15s",
          }}>
            {n === 0 ? "9 inn" : `+${n} extra`}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
        {Object.entries(OUTCOME_STYLES).map(([key, s]) => (
          <div key={key} style={{
            display: "flex", alignItems: "center", gap: 7,
            background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: 5, padding: "5px 11px", fontSize: 9,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
            <span style={{ color: "#8899bb" }}>{s.label}</span>
          </div>
        ))}
        {/* Italy wins outright is covered by ITA+USA color */}
      </div>

      {/* Matrix */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", margin: "0 auto" }}>
          <thead>
            <tr>
              <th style={{
                padding: "8px 12px", fontSize: 8, color: "#2a3050",
                letterSpacing: "0.06em", textAlign: "center",
                borderBottom: "1px solid #111520", borderRight: "1px solid #111520",
              }}>
                🇲🇽↓ / 🇮🇹→
              </th>
              {scores.map(is => (
                <th key={is} style={{
                  padding: "6px 0", textAlign: "center", minWidth: 58,
                  fontSize: 11, color: "#505880",
                  borderBottom: "1px solid #111520",
                }}>
                  {is}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scores.map(ms => (
              <tr key={ms}>
                {/* Row header */}
                <td style={{
                  padding: "4px 12px", textAlign: "center",
                  fontSize: 11, color: "#505880", fontWeight: 700,
                  borderRight: "1px solid #111520",
                }}>
                  {ms}
                </td>

                {scores.map(is => {
                  // Italy wins or tie (extra innings tie goes to 10th, but if MEX can't win it's Italy win)
                  const isTie = is === ms;
                  const italyWins = is > ms;
                  const cellId = `${ms}-${is}`;
                  const isHov = hovered === cellId;

                  if (isTie) {
                    return (
                      <td key={is} style={{
                        border: "1px solid #0b0e18",
                        background: "#04060e",
                        height: 52, minWidth: 58,
                      }} />
                    );
                  }

                  if (italyWins) {
                    // Italy wins outright → no tiebreaker
                    // ITA advances (4-0), USA advances via H2H over MEX, MEX eliminated
                    const s = OUTCOME_STYLES["ITA+USA"];
                    return (
                      <td
                        key={is}
                        onMouseEnter={() => setHovered(cellId)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          border: `1px solid ${isHov ? s.border : s.border + "33"}`,
                          background: isHov
                            ? s.bg.replace(/#0(\w)/, (_, x) => `#1${x}`)
                            : s.bg,
                          cursor: "default",
                          transition: "all 0.1s",
                          height: 52, minWidth: 58,
                          verticalAlign: "middle",
                        }}
                      >
                        <div style={{
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                          gap: 2, padding: "3px 2px",
                        }}>
                          <div style={{ fontSize: 15, lineHeight: 1 }}>🇮🇹🇺🇸</div>
                          <div style={{ fontSize: 8, color: s.dot, opacity: 0.8, letterSpacing: "0.02em" }}>
                            🇲🇽 out
                          </div>
                          {isHov && (
                            <div style={{ fontSize: 7.5, color: "#405060", lineHeight: 1.4, textAlign: "center", marginTop: 1 }}>
                              Italy wins outright
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  }

                  // Mexico wins
                  // italyRunsAllowed = ms (what Mexico scored = what Italy allowed)
                  // mexicoRunsAllowed = is (what Italy scored = what Mexico allowed)
                  const result = getResult(ms, is, extraInnings);
                  const key = outcomeKey(result);
                  const s = OUTCOME_STYLES[key];

                  return (
                    <td
                      key={is}
                      onMouseEnter={() => setHovered(cellId)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        border: `1px solid ${isHov ? s.border : s.border + "44"}`,
                        background: isHov
                          ? s.bg.replace(/#0(\w)/, (_, x) => `#1${x}`)
                          : s.bg,
                        cursor: "default",
                        transition: "all 0.1s",
                        height: 52, minWidth: 58,
                        verticalAlign: "middle",
                      }}
                    >
                      <div style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: 2, padding: "3px 2px",
                      }}>
                        <div style={{ fontSize: 15, lineHeight: 1 }}>
                          {FLAG[result.first]}{FLAG[result.second]}
                        </div>
                        <div style={{ fontSize: 8, color: s.dot, opacity: 0.8, letterSpacing: "0.02em" }}>
                          {FLAG[result.eliminated]} out
                        </div>
                        {isHov && (
                          <div style={{ fontSize: 7.5, lineHeight: 1.6, marginTop: 2 }}>
                            {["USA", "MEX", "ITA"]
                              .slice()
                              .sort((a, b) => result.q[a] - result.q[b])
                              .map((t, i, arr) => (
                              <div key={t} style={{
                                display: "flex", alignItems: "center", gap: 3,
                                color: i === arr.length - 1 ? "#f87171"
                                  : (i === 0 ? "#a0e0ff" : "#88a0c0"),
                              }}>
                                <span style={{ fontSize: 10 }}>{FLAG[t]}</span>
                                <span>{result.q[t].toFixed(3)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", marginTop: 26,
        fontSize: 8, color: "#202535", letterSpacing: "0.04em", lineHeight: 2,
      }}>
        Quotient = runs allowed ÷ defensive outs across all head-to-head games between tied teams<br />
        Hover any cell to see exact quotients · Red = eliminated team · Blue highlight = 1st place
      </div>
    </div>
  );
}
