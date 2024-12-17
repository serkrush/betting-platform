import React, { useState } from "react";
import "./BettingPlatformApp.css";

class BettingPlatform {
  constructor() {
    this.bets = { choice1: [], choice2: [] };
    this.odds = { choice1: 0.5, choice2: 0.5 };
    this.userCount = 0;
  }

  placeBet(choice, amount, name) {
    if (choice !== "choice1" && choice !== "choice2")
      throw new Error("Invalid choice");

    const currentProbability = this.odds[choice];
    this.bets[choice].push({
      name,
      amount,
      probability: currentProbability,
    });
    this.userCount++;
    this.calculateOdds();
  }

  calculateOdds() {
    const totalChoice1 = this.bets.choice1.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    const totalChoice2 = this.bets.choice2.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    const total = totalChoice1 + totalChoice2;

    this.odds = {
      choice1: total > 0 ? totalChoice1 / total : 0.5,
      choice2: total > 0 ? totalChoice2 / total : 0.5,
    };
  }

  calculatePotentialWin(choice, amount) {
    return amount / this.odds[choice];
  }

  getTotalBets() {
    return {
      choice1: this.bets.choice1.reduce((acc, curr) => acc + curr.amount, 0),
      choice2: this.bets.choice2.reduce((acc, curr) => acc + curr.amount, 0),
    };
  }

  getWinners(winningChoice) {
    const totalChoice1 = this.bets.choice1.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    const totalChoice2 = this.bets.choice2.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );

    const winners = {
      choice1: [],
      choice2: [],
    };

    let totalWeightedBets = 0;
    if (winningChoice === "choice1") {
      for (let i = 0; i < this.bets.choice1.length; i++) {
        totalWeightedBets =
          totalWeightedBets + 1 / (this.bets.choice1[i].probability + 0.01);
      }

      winners.choice1 = this.bets.choice1.map((bet, index) => ({
        name: bet.name,
        bet: bet.amount,
        probability: bet.probability,
        bank: totalChoice2,
        weightedBets: 1 / (bet.probability + 0.01),
        totalWeightedBets: totalWeightedBets,
      }));
    } else if (winningChoice === "choice2") {
      for (let i = 0; i < this.bets.choice2.length; i++) {
        totalWeightedBets =
          totalWeightedBets + 1 / (this.bets.choice2[i].probability + 0.01);
      }

      winners.choice2 = this.bets.choice2.map((bet, index) => ({
        name: bet.name,
        bet: bet.amount,
        probability: bet.probability,
        bank: totalChoice1,
        weightedBets: 1 / (bet.probability + 0.01),
        totalWeightedBets: totalWeightedBets,
      }));
    }

    return winners;
  }
}

export default function BettingPlatformApp() {
  const [platform] = useState(new BettingPlatform());
  const [bets, setBets] = useState({ choice1: 0, choice2: 0 });
  const [odds, setOdds] = useState({ choice1: 0.5, choice2: 0.5 });
  const [betChoice1, setBetChoice1] = useState("");
  const [betChoice2, setBetChoice2] = useState("");
  const [betDetails, setBetDetails] = useState({ choice1: [], choice2: [] });
  const [logs, setLogs] = useState([]);

  const placeBet = (choice, amount) => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid bet amount");
      return;
    }

    const currentProbability = platform.odds[choice];
    const userId = platform.userCount + 1;
    const userName = `user${userId}`;

    setBetDetails((prev) => ({
      ...prev,
      [choice]: [
        ...prev[choice],
        {
          name: userName,
          bet: parsedAmount,
          probability: currentProbability,
        },
      ],
    }));

    platform.placeBet(choice, parsedAmount, userName);
    setBets(platform.getTotalBets());
    setOdds({ ...platform.odds });

    if (choice === "choice1") setBetChoice1("");
    if (choice === "choice2") setBetChoice2("");
  };

  const endChoiceWithWinner = (winningChoice) => {
    const winners = platform.getWinners(winningChoice);

    const newLogs = [];
    if (winners.choice1.length > 0) {
      newLogs.push("Winners on Choice 1:");
      winners.choice1.forEach((winner) => {
        newLogs.push(
          `User ${winner.name} placed ${winner.bet}$ with odds of ${winner.probability.toFixed(2)} and won ${(
            (winner.weightedBets / winner.totalWeightedBets) *
            winner.bank
          ).toFixed(2)}$`
        );
      });
    }

    if (winners.choice2.length > 0) {
      newLogs.push("Winners on Choice 2:");
      winners.choice2.forEach((winner) => {
        newLogs.push(
          `User ${winner.name} placed ${winner.bet}$ with odds of ${winner.probability.toFixed(2)} and won ${(
            (winner.weightedBets / winner.totalWeightedBets) *
            winner.bank
          ).toFixed(2)}$`
        );
      });
    }

    setLogs(newLogs);
  };

  return (
    <div style={{ padding: "20px", display: "flex", gap: "20px" }}>
      <div className="section">
        <h1 className="header">Betting Platform</h1>

        <div className="oddsContainer">
          <div className="choiceColumn">
            <span>
              Choice 1 — Odds: {(odds.choice1 * 100).toFixed(2)}%
            </span>
            <br />
            <input
              type="number"
              placeholder="Bet on Choice 1"
              className="input"
              value={betChoice1}
              onChange={(e) => setBetChoice1(e.target.value)}
            />
            <button
              className="button"
              onClick={() => placeBet("choice1", betChoice1)}
            >
              Place Bet
            </button>
          </div>
          <div className="choiceColumn">
            <span>
              Choice 2 — Odds: {(odds.choice2 * 100).toFixed(2)}%
            </span>
            <br />
            <input
              type="number"
              placeholder="Bet on Choice 2"
              className="input"
              value={betChoice2}
              onChange={(e) => setBetChoice2(e.target.value)}
            />
            <button
              className="button"
              onClick={() => placeBet("choice2", betChoice2)}
            >
              Place Bet
            </button>
          </div>
        </div>

        <div className="betsSection">
          <div className="betList">
            <h3>Bets on Choice 1</h3>
            <ul>
              {betDetails.choice1.map((bet, index) => (
                <li key={index}>
                  {bet.name} placed {bet.bet}$ (odds:{" "}
                  {bet.probability.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
          <div className="betList">
            <h3>Bets on Choice 2</h3>
            <ul>
              {betDetails.choice2.map((bet, index) => (
                <li key={index}>
                  {bet.name} placed {bet.bet}$ (odds:{" "}
                  {bet.probability.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="choiceEndButton">
          <button onClick={() => endChoiceWithWinner("choice1")}>
            End with Choice 1 Win
          </button>
          <button onClick={() => endChoiceWithWinner("choice2")}>
            End with Choice 2 Win
          </button>
        </div>
      </div>

      <div className="right-section">
        <h2 className="section-title">Betting Table:</h2>
        <table className="betting-table">
          <thead>
            <tr>
              <th>Choice</th>
              <th>Total Bets</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Choice 1</td>
              <td>{bets.choice1}$</td>
            </tr>
            <tr>
              <td>Choice 2</td>
              <td>{bets.choice2}$</td>
            </tr>
          </tbody>
        </table>

        <h2 className="section-title">Betting Logs:</h2>
        <div className="logSection">
          {logs.length === 0 ? (
            <p>No choices have finished yet.</p>
          ) : (
            <ul>
              {logs.map((log, index) => (
                <li key={index}>{log}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
