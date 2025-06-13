'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@convex-dev/react';
import { useWallet } from '@solana/wallet-adapter-react';
import confetti from 'canvas-confetti';

export default function GamePage() {
  const { connected, publicKey } = useWallet();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple game logic for demonstration
  const startGame = () => {
    setGameState('playing');
    setScore(0);
  };

  const endGame = () => {
    setGameState('gameOver');
    if (score > highScore) {
      setHighScore(score);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
  };

  // Simple click game
  const handleCanvasClick = () => {
    if (gameState === 'playing') {
      setScore(prev => prev + 10);
      
      // End game at 100 points for demo
      if (score >= 90) {
        endGame();
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple animation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1e1b4b');
      gradient.addColorStop(1, '#312e81');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw game elements based on state
      if (gameState === 'playing') {
        // Draw target
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, 2 * Math.PI);
        ctx.fill();

        // Draw score
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, 50);
      } else if (gameState === 'menu') {
        ctx.fillStyle = '#ffffff';
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎮 Bonk Game', canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = '18px Arial';
        ctx.fillText('Click to start!', canvas.width / 2, canvas.height / 2 + 20);
      } else if (gameState === 'gameOver') {
        ctx.fillStyle = '#ffffff';
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 60);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.font = '18px Arial';
        ctx.fillText('Click to play again', canvas.width / 2, canvas.height / 2 + 60);
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [gameState, score, highScore]);

  const handleClick = () => {
    if (gameState === 'menu') {
      startGame();
    } else if (gameState === 'playing') {
      handleCanvasClick();
    } else if (gameState === 'gameOver') {
      resetGame();
    }
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🎮 Welcome to Bonk Game</h1>
          <p className="text-lg text-gray-300 mb-8">
            Connect your wallet to start playing and earn BONK tokens!
          </p>
          <div className="game-ui p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Features:</h2>
            <ul className="text-left space-y-2">
              <li>🏆 Real-time multiplayer gameplay</li>
              <li>💰 Earn BONK tokens for high scores</li>
              <li>🔄 Live leaderboards with Convex</li>
              <li>🎯 Simple and addictive clicking game</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 text-white">
      {/* Game Canvas */}
      <div className="flex-1 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6">🎮 Bonk Clicker Game</h1>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="game-canvas cursor-pointer"
          onClick={handleClick}
        />
        <div className="mt-4 text-center">
          <p className="text-lg">
            {gameState === 'menu' && 'Click the canvas to start!'}
            {gameState === 'playing' && 'Click the yellow target to score!'}
            {gameState === 'gameOver' && 'Click to play again!'}
          </p>
        </div>
      </div>

      {/* Game Info Sidebar */}
      <div className="lg:w-80 space-y-6">
        {/* Current Stats */}
        <div className="game-ui p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">📊 Your Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Current Score:</span>
              <span className="font-bold text-yellow-400">{score}</span>
            </div>
            <div className="flex justify-between">
              <span>High Score:</span>
              <span className="font-bold text-purple-400">{highScore}</span>
            </div>
            <div className="flex justify-between">
              <span>Wallet:</span>
              <span className="font-mono text-sm">
                {publicKey?.toString().slice(0, 6)}...{publicKey?.toString().slice(-4)}
              </span>
            </div>
          </div>
        </div>

        {/* Game Instructions */}
        <div className="game-ui p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">🎯 How to Play</h3>
          <ol className="space-y-2 text-sm">
            <li>1. Click the yellow target as fast as you can</li>
            <li>2. Each click gives you 10 points</li>
            <li>3. Reach 100 points to complete the game</li>
            <li>4. Beat your high score for celebrations!</li>
            <li>5. Future: Earn BONK tokens for achievements</li>
          </ol>
        </div>

        {/* Leaderboard Placeholder */}
        <div className="leaderboard p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">🏆 Leaderboard</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>1. BonkMaster</span>
              <span>1,250 pts</span>
            </div>
            <div className="flex justify-between">
              <span>2. GameChamp</span>
              <span>1,100 pts</span>
            </div>
            <div className="flex justify-between">
              <span>3. SolPlayer</span>
              <span>950 pts</span>
            </div>
            <div className="flex justify-between font-bold text-yellow-400">
              <span>You</span>
              <span>{highScore} pts</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            * Real-time leaderboard coming with Convex integration
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={resetGame}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            🔄 Reset Game
          </button>
          <button
            type="button"
            onClick={() => setScore(prev => prev + 100)}
            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors text-sm"
          >
            🎁 Bonus Points (Demo)
          </button>
        </div>
      </div>
    </div>
  );
}
