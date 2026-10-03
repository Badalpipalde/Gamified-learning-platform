import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import MathRunner from '../../components/games/MathRunner';
import LogicMaze from '../../components/games/LogicMaze';
import VirtualLab from '../../components/games/VirtualLab';
import FractionPizza from '../../components/games/FractionPizza';
import BubblePop from '../../components/games/BubblePop';
import DragPuzzle from '../../components/games/DragPuzzle';
import WordScramble from '../../components/games/WordScramble';
import SnakeSpeller from '../../components/games/SnakeSpeller';
import '../../assets/styles/pages/games.css';

function GameEngine() {
  const { gameSlug } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [xpEarned, setXpEarned] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameState, setGameState] = useState('playing');

  const [builtWord, setBuiltWord] = useState('');
  const [usedIndices, setUsedIndices] = useState([]);
  const [currentBlocks, setCurrentBlocks] = useState([]);

  // ... (keeping fallbackDB and other functions the same, we'll replace starting from the render function)


  useEffect(() => {
    fetchQuestions();
  }, [gameSlug]);

  const fallbackDB = {
    'math-battle': [
      { id: 1, question: "15 + 27 = ?", answer: "42", xp: 10, options: ["32", "42", "52", "40"] },
      { id: 2, question: "9 * 6 = ?", answer: "54", xp: 15, options: ["54", "45", "64", "63"] },
      { id: 3, question: "144 / 12 = ?", answer: "12", xp: 15, options: ["10", "11", "12", "14"] },
      { id: 4, question: "45 - 19 = ?", answer: "26", xp: 10, options: ["24", "26", "28", "36"] },
      { id: 5, question: "7 * 8 = ?", answer: "56", xp: 15, options: ["54", "56", "64", "48"] }
    ],
    'math-runner': [
      { id: 1, question: "4 * 5 = ?", answer: "20", xp: 20, options: ["15", "20", "25", "30"] },
      { id: 2, question: "36 / 6 = ?", answer: "6", xp: 20, options: ["4", "6", "8", "9"] },
      { id: 3, question: "12 + 18 = ?", answer: "30", xp: 20, options: ["28", "30", "32", "40"] },
      { id: 4, question: "50 - 25 = ?", answer: "25", xp: 20, options: ["20", "25", "30", "35"] }
    ],
    'number-ninja': [
      { id: 1, question: "Which is a prime number?", answer: "7", xp: 15, options: ["4", "6", "7", "9"] },
      { id: 2, question: "Which number is even?", answer: "14", xp: 10, options: ["7", "11", "14", "21"] },
      { id: 3, question: "Which number is a multiple of 5?", answer: "35", xp: 15, options: ["31", "35", "42", "49"] }
    ],
    'math-puzzle': [
      { id: 1, question: "___ - 15 = 30", answer: "45", xp: 15, options: ["35", "45", "55", "25"] },
      { id: 2, question: "12 * ___ = 48", answer: "4", xp: 15, options: ["3", "4", "5", "6"] },
      { id: 3, question: "___ / 7 = 6", answer: "42", xp: 15, options: ["35", "42", "49", "56"] }
    ],
    'fraction-pizza': [
      { id: 1, question: "What is 1/2 of 8 slices?", answer: "4", xp: 15, options: ["2 slices", "4 slices", "6 slices", "8 slices"] },
      { id: 2, question: "What is 1/4 of 8 slices?", answer: "2", xp: 15, options: ["1 slice", "2 slices", "3 slices", "4 slices"] },
      { id: 3, question: "What is 3/4 of 8 slices?", answer: "6", xp: 20, options: ["2 slices", "4 slices", "6 slices", "8 slices"] },
      { id: 4, question: "Select all 8 slices (8/8)!", answer: "8", xp: 15, options: ["2", "4", "6", "8"] }
    ],
    'code-blocks': [
      { id: 1, question: "Create a simple print statement", correctOrder: [0, 1, 2], xp: 20, codeBlocks: ["console", ".log", "('Hello');"] },
      { id: 2, question: "Define a variable", correctOrder: [0, 1, 2], xp: 20, codeBlocks: ["let", "score = ", "100;"] },
      { id: 3, question: "Create an if statement", correctOrder: [0, 1, 2], xp: 25, codeBlocks: ["if (x > 5)", "{", "  return true; }"] }
    ],
    'debug-master': [
      { id: 1, question: "Find the error: 'let x = 10'", answer: "Missing semicolon", xp: 15, options: ["SyntaxError", "Missing semicolon", "No error", "ReferenceError"] },
      { id: 2, question: "What's wrong with 'const y; y = 5;'?", answer: "Missing initializer", xp: 20, options: ["Missing initializer", "Cannot reassign const", "Both A and B", "No error"] },
      { id: 3, question: "Error in 'funciton sayHi() {}'", answer: "Misspelled keyword", xp: 10, options: ["Misspelled keyword", "Missing semicolon", "Missing arguments", "No error"] }
    ],
    'output-guess': [
      { id: 1, question: "let a=5; a++; print(a);", answer: "6", xp: 15, options: ["5", "6", "7", "undefined"] },
      { id: 2, question: "print(typeof 'hello');", answer: "string", xp: 10, options: ["string", "text", "char", "undefined"] },
      { id: 3, question: "print(2 + '2');", answer: "22", xp: 20, options: ["4", "22", "NaN", "Error"] }
    ],
    'logic-maze': [
      { id: 1, question: "Navigate to the target", answer: "Move Forward", xp: 30 },
      { id: 2, question: "Avoid the obstacle", answer: "Turn Right", xp: 30 },
      { id: 3, question: "Reach the finish line", answer: "Loop", xp: 40 }
    ],
    'science-quiz': [
      { id: 1, question: "What is the chemical symbol for Water?", answer: "H2O", xp: 10, options: ["CO2", "H2O", "O2", "NaCl"] },
      { id: 2, question: "Which planet is known as the Red Planet?", answer: "Mars", xp: 10, options: ["Venus", "Jupiter", "Mars", "Saturn"] },
      { id: 3, question: "What gas do plants absorb?", answer: "Carbon Dioxide", xp: 15, options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"] },
      { id: 4, question: "What is the center of an atom called?", answer: "Nucleus", xp: 20, options: ["Electron", "Proton", "Nucleus", "Orbit"] }
    ],
    'human-body': [
      { id: 1, question: "Which organ pumps blood?", answer: "Heart", xp: 15, options: ["Lungs", "Brain", "Heart", "Liver"] },
      { id: 2, question: "What is the largest organ of the body?", answer: "Skin", xp: 20, options: ["Liver", "Brain", "Skin", "Heart"] },
      { id: 3, question: "Which bones protect your lungs?", answer: "Ribcage", xp: 15, options: ["Skull", "Spine", "Ribcage", "Pelvis"] }
    ],
    'virtual-lab': [
      { id: 1, question: "Mix chemicals to see reaction", answer: "Result", xp: 30 },
      { id: 2, question: "Observe the cell structure", answer: "Nucleus found", xp: 30 },
      { id: 3, question: "Measure the liquid volume", answer: "100ml", xp: 30 }
    ],
    'word-scramble': [
      { id: 1, question: "Spell the word for 'a round fruit with red or green skin'", answer: "APPLE", xp: 20 },
      { id: 2, question: "Spell the word for 'our planet'", answer: "EARTH", xp: 20 },
      { id: 3, question: "Spell the word for 'a large vehicle that carries students'", answer: "SCHOOLBUS", xp: 30 },
      { id: 4, question: "Spell the word for 'frozen water'", answer: "ICE", xp: 15 }
    ],
    'snake-speller': [
      { id: 1, question: "Spell the word for 'a domestic animal that catches mice'", answer: "CAT", xp: 20 },
      { id: 2, question: "Spell the word for 'our planet'", answer: "EARTH", xp: 20 },
      { id: 3, question: "Spell the word for 'the opposite of cold'", answer: "HOT", xp: 15 },
      { id: 4, question: "Spell the word for 'a flying mammal'", answer: "BAT", xp: 15 }
    ]
  };

  const fetchQuestions = async () => {
    try {
      const { data } = await api.get(`/games/${gameSlug}/questions?limit=5`);
      if (data && data.length > 0) {
        setQuestions(data);
        initQuestionState(data[0]);
      } else {
        const fallbacks = fallbackDB[gameSlug] || fallbackDB['math-battle'];
        setQuestions(fallbacks);
        initQuestionState(fallbacks[0]);
      }
    } catch (err) {
      console.error('Failed to load game questions', err);
      const fallbacks = fallbackDB[gameSlug] || fallbackDB['math-battle'];
      setQuestions(fallbacks);
      initQuestionState(fallbacks[0]);
    } finally {
      setLoading(false);
    }
  };

  const initQuestionState = (q) => {
    if (gameSlug === 'word-builder') {
      setBuiltWord('');
      setUsedIndices([]);
    } else if (gameSlug === 'code-blocks' && q.codeBlocks) {
      setCurrentBlocks(q.codeBlocks.map((text, id) => ({ id, text, selectedOrder: null })));
    }
  };

  const handleAnswer = (selectedAnswer) => {
    const currentQ = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQ.answer;

    if (isCorrect) {
      setXpEarned(prev => prev + currentQ.xp);
      setCorrectAnswers(prev => prev + 1);
    }
    nextQuestion();
  };

  const handleWordBuilderSelect = (letter, index) => {
    const newBuilt = builtWord + letter;
    const newIndices = [...usedIndices, index];

    setBuiltWord(newBuilt);
    setUsedIndices(newIndices);

    const currentQ = questions[currentIndex];
    const letters = currentQ.question.split('-');

    if (newBuilt.length === letters.length) {
      setTimeout(() => {
        handleAnswer(newBuilt);
      }, 500);
    }
  };

  const handleCodeBlockSelect = (blockId) => {
    const currentQ = questions[currentIndex];
    const newBlocks = [...currentBlocks];
    const block = newBlocks.find(b => b.id === blockId);

    if (block.selectedOrder !== null) return;

    const nextOrder = newBlocks.filter(b => b.selectedOrder !== null).length;
    block.selectedOrder = nextOrder;
    setCurrentBlocks(newBlocks);

    if (nextOrder === newBlocks.length - 1) {
      const selectedIndices = newBlocks
        .sort((a, b) => a.selectedOrder - b.selectedOrder)
        .map(b => b.id);

      const isCorrect = JSON.stringify(selectedIndices) === JSON.stringify(currentQ.correctOrder);

      setTimeout(() => {
        if (isCorrect) {
          setXpEarned(prev => prev + currentQ.xp);
          setCorrectAnswers(prev => prev + 1);
        }
        nextQuestion();
      }, 800);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      initQuestionState(questions[currentIndex + 1]);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameState('finished');
    try {
      await api.post('/games/submit', {
        gameSlug,
        xpEarned,
        correctAnswers,
        totalQuestions: questions.length
      });
    } catch (err) {
      console.error('Failed to submit game score', err);
    }
  };

  if (loading) {
    return <div className="loader"><div className="spinner"></div></div>;
  }

  if (questions.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>No questions available for this game right now.</p>
          <button className="btn btn-primary" onClick={() => navigate('/student/games')}>Back to Hub</button>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="page-container">
        <div className="game-results">
          <div className="game-results-icon">🏆</div>
          <div className="game-results-title">Game Complete!</div>
          <p>Great job! Here is how you did:</p>

          <div className="game-results-stats">
            <div className="stat-box">
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{correctAnswers}/{questions.length}</div>
              <div style={{ color: 'var(--color-text-muted)' }}>Score</div>
            </div>
            <div className="stat-box">
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent-dark)' }}>+{xpEarned}</div>
              <div style={{ color: 'var(--color-text-muted)' }}>XP Earned</div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/student/games')}>Play Another Game</button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const renderGameUI = () => {
    switch (gameSlug) {
      case 'math-runner':
        return (
          <MathRunner
            question={currentQ}
            onComplete={() => {
              setXpEarned(prev => prev + currentQ.xp);
              setCorrectAnswers(prev => prev + 1);
              nextQuestion();
            }}
            onFail={() => nextQuestion()}
          />
        );
      case 'logic-maze':
        return (
          <LogicMaze
            question={currentQ}
            onComplete={() => {
              setXpEarned(prev => prev + currentQ.xp);
              setCorrectAnswers(prev => prev + 1);
              nextQuestion();
            }}
            onFail={() => nextQuestion()}
          />
        );
      case 'virtual-lab':
        return (
          <VirtualLab
            question={currentQ}
            onComplete={() => {
              setXpEarned(prev => prev + currentQ.xp);
              setCorrectAnswers(prev => prev + 1);
              nextQuestion();
            }}
            onFail={() => nextQuestion()}
          />
        );
      case 'code-blocks':
        return (
          <div className="code-blocks-list">
            {currentBlocks.map((block) => (
              <div
                key={block.id}
                className="code-block-item"
                style={{
                  opacity: block.selectedOrder !== null ? 0.5 : 1,
                  background: block.selectedOrder !== null ? '#333' : '#1e1e1e'
                }}
                onClick={() => handleCodeBlockSelect(block.id)}
              >
                {block.selectedOrder !== null ? <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginRight: '10px' }}>{block.selectedOrder + 1}.</span> : null}
                {block.text}
              </div>
            ))}
          </div>
        );
      case 'fraction-pizza':
        return (
          <FractionPizza
            question={currentQ}
            onComplete={() => {
              setXpEarned(prev => prev + currentQ.xp);
              setCorrectAnswers(prev => prev + 1);
              nextQuestion();
            }}
            onFail={() => nextQuestion()}
          />
        );
      case 'math-puzzle':
      case 'human-body':
      case 'debug-master':
        return (
          <DragPuzzle
            question={currentQ}
            onComplete={() => {
              setXpEarned(prev => prev + currentQ.xp);
              setCorrectAnswers(prev => prev + 1);
              nextQuestion();
            }}
            onFail={() => nextQuestion()}
          />
        );
      case 'number-ninja':
      case 'math-battle':
      case 'science-quiz':
      case 'output-guess':
        return (
          <BubblePop
            question={currentQ}
            onComplete={() => {
              setXpEarned(prev => prev + currentQ.xp);
              setCorrectAnswers(prev => prev + 1);
              nextQuestion();
            }}
            onFail={() => nextQuestion()}
          />
        );
      case 'word-scramble':
        return (
          <WordScramble
            question={currentQ}
            onComplete={() => {
              setXpEarned(prev => prev + currentQ.xp);
              setCorrectAnswers(prev => prev + 1);
              nextQuestion();
            }}
            onFail={() => nextQuestion()}
          />
        );
      case 'snake-speller':
        return (
          <SnakeSpeller
            question={currentQ}
            onComplete={() => {
              setXpEarned(prev => prev + currentQ.xp);
              setCorrectAnswers(prev => prev + 1);
              nextQuestion();
            }}
            onFail={() => nextQuestion()}
          />
        );
      default:
        // Generic MCQ UI as ultimate fallback
        return (
          <div className="game-options-grid">
            {currentQ.options?.map((opt, idx) => (
              <button
                key={idx}
                className="game-option-btn"
                onClick={() => handleAnswer(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        );
    }
  };

  const isCustomUI = ['math-runner', 'logic-maze', 'virtual-lab', 'fraction-pizza', 'math-puzzle', 'human-body', 'debug-master', 'number-ninja', 'math-battle', 'science-quiz', 'output-guess', 'word-scramble', 'snake-speller'].includes(gameSlug);

  return (
    <div className="game-player">
      <div className="game-header">
        <button className="btn btn-outline" onClick={() => navigate('/student/games')}>Back</button>
        <div className="game-progress">Question {currentIndex + 1} of {questions.length}</div>
        <div className="game-xp">{xpEarned} XP</div>
      </div>

      {!isCustomUI && (
        <div className="game-question-area">
          <div className="game-question-text">{currentQ.question}</div>
        </div>
      )}

      {renderGameUI()}
    </div>
  );
}

export default GameEngine;
