import { useNavigate } from 'react-router-dom';
import '../../assets/styles/pages/games.css';

const SUBJECTS = [
  {
    id: 'maths',
    title: 'Mathematics',
    icon: '🧮',
    image: '/assets/images/math_subject.jpg',
    games: [
      { id: 'math-battle', title: 'Math Battle', desc: 'Solve basic arithmetic before the timer ends', icon: '🚀⚡', image: '/assets/images/math_battle.jpg', color: '#4caf50' },
      { id: 'number-ninja', title: 'Number Ninja', desc: 'Select correct numbers from moving objects', icon: '🥷✨', image: '/assets/images/number_ninja.jpg', color: '#8bc34a' },
      { id: 'math-puzzle', title: 'Math Puzzle', desc: 'Complete equations by dragging correct numbers', icon: '🧩🎲', image: '/assets/images/math_puzzle.jpg', color: '#009688' },
      { id: 'fraction-pizza', title: 'Fraction Pizza', desc: 'Choose the correct fraction using pizza slices', icon: '🍕🧑‍🍳', image: '/assets/images/fraction_pizza.jpg', color: '#ffeb3b' },
      { id: 'math-runner', title: 'Math Runner', desc: 'Run and collect the correct numerical answers', icon: '👟💨', image: '/assets/images/math_runner.jpg', color: '#cddc39' }
    ]
  },
  {
    id: 'coding',
    title: 'Coding & Logic',
    icon: '🎮',
    image: '/assets/images/coding_subject.jpg',
    games: [
      { id: 'code-blocks', title: 'Code Blocks', desc: 'Arrange blocks to make a program work', icon: '🏗️👾', image: '/assets/images/code_blocks.jpg', color: '#607d8b' },
      { id: 'debug-master', title: 'Debug Master', desc: 'Find the mistake in a small code snippet', icon: '🕵️‍♂️🐛', image: '/assets/images/debug_master.jpg', color: '#9e9e9e' },
      { id: 'output-guess', title: 'Output Guess', desc: 'Predict the output of simple code', icon: '🧠💡', image: '/assets/images/output_guess.jpg', color: '#3f51b5' },
      { id: 'logic-maze', title: 'Logic Maze', desc: 'Give commands to move a character', icon: '🗺️🤖', image: '/assets/images/logic_maze.jpg', color: '#673ab7' }
    ]
  },
  {
    id: 'science',
    title: 'Science',
    icon: '🔭',
    image: '/assets/images/science_subject.jpg',
    games: [
      { id: 'science-quiz', title: 'Science Quiz', desc: 'Test your knowledge of the natural world', icon: '🌠🌍', color: '#2196f3' },
      { id: 'human-body', title: 'Human Body', desc: 'Identify organs by clicking on them', icon: '🫀🧠', color: '#e91e63' },
      { id: 'virtual-lab', title: 'Virtual Lab', desc: 'Drag and drop chemicals to see reactions', icon: '🧪✨', color: '#00bcd4' }
    ]
  },
  {
    id: 'english',
    title: 'English & Languages',
    icon: '📚',
    image: '/assets/images/english_subject.jpg',
    games: [
      { id: 'word-scramble', title: 'Word Scramble', desc: 'Unscramble the letters to spell the word', icon: '🔤🌪️', color: '#ff5722' },
      { id: 'snake-speller', title: 'Snake Speller', desc: 'Guide the snake to eat the correct letters', icon: '🐍🍎', color: '#4caf50' }
    ]
  }
];

function GameHub() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mini Games</h1>
        <p>Play interactive games to master your subjects and earn XP!</p>
      </div>

      <div className="subjects-container">
        {SUBJECTS.map(subject => (
          <div key={subject.id} className="subject-section">
            <h2 className="subject-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="subject-icon" style={{ display: 'flex' }}>
                {subject.image ? <img src={subject.image} alt={subject.title} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} /> : subject.icon}
              </span>
              {subject.title}
            </h2>

            <div className="games-grid">
              {subject.games.map(game => (
                <div
                  key={game.id}
                  className="game-card"
                  onClick={() => navigate(`/student/games/${game.id}`)}
                >
                  <div className="game-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                    {game.image ? <img src={game.image} alt={game.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} /> : game.icon}
                  </div>
                  <div className="game-title">{game.title}</div>
                  <div className="game-desc">{game.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GameHub;
