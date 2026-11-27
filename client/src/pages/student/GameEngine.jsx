import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { invalidateCache } from '../../utils/cache';
import MathRunner from '../../components/games/MathRunner';
import LogicMaze from '../../components/games/LogicMaze';
import VirtualLab from '../../components/games/VirtualLab';
import FractionPizza from '../../components/games/FractionPizza';
import BubblePop from '../../components/games/BubblePop';
import DragPuzzle from '../../components/games/DragPuzzle';
import WordScramble from '../../components/games/WordScramble';
import SnakeSpeller from '../../components/games/SnakeSpeller';
import '../../assets/styles/pages/games.css';

const FALLBACK_DB = {
  'math-battle': [
    { id: 1, question: '15 + 27 = ?', answer: '42', xp: 10, options: ['32', '42', '52', '40'] },
    { id: 2, question: '9 × 6 = ?', answer: '54', xp: 15, options: ['54', '45', '64', '63'] },
    { id: 3, question: '144 ÷ 12 = ?', answer: '12', xp: 15, options: ['10', '11', '12', '14'] },
    { id: 4, question: '45 - 19 = ?', answer: '26', xp: 10, options: ['24', '26', '28', '36'] },
    { id: 5, question: '7 × 8 = ?', answer: '56', xp: 15, options: ['54', '56', '64', '48'] },
  ],
  'math-runner': [
    { id: 1, question: '4 × 5 = ?', answer: '20', xp: 20, options: ['15', '20', '25', '30'] },
    { id: 2, question: '36 ÷ 6 = ?', answer: '6', xp: 20, options: ['4', '6', '8', '9'] },
    { id: 3, question: '12 + 18 = ?', answer: '30', xp: 20, options: ['28', '30', '32', '40'] },
    { id: 4, question: '50 - 25 = ?', answer: '25', xp: 20, options: ['20', '25', '30', '35'] },
  ],
  'number-ninja': [
    { id: 1, question: 'Which is a prime number?', answer: '7', xp: 15, options: ['4', '6', '7', '9'] },
    { id: 2, question: 'Which number is even?', answer: '14', xp: 10, options: ['7', '11', '14', '21'] },
    { id: 3, question: 'Which number is a multiple of 5?', answer: '35', xp: 15, options: ['31', '35', '42', '49'] },
  ],
  'math-puzzle': [
    { id: 1, question: '___ - 15 = 30', answer: '45', xp: 15, options: ['35', '45', '55', '25'] },
    { id: 2, question: '12 × ___ = 48', answer: '4', xp: 15, options: ['3', '4', '5', '6'] },
    { id: 3, question: '___ ÷ 7 = 6', answer: '42', xp: 15, options: ['35', '42', '49', '56'] },
  ],
  'fraction-pizza': [
    { id: 1, question: 'What is 1/2 of 8 slices?', answer: '4', xp: 15, options: ['2 slices', '4 slices', '6 slices', '8 slices'] },
    { id: 2, question: 'What is 1/4 of 8 slices?', answer: '2', xp: 15, options: ['1 slice', '2 slices', '3 slices', '4 slices'] },
    { id: 3, question: 'What is 3/4 of 8 slices?', answer: '6', xp: 20, options: ['2 slices', '4 slices', '6 slices', '8 slices'] },
    { id: 4, question: 'Select all 8 slices (8/8)!', answer: '8', xp: 15, options: ['2', '4', '6', '8'] },
  ],
  'code-blocks': [
    { id: 1, question: 'Create a simple print statement', correctOrder: [0, 1, 2], xp: 20, codeBlocks: ['console', '.log', "('Hello');"] },
    { id: 2, question: 'Define a variable', correctOrder: [0, 1, 2], xp: 20, codeBlocks: ['let', 'score = ', '100;'] },
    { id: 3, question: 'Create an if statement', correctOrder: [0, 1, 2], xp: 25, codeBlocks: ['if (x > 5)', '{', '  return true; }'] },
  ],
  'debug-master': [
    { id: 1, question: "Find the error: 'let x = 10'", answer: 'Missing semicolon', xp: 15, options: ['SyntaxError', 'Missing semicolon', 'No error', 'ReferenceError'] },
    { id: 2, question: "What's wrong with 'const y; y = 5;'?", answer: 'Missing initializer', xp: 20, options: ['Missing initializer', 'Cannot reassign const', 'Both A and B', 'No error'] },
    { id: 3, question: "Error in 'funciton sayHi() {}'", answer: 'Misspelled keyword', xp: 10, options: ['Misspelled keyword', 'Missing semicolon', 'Missing arguments', 'No error'] },
  ],
  'output-guess': [
    { id: 1, question: 'let a=5; a++; print(a);', answer: '6', xp: 15, options: ['5', '6', '7', 'undefined'] },
    { id: 2, question: "print(typeof 'hello');", answer: 'string', xp: 10, options: ['string', 'text', 'char', 'undefined'] },
    { id: 3, question: "print(2 + '2');", answer: '22', xp: 20, options: ['4', '22', 'NaN', 'Error'] },
  ],
  'logic-maze': [
    { id: 1, question: 'Navigate to the flag (Level 1)!', answer: 'Move Forward', xp: 30 },
    { id: 2, question: 'Navigate past the wall (Level 2)!', answer: 'Turn Right', xp: 30 },
    { id: 3, question: 'Reach the top-left corner (Level 3)!', answer: 'Loop', xp: 40 },
  ],
  'science-quiz': [
    { id: 1, question: 'What is the chemical symbol for Water?', answer: 'H2O', xp: 10, options: ['CO2', 'H2O', 'O2', 'NaCl'] },
    { id: 2, question: 'Which planet is known as the Red Planet?', answer: 'Mars', xp: 10, options: ['Venus', 'Jupiter', 'Mars', 'Saturn'] },
    { id: 3, question: 'What gas do plants absorb?', answer: 'Carbon Dioxide', xp: 15, options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Helium'] },
    { id: 4, question: 'What is the center of an atom called?', answer: 'Nucleus', xp: 20, options: ['Electron', 'Proton', 'Nucleus', 'Orbit'] },
  ],
  'human-body': [
    { id: 1, question: 'Which organ pumps blood?', answer: 'Heart', xp: 15, options: ['Lungs', 'Brain', 'Heart', 'Liver'] },
    { id: 2, question: 'What is the largest organ of the body?', answer: 'Skin', xp: 20, options: ['Liver', 'Brain', 'Skin', 'Heart'] },
    { id: 3, question: 'Which bones protect your lungs?', answer: 'Ribcage', xp: 15, options: ['Skull', 'Spine', 'Ribcage', 'Pelvis'] },
  ],
  'virtual-lab': [
    {
      id: 1,
      question: 'Neutralize Vinegar (Acid) in the beaker! Which substance balances it?',
      options: ['Baking Soda', 'Lemon Juice', 'Salt Water', 'Hydrochloric Acid'],
      answer: 'Baking Soda',
      reactionLabel: 'Fizzing CO₂ bubbles! Acid neutralized!',
      xp: 30,
    },
    {
      id: 2,
      question: 'Turn red litmus paper BLUE! Drop a base into the flask:',
      options: ['Soap Solution', 'Orange Juice', 'Vinegar', 'Pure Water'],
      answer: 'Soap Solution',
      reactionLabel: 'Litmus turned Blue! Alkaline reaction!',
      xp: 30,
    },
    {
      id: 3,
      question: 'Test for Starch! Which reagent turns starch solution dark blue-black?',
      options: ['Iodine Solution', 'Sugar Syrup', 'Cooking Oil', 'Carbonated Water'],
      answer: 'Iodine Solution',
      reactionLabel: 'Deep Blue-Black color! Starch confirmed!',
      xp: 30,
    },
    {
      id: 4,
      question: 'Fuel Photosynthesis in the leaf flask! Which gas is absorbed?',
      options: ['Carbon Dioxide (CO₂)', 'Helium (He)', 'Neon (Ne)', 'Nitrogen (N₂)'],
      answer: 'Carbon Dioxide (CO₂)',
      reactionLabel: 'Oxygen released! Photosynthesis active!',
      xp: 30,
    },
  ],
  'word-scramble': [
    { id: 1, question: "Spell the word for 'a round fruit with red or green skin'", answer: 'APPLE', xp: 20 },
    { id: 2, question: "Spell the word for 'our planet'", answer: 'EARTH', xp: 20 },
    { id: 3, question: "Spell the word for 'a large vehicle that carries students'", answer: 'SCHOOLBUS', xp: 30 },
    { id: 4, question: "Spell the word for 'frozen water'", answer: 'ICE', xp: 15 },
  ],
  'snake-speller': [
    { id: 1, question: "Spell the word for 'a domestic animal that catches mice'", answer: 'CAT', xp: 20 },
    { id: 2, question: "Spell the word for 'our planet'", answer: 'EARTH', xp: 20 },
    { id: 3, question: "Spell the word for 'the opposite of cold'", answer: 'HOT', xp: 15 },
    { id: 4, question: "Spell the word for 'a flying mammal'", answer: 'BAT', xp: 15 },
  ],
};

function buildBlocksForQuestion(q) {
  if (!q?.codeBlocks) return [];
  const items = q.codeBlocks.map((text, id) => ({ id, text, selectedOrder: null }));
  if (items.length > 1) {
    for (let attempt = 0; attempt < 6; attempt++) {
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      if (JSON.stringify(items.map((b) => b.id)) !== JSON.stringify(q.correctOrder)) {
        break;
      }
    }
  }
  return items;
}

function GameEngine() {
  const { gameSlug } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [xpEarned, setXpEarned] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [currentBlocks, setCurrentBlocks] = useState([]);
  const [codeBlockFeedback, setCodeBlockFeedback] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [roundResult, setRoundResult] = useState(null); // null | { isCorrect, xpAwarded, answer }

  // Refs prevent stale score/XP on final submission or duplicate callbacks per round
  const xpRef = useRef(0);
  const correctRef = useRef(0);
  const roundLockedRef = useRef(false);
  const nextBarRef = useRef(null);

  useEffect(() => {
    let active = true;
    xpRef.current = 0;
    correctRef.current = 0;
    roundLockedRef.current = false;

    const loadQuestions = async () => {
      try {
        const { data } = await api.get(`/games/${gameSlug}/questions?limit=5`);
        if (!active) return;
        const list = data && data.length > 0 ? data : FALLBACK_DB[gameSlug] || FALLBACK_DB['math-battle'];
        setQuestions(list);
        if (gameSlug === 'code-blocks') {
          setCurrentBlocks(buildBlocksForQuestion(list[0]));
        }
      } catch (err) {
        console.error('Failed to load game questions', err);
        if (!active) return;
        const fallbacks = FALLBACK_DB[gameSlug] || FALLBACK_DB['math-battle'];
        setQuestions(fallbacks);
        if (gameSlug === 'code-blocks') {
          setCurrentBlocks(buildBlocksForQuestion(fallbacks[0]));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadQuestions();

    return () => {
      active = false;
    };
  }, [gameSlug]);

  useEffect(() => {
    if (roundResult && nextBarRef.current) {
      nextBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [roundResult]);

  const finishGame = async (finalXp, finalCorrect, totalCount) => {
    setGameState('finished');
    try {
      await api.post('/games/submit', {
        gameSlug,
        xpEarned: finalXp,
        correctAnswers: finalCorrect,
        totalQuestions: totalCount,
      });
      invalidateCache('dashboard:');
      invalidateCache('leaderboard:');
      invalidateCache('profile:');
    } catch (err) {
      console.error('Failed to submit game score', err);
    }
  };

  const completeRound = (addedXp = 0, wasCorrect = false) => {
    if (roundLockedRef.current) return;
    roundLockedRef.current = true;

    const nextXp = xpRef.current + addedXp;
    const nextCorrect = correctRef.current + (wasCorrect ? 1 : 0);
    xpRef.current = nextXp;
    correctRef.current = nextCorrect;

    if (addedXp > 0) setXpEarned(nextXp);
    if (wasCorrect) setCorrectAnswers(nextCorrect);

    setRoundResult({
      isCorrect: wasCorrect,
      xpAwarded: addedXp,
      answer: questions[currentIndex]?.answer,
    });
  };

  const handleNextLevel = () => {
    roundLockedRef.current = false;
    setRoundResult(null);
    setSelectedOption(null);
    setCodeBlockFeedback(null);

    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      if (gameSlug === 'code-blocks') {
        setCurrentBlocks(buildBlocksForQuestion(questions[nextIdx]));
      }
    } else {
      finishGame(xpRef.current, correctRef.current, questions.length);
    }
  };

  const handleAnswer = (selectedAnswer) => {
    if (roundLockedRef.current) return;
    const currentQ = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQ.answer;
    setSelectedOption(selectedAnswer);
    completeRound(isCorrect ? currentQ.xp : 0, isCorrect);
  };

  const handleCodeBlockSelect = (blockId) => {
    if (codeBlockFeedback !== null || roundLockedRef.current) return;
    const currentQ = questions[currentIndex];
    const targetBlock = currentBlocks.find((b) => b.id === blockId);
    if (!targetBlock || targetBlock.selectedOrder !== null) return;

    const nextOrder = currentBlocks.filter((b) => b.selectedOrder !== null).length;
    const newBlocks = currentBlocks.map((b) =>
      b.id === blockId ? { ...b, selectedOrder: nextOrder } : b
    );
    setCurrentBlocks(newBlocks);

    if (nextOrder === newBlocks.length - 1) {
      const selectedIndices = [...newBlocks]
        .sort((a, b) => a.selectedOrder - b.selectedOrder)
        .map((b) => b.id);

      const isCorrect = JSON.stringify(selectedIndices) === JSON.stringify(currentQ.correctOrder);
      setCodeBlockFeedback(isCorrect ? 'correct' : 'wrong');
      completeRound(isCorrect ? currentQ.xp : 0, isCorrect);
    }
  };

  const resetCodeBlocks = () => {
    if (codeBlockFeedback !== null) return;
    setCurrentBlocks((prev) => prev.map((b) => ({ ...b, selectedOrder: null })));
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
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {correctAnswers}/{questions.length}
              </div>
              <div style={{ color: 'var(--color-text-muted)' }}>Score</div>
            </div>
            <div className="stat-box">
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent-dark)' }}>
                +{xpEarned}
              </div>
              <div style={{ color: 'var(--color-text-muted)' }}>XP Earned</div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/student/games')}>
            Play Another Game
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const questionKey = currentQ.id || currentQ._id || currentIndex;

  const renderGameUI = () => {
    const onWin = () => completeRound(currentQ.xp || 0, true);
    const onLose = () => completeRound(0, false);

    switch (gameSlug) {
      case 'math-runner':
        return <MathRunner key={questionKey} question={currentQ} onComplete={onWin} onFail={onLose} />;
      case 'logic-maze':
        return <LogicMaze key={questionKey} question={currentQ} onComplete={onWin} onFail={onLose} />;
      case 'virtual-lab':
        return <VirtualLab key={questionKey} question={currentQ} onComplete={onWin} onFail={onLose} />;
      case 'code-blocks':
        return (
          <div>
            <div className="code-blocks-list">
              {currentBlocks.map((block) => (
                <button
                  type="button"
                  key={block.id}
                  className="code-block-item"
                  style={{
                    opacity: block.selectedOrder !== null ? 0.65 : 1,
                    background: block.selectedOrder !== null ? '#334155' : '#1e1e1e',
                    textAlign: 'left',
                    border: block.selectedOrder !== null ? '1px solid var(--color-primary)' : '1px solid transparent',
                  }}
                  onClick={() => handleCodeBlockSelect(block.id)}
                  disabled={roundResult !== null}
                >
                  {block.selectedOrder !== null ? (
                    <span style={{ color: 'var(--color-primary-light)', fontWeight: 'bold', marginRight: '6px' }}>
                      {block.selectedOrder + 1}.
                    </span>
                  ) : null}
                  <span>{block.text}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={resetCodeBlocks}
                disabled={codeBlockFeedback !== null}
              >
                Reset Order
              </button>
              {codeBlockFeedback === 'correct' && (
                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✅ Correct order!</span>
              )}
              {codeBlockFeedback === 'wrong' && (
                <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>❌ Wrong order!</span>
              )}
            </div>
          </div>
        );
      case 'fraction-pizza':
        return <FractionPizza key={questionKey} question={currentQ} onComplete={onWin} onFail={onLose} />;
      case 'math-puzzle':
      case 'human-body':
      case 'debug-master':
        return <DragPuzzle key={questionKey} question={currentQ} onComplete={onWin} onFail={onLose} />;
      case 'number-ninja':
      case 'math-battle':
      case 'science-quiz':
      case 'output-guess':
        return <BubblePop key={questionKey} question={currentQ} onComplete={onWin} onFail={onLose} />;
      case 'word-scramble':
        return <WordScramble key={questionKey} question={currentQ} onComplete={onWin} onFail={onLose} />;
      case 'snake-speller':
        return <SnakeSpeller key={questionKey} question={currentQ} onComplete={onWin} onFail={onLose} />;
      default:
        return (
          <div className="game-options-grid">
            {currentQ.options?.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectAnswer = opt === currentQ.answer;
              let optionStyle = undefined;
              if (roundResult !== null) {
                if (isCorrectAnswer) {
                  optionStyle = {
                    borderColor: 'var(--color-success)',
                    backgroundColor: 'var(--color-success-bg)',
                    color: 'var(--color-success)',
                  };
                } else if (isSelected) {
                  optionStyle = {
                    borderColor: 'var(--color-danger)',
                    backgroundColor: 'var(--color-danger-bg)',
                    color: 'var(--color-danger)',
                  };
                } else {
                  optionStyle = { opacity: 0.6 };
                }
              }

              return (
                <button
                  type="button"
                  key={idx}
                  className="game-option-btn"
                  style={optionStyle}
                  onClick={() => handleAnswer(opt)}
                  disabled={roundResult !== null}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        );
    }
  };

  const isCustomUI = [
    'math-runner',
    'logic-maze',
    'virtual-lab',
    'fraction-pizza',
    'math-puzzle',
    'human-body',
    'debug-master',
    'number-ninja',
    'math-battle',
    'science-quiz',
    'output-guess',
    'word-scramble',
    'snake-speller',
  ].includes(gameSlug);

  const isLastLevel = currentIndex >= questions.length - 1;

  return (
    <div className="game-player">
      <div className="game-header">
        <button className="btn btn-outline" onClick={() => navigate('/student/games')}>
          Back
        </button>
        <div className="game-progress">
          Level {currentIndex + 1} of {questions.length}
        </div>
        <div className="game-xp">{xpEarned} XP</div>
      </div>

      {!isCustomUI && (
        <div className="game-question-area">
          <div className="game-question-text">{currentQ.question}</div>
        </div>
      )}

      {renderGameUI()}

      {roundResult && (
        <div
          ref={nextBarRef}
          className={`game-next-bar ${roundResult.isCorrect ? 'game-next-bar--win' : 'game-next-bar--lose'}`}
        >
          <div className="game-next-info">
            {roundResult.isCorrect ? (
              <span>
                🎉 Level Complete! +{roundResult.xpAwarded} XP
              </span>
            ) : (
              <span>
                ❌ Incorrect{roundResult.answer ? ` — Answer: ${roundResult.answer}` : ''}
              </span>
            )}
          </div>
          <button type="button" className="btn btn-primary game-next-btn" onClick={handleNextLevel}>
            {isLastLevel ? 'Finish Game →' : 'Next Level →'}
          </button>
        </div>
      )}
    </div>
  );
}

export default GameEngine;
