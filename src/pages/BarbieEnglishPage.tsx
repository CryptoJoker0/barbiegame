import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'wouter';
import barbieLogo from '@/assets/barbie-logo.png';
import gameEnglish from '@/assets/game-english.png';

// ── Types ─────────────────────────────────────────────────────────────────────
type Screen = 'home' | 'mode' | 'difficulty' | 'game' | 'win' | 'leaderboard' | 'profile';
type Mode = 'vocabulary' | 'grammar' | 'spelling' | 'reading';
type Difficulty = 'easy' | 'medium' | 'hard';
type FeedbackState = 'correct' | 'wrong' | null;

interface Question {
  text: string;
  options: string[];
  correct: number;
  hint?: string;
}

// ── Question Bank ─────────────────────────────────────────────────────────────
const QUESTIONS: Record<Mode, Record<Difficulty, Question[]>> = {
  vocabulary: {
    easy: [
      { text: 'Which word means a baby cat?', options: ['Puppy', 'Kitten', 'Cub', 'Foal'], correct: 1 },
      { text: 'What is another word for "happy"?', options: ['Sad', 'Angry', 'Joyful', 'Tired'], correct: 2 },
      { text: 'Which word means the opposite of "big"?', options: ['Tall', 'Small', 'Long', 'Wide'], correct: 1 },
      { text: 'What do you call a place where books are kept?', options: ['Museum', 'School', 'Library', 'Market'], correct: 2 },
      { text: 'Which word means a baby dog?', options: ['Cub', 'Lamb', 'Puppy', 'Calf'], correct: 2 },
      { text: 'What is the opposite of "hot"?', options: ['Warm', 'Cold', 'Cool', 'Mild'], correct: 1 },
      { text: 'Which word means to move very fast?', options: ['Walk', 'Crawl', 'Run', 'Sit'], correct: 2 },
      { text: 'What do you use to write on paper?', options: ['Brush', 'Pencil', 'Ruler', 'Eraser'], correct: 1 },
      { text: 'Which word means a large body of salt water?', options: ['River', 'Lake', 'Ocean', 'Pond'], correct: 2 },
      { text: 'What is another word for "begin"?', options: ['End', 'Start', 'Stop', 'Pause'], correct: 1 },
    ],
    medium: [
      { text: 'What does "ancient" mean?', options: ['New', 'Very old', 'Colorful', 'Small'], correct: 1 },
      { text: 'Which word means to feel very nervous or worried?', options: ['Calm', 'Anxious', 'Excited', 'Bored'], correct: 1 },
      { text: 'What is the meaning of "enormous"?', options: ['Tiny', 'Medium', 'Huge', 'Narrow'], correct: 2 },
      { text: 'Which word describes a person who tells lies?', options: ['Honest', 'Truthful', 'Dishonest', 'Kind'], correct: 2 },
      { text: 'What does "curious" mean?', options: ['Bored', 'Eager to learn', 'Angry', 'Tired'], correct: 1 },
      { text: 'Which word means to make something better?', options: ['Worsen', 'Improve', 'Ignore', 'Destroy'], correct: 1 },
      { text: 'What does "fragile" mean?', options: ['Strong', 'Heavy', 'Easy to break', 'Flexible'], correct: 2 },
      { text: 'Which word means a person who treats sick people?', options: ['Teacher', 'Doctor', 'Lawyer', 'Chef'], correct: 1 },
      { text: 'What is the meaning of "hilarious"?', options: ['Sad', 'Very funny', 'Boring', 'Scary'], correct: 1 },
      { text: 'What does "migrate" mean?', options: ['Stay still', 'Move to a new place', 'Build a home', 'Eat food'], correct: 1 },
    ],
    hard: [
      { text: 'What does "ambiguous" mean?', options: ['Perfectly clear', 'Having more than one meaning', 'Very loud', 'Extremely large'], correct: 1 },
      { text: 'Which word means showing great skill?', options: ['Clumsy', 'Awkward', 'Proficient', 'Ignorant'], correct: 2 },
      { text: 'What does "benevolent" mean?', options: ['Cruel', 'Generous and kind', 'Selfish', 'Angry'], correct: 1 },
      { text: 'Which word means to officially cancel a law?', options: ['Enact', 'Repeal', 'Enforce', 'Propose'], correct: 1 },
      { text: 'What does "eloquent" mean?', options: ['Unable to speak', 'Speaking very effectively', 'Speaking too loudly', 'Whispering'], correct: 1 },
      { text: 'Which word means feeling regret for wrongdoing?', options: ['Proud', 'Indifferent', 'Remorseful', 'Joyful'], correct: 2 },
      { text: 'What does "tenacious" mean?', options: ['Giving up easily', 'Holding on firmly', 'Moving slowly', 'Speaking softly'], correct: 1 },
      { text: 'Which word means to predict the future based on signs?', options: ['Remember', 'Forget', 'Foretell', 'Ignore'], correct: 2 },
      { text: 'What does "meticulous" mean?', options: ['Careless', 'Very careful and precise', 'Quick and sloppy', 'Lazy'], correct: 1 },
      { text: 'Which word means showing off wealth in an obvious way?', options: ['Humble', 'Modest', 'Ostentatious', 'Simple'], correct: 2 },
    ],
  },
  grammar: {
    easy: [
      { text: 'Choose the correct sentence:', options: ['She go to school.', 'She goes to school.', 'She going to school.', 'She gone to school.'], correct: 1 },
      { text: 'Which is a noun?', options: ['Run', 'Happy', 'Dog', 'Quickly'], correct: 2 },
      { text: 'Fill in the blank: "I ___ a student."', options: ['am', 'is', 'are', 'be'], correct: 0 },
      { text: 'Which word is a verb?', options: ['Blue', 'Jump', 'House', 'Pretty'], correct: 1 },
      { text: 'Choose the correct plural: one cat, two ___', options: ['cates', 'cats', 'catz', 'catt'], correct: 1 },
      { text: 'Fill in: "They ___ playing football now."', options: ['is', 'am', 'are', 'was'], correct: 2 },
      { text: 'Which word is an adjective?', options: ['Eat', 'Beautiful', 'House', 'Quickly'], correct: 1 },
      { text: '"The dog ___ barking." Choose the right word:', options: ['are', 'is', 'were', 'am'], correct: 1 },
      { text: 'Which sentence is correct?', options: ['He don\'t like apples.', 'He doesn\'t likes apples.', 'He doesn\'t like apples.', 'He not like apples.'], correct: 2 },
      { text: 'What type of word is "quickly"?', options: ['Noun', 'Verb', 'Adjective', 'Adverb'], correct: 3 },
    ],
    medium: [
      { text: 'Which sentence uses the past tense correctly?', options: ['She buyed a dress.', 'She buys a dress.', 'She bought a dress.', 'She buy a dress.'], correct: 2 },
      { text: 'Choose the correct form: "Neither Tom nor the boys ___ ready."', options: ['is', 'are', 'was', 'am'], correct: 1 },
      { text: 'Which word correctly completes: "He is taller ___ his brother."', options: ['then', 'that', 'than', 'them'], correct: 2 },
      { text: 'Select the correct sentence:', options: ['I have went there.', 'I have gone there.', 'I have go there.', 'I have going there.'], correct: 1 },
      { text: '"___ is your favourite subject?" Fill in:', options: ['Who', 'What', 'Where', 'When'], correct: 1 },
      { text: 'Choose the passive voice: "The cake ___ by Mary."', options: ['baked', 'was baked', 'bakes', 'is bake'], correct: 1 },
      { text: 'Select the correct comparative: "This book is ___ than that one."', options: ['more interesting', 'most interesting', 'interestinger', 'much interesting'], correct: 0 },
      { text: 'Which sentence uses a conjunction correctly?', options: ['I was tired, and I went to bed.', 'I was tired, I went and bed.', 'I tired and went bed.', 'I was tired and to bed went.'], correct: 0 },
      { text: '"She wishes she ___ taller." Choose correctly:', options: ['is', 'are', 'were', 'was'], correct: 2 },
      { text: 'Which uses apostrophe correctly?', options: ["The dog's bone", "The dogs bone", "The dog's bone's", "The dogs' bone's"], correct: 0 },
    ],
    hard: [
      { text: 'Choose the correct subjunctive: "It is essential that he ___ on time."', options: ['is', 'are', 'be', 'was'], correct: 2 },
      { text: 'Identify the dangling modifier: which sentence is wrong?', options: ['"Running fast, the finish line was reached."', '"Running fast, she reached the finish line."', '"She ran fast to reach the finish line."', '"The finish line was reached by her running fast."'], correct: 0 },
      { text: '"By the time we arrived, they ___ already left." Choose correctly:', options: ['had', 'have', 'has', 'were'], correct: 0 },
      { text: 'Which sentence correctly uses a semicolon?', options: ['I went to the store; but it was closed.', 'I went to the store; it was closed.', 'I went; to the store it was closed.', 'I went to the store it; was closed.'], correct: 1 },
      { text: 'Choose the correct form: "She is one of those students who ___ hard."', options: ['works', 'work', 'working', 'worked'], correct: 1 },
      { text: 'Identify the correct use of "whom": ', options: ['"Whom is calling?"', '"Who did you call?"', '"To whom did you speak?"', '"Whom called you?"'], correct: 2 },
      { text: '"If I ___ you, I would apologise." Choose correctly:', options: ['am', 'was', 'were', 'be'], correct: 2 },
      { text: 'Which is a complex sentence?', options: ['She ran and she fell.', 'She ran quickly.', 'Although she ran, she fell.', 'She ran; she fell.'], correct: 2 },
      { text: 'Select the correctly punctuated sentence:', options: ['"Well" he said "that was unexpected."', '"Well," he said, "that was unexpected."', '"Well," he said "that was unexpected."', '"Well" he said, "that was unexpected."'], correct: 1 },
      { text: 'Which correctly uses "fewer" vs "less"?', options: ['There are less apples today.', 'I have fewer patience now.', 'There are fewer students today.', 'Less people came.'], correct: 2 },
    ],
  },
  spelling: {
    easy: [
      { text: 'Which spelling is correct for a large grey animal with a trunk?', options: ['Elefant', 'Elephant', 'Elephent', 'Eliphant'], correct: 1 },
      { text: 'How do you spell the colour between blue and yellow?', options: ['Grean', 'Gren', 'Green', 'Grene'], correct: 2 },
      { text: 'Spell the word meaning the opposite of night:', options: ['Dai', 'Daye', 'Day', 'Dey'], correct: 2 },
      { text: 'Which spelling is correct for a flying mammal that comes out at night?', options: ['Bat', 'Batt', 'Bat', 'Baet'], correct: 0 },
      { text: 'How do you spell the word for a house of ice?', options: ['Iglu', 'Igloo', 'Iglue', 'Iglou'], correct: 1 },
      { text: 'Spell the word for the person who teaches you:', options: ['Teecher', 'Teacher', 'Techer', 'Teachor'], correct: 1 },
      { text: 'Which is the correct spelling of a yellow fruit?', options: ['Banena', 'Bannana', 'Banana', 'Bananaa'], correct: 2 },
      { text: 'How do you spell the word for something you play with?', options: ['Toy', 'Toye', 'Toi', 'Toiy'], correct: 0 },
      { text: 'Spell the word for the number after nine:', options: ['Ten', 'Tenn', 'Tan', 'Tien'], correct: 0 },
      { text: 'Which spelling is correct for something you drink from?', options: ['Cup', 'Cupp', 'Kup', 'Ckup'], correct: 0 },
    ],
    medium: [
      { text: 'Which is spelt correctly?', options: ['Recieve', 'Receive', 'Receeve', 'Recive'], correct: 1 },
      { text: 'Choose the correct spelling:', options: ['Neccessary', 'Necessary', 'Necesary', 'Neccesary'], correct: 1 },
      { text: 'Which spelling is correct?', options: ['Accomodate', 'Accommodate', 'Acomodate', 'Accommadate'], correct: 1 },
      { text: 'Choose the right spelling:', options: ['Embarras', 'Embarass', 'Embarrass', 'Embaras'], correct: 2 },
      { text: 'Which is correct?', options: ['Seperate', 'Seperate', 'Separate', 'Seperrate'], correct: 2 },
      { text: 'Choose the correct spelling:', options: ['Definately', 'Definitly', 'Definitely', 'Definetely'], correct: 2 },
      { text: 'Which spelling is correct?', options: ['Occurance', 'Occurrence', 'Occurence', 'Ocurrence'], correct: 1 },
      { text: 'Choose the right spelling:', options: ['Priviledge', 'Privilege', 'Privlege', 'Privilidge'], correct: 1 },
      { text: 'Which is correct?', options: ['Liason', 'Liaison', 'Liasion', 'Liazon'], correct: 1 },
      { text: 'Choose the correct spelling:', options: ['Concious', 'Consciuos', 'Conscious', 'Consious'], correct: 2 },
    ],
    hard: [
      { text: 'Which is correctly spelt?', options: ['Acquiesce', 'Acquiese', 'Acquieese', 'Aquiesce'], correct: 0 },
      { text: 'Choose the correct spelling:', options: ['Mneumonic', 'Mnemonic', 'Mnemonik', 'Nnemonic'], correct: 1 },
      { text: 'Which spelling is correct?', options: ['Supersede', 'Supercede', 'Superceed', 'Superseed'], correct: 0 },
      { text: 'Choose the right spelling:', options: ['Millennium', 'Millenium', 'Milenium', 'Millennuim'], correct: 0 },
      { text: 'Which is correctly spelt?', options: ['Pseudonym', 'Psudonym', 'Pseduonym', 'Pseudonim'], correct: 0 },
      { text: 'Choose the correct spelling:', options: ['Resaurant', 'Restarant', 'Restaurant', 'Restaurent'], correct: 2 },
      { text: 'Which spelling is correct?', options: ['Bureaucracy', 'Buraucracy', 'Beureaucracy', 'Bureaucrasy'], correct: 0 },
      { text: 'Choose the right spelling:', options: ['Harass', 'Harrass', 'Harras', 'Haras'], correct: 0 },
      { text: 'Which is correctly spelt?', options: ['Pharaoh', 'Pharoah', 'Faraoh', 'Pharaoh'], correct: 0 },
      { text: 'Choose the correct spelling:', options: ['Inoculate', 'Innoculate', 'Inocullate', 'Innocculate'], correct: 0 },
    ],
  },
  reading: {
    easy: [
      { text: 'Read: "The sun is very hot and bright. We need it to grow food." What does the sun give us?', options: ['Rain', 'Cold', 'Light and heat', 'Ice'], correct: 2 },
      { text: 'Read: "Tom has three apples. He gives one to Sara." How many apples does Tom have left?', options: ['One', 'Two', 'Three', 'Four'], correct: 1 },
      { text: '"Dogs are loyal animals. They protect their owners." What does loyal mean here?', options: ['Dangerous', 'Faithful and devoted', 'Wild', 'Lazy'], correct: 1 },
      { text: '"The cat sat on the mat. It was sleeping." Where was the cat?', options: ['On the chair', 'On the mat', 'On the bed', 'On the floor'], correct: 1 },
      { text: '"Mary loves reading books. She visits the library every week." How often does Mary visit the library?', options: ['Every day', 'Every month', 'Every week', 'Every year'], correct: 2 },
      { text: '"It was raining hard. Jane took her umbrella." Why did Jane take the umbrella?', options: ['It was sunny', 'It was raining', 'It was windy', 'It was snowing'], correct: 1 },
      { text: '"Ben is taller than Jack but shorter than Mike." Who is the tallest?', options: ['Ben', 'Jack', 'Mike', 'They are the same'], correct: 2 },
      { text: '"The bird flew high into the sky." What did the bird do?', options: ['Swam', 'Ran', 'Flew', 'Crawled'], correct: 2 },
      { text: '"The shop opens at 9am and closes at 5pm." How many hours is the shop open?', options: ['6 hours', '7 hours', '8 hours', '9 hours'], correct: 2 },
      { text: '"Lily planted seeds in spring. In summer, flowers bloomed." When did the flowers bloom?', options: ['Spring', 'Winter', 'Summer', 'Autumn'], correct: 2 },
    ],
    medium: [
      { text: '"Despite the rain, the match continued. The players were determined." What does "determined" suggest?', options: ['They were confused', 'They refused to give up', 'They were scared', 'They were bored'], correct: 1 },
      { text: '"The ancient castle stood on a hill. Its walls told stories of battles long past." What word tells us the castle is very old?', options: ['Castle', 'Hill', 'Ancient', 'Walls'], correct: 2 },
      { text: '"Sarah worked tirelessly to finish her project. Her effort paid off." What does "tirelessly" mean?', options: ['With great energy', 'Without stopping, despite being tired', 'Slowly', 'Carelessly'], correct: 1 },
      { text: '"The scientist\'s discovery was groundbreaking." What does "groundbreaking" mean here?', options: ['Related to digging ground', 'Revolutionary and new', 'Dangerous', 'Small and insignificant'], correct: 1 },
      { text: '"He spoke in a hushed tone so as not to wake the baby." Why did he speak quietly?', options: ['He was ill', 'He was afraid', 'To avoid waking the baby', 'He had no voice'], correct: 2 },
      { text: '"The team celebrated their hard-earned victory." What does "hard-earned" tell us?', options: ['The victory was easy', 'The victory came without effort', 'The victory required great effort', 'The victory was given to them'], correct: 2 },
      { text: '"Though small in size, the ant carries objects many times its own weight." This shows the ant is:', options: ['Weak and fragile', 'Incredibly strong for its size', 'Very large', 'Lazy'], correct: 1 },
      { text: '"The forecast predicted sunshine, but dark clouds gathered." What literary device is used?', options: ['Simile', 'Metaphor', 'Foreshadowing', 'Alliteration'], correct: 2 },
      { text: '"She was over the moon when she heard the news." What does "over the moon" mean?', options: ['She was floating in space', 'She was extremely happy', 'She was confused', 'She was sad'], correct: 1 },
      { text: '"The author\'s use of vivid descriptions brings the setting to life." "Vivid" means:', options: ['Dull and boring', 'Short and simple', 'Bright, clear and detailed', 'Confusing'], correct: 2 },
    ],
    hard: [
      { text: '"The protagonist\'s tragic flaw ultimately leads to their downfall." What is a "tragic flaw"?', options: ['A physical disability', 'A mistake made by others', 'A personal weakness that causes disaster', 'A strength that becomes harmful'], correct: 2 },
      { text: '"The author employs dramatic irony when the audience knows what the character does not." What is dramatic irony?', options: ['When everyone is surprised', 'When the audience knows more than the characters', 'When characters lie to each other', 'When the plot is very dramatic'], correct: 1 },
      { text: '"The poem\'s extended metaphor compares life to a journey." What is an extended metaphor?', options: ['A very short comparison', 'A comparison that runs throughout a text', 'A metaphor about travel', 'A metaphor using simile'], correct: 1 },
      { text: '"The author\'s didactic purpose is evident in the moral lesson at the story\'s end." What does "didactic" mean?', options: ['Entertaining', 'Intended to teach a moral lesson', 'Confusing', 'Purely for enjoyment'], correct: 1 },
      { text: '"The narrative structure employs a non-linear timeline to create suspense." What does this mean?', options: ['The story moves in strict order', 'The story skips between time periods', 'The story has no ending', 'The story is told backwards'], correct: 1 },
      { text: '"The text\'s omniscient narrator reveals the inner thoughts of all characters." "Omniscient" means:', options: ['Knowing only one character\'s thoughts', 'Knowing nothing about the characters', 'All-knowing', 'Unreliable'], correct: 2 },
      { text: '"The author uses pathos to evoke sympathy from the reader." What is pathos?', options: ['A logical argument', 'An appeal to the reader\'s emotions', 'An appeal to authority', 'A humorous technique'], correct: 1 },
      { text: '"The juxtaposition of wealth and poverty highlights social inequality." What is juxtaposition?', options: ['Combining similar things', 'Placing contrasting things close together', 'Hiding differences', 'Ignoring differences'], correct: 1 },
      { text: '"The author\'s use of anachronism creates a comic effect." What is an anachronism?', options: ['A modern invention', 'Something placed in the wrong time period', 'A type of metaphor', 'A narrative structure'], correct: 1 },
      { text: '"The text is written in second person, directly addressing the reader as \'you\'." What effect does this create?', options: ['Distance between reader and text', 'A sense of immersion and personal involvement', 'A historical narrative', 'A formal academic tone'], correct: 1 },
    ],
  },
};

// ── Shuffle array ─────────────────────────────────────────────────────────────
function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Floating star background ──────────────────────────────────────────────────
function FloatingStars() {
  const stars = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${(i * 8.3) % 100}%`,
    top: `${(i * 7.1 + 5) % 90}%`,
    delay: `${(i * 0.5) % 4}s`,
    size: i % 3 === 0 ? '1.8rem' : i % 3 === 1 ? '1.4rem' : '1rem',
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute animate-bounce opacity-40 text-yellow-300"
          style={{ left: s.left, top: s.top, animationDelay: s.delay, fontSize: s.size, animationDuration: `${3 + (s.id % 3)}s` }}
        >
          ⭐
        </div>
      ))}
    </div>
  );
}

// ── Mode card ─────────────────────────────────────────────────────────────────
const MODE_CONFIG: Record<Mode, { icon: string; label: string; color: string }> = {
  vocabulary: { icon: '📚', label: 'Vocabulary', color: '#4CAF50' },
  grammar:    { icon: '✏️', label: 'Grammar',    color: '#2196F3' },
  spelling:   { icon: '🔤', label: 'Spelling',   color: '#9C27B0' },
  reading:    { icon: '📖', label: 'Reading',    color: '#FF9800' },
};

const DIFF_CONFIG: Record<Difficulty, { icon: string; label: string; age: string; color: string; lives: number; timePerQ: number }> = {
  easy:   { icon: '⭐',   label: 'Easy',   age: 'Ages 6–8',   color: '#4CAF50', lives: 5, timePerQ: 30 },
  medium: { icon: '⭐⭐', label: 'Medium', age: 'Ages 9–11',  color: '#FF9800', lives: 3, timePerQ: 20 },
  hard:   { icon: '⭐⭐⭐',label: 'Hard',  age: 'Ages 12+',  color: '#f44336', lives: 2, timePerQ: 15 },
};

// ── Confetti burst ─────────────────────────────────────────────────────────────
function triggerConfetti() {
  const colors = ['#ff1493', '#ffd700', '#ff69b4', '#ffb6c9', '#00bcd4', '#4caf50'];
  let count = 0;
  const interval = setInterval(() => {
    if (count++ > 4) { clearInterval(interval); return; }
    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position:fixed;z-index:9999;pointer-events:none;
        width:${6 + Math.random() * 8}px;height:${6 + Math.random() * 8}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        left:${20 + Math.random() * 60}vw;top:${-20}px;
        animation:confettiFall ${1.5 + Math.random()}s linear forwards;
      `;
      document.body.appendChild(el);
      particles.push(el);
      setTimeout(() => el.remove(), 3000);
    }
  }, 300);
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function BarbieEnglishPage() {
  const [screen, setScreen] = useState<Screen>('home');
  const [mode, setMode] = useState<Mode>('vocabulary');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  // correctCount: number of questions answered correctly this round
  const [correctCount, setCorrectCount] = useState(0);
  // answeredCount: total questions attempted (including wrong), capped at questions.length on win screen
  const [answeredCount, setAnsweredCount] = useState(0);
  const [playerName] = useState(() => localStorage.getItem('barbie_eng_name') || 'Star Player');
  const [leaderboard, setLeaderboard] = useState<Array<{ name: string; score: number; mode: Mode; difficulty: Difficulty }>>(() => {
    try { return JSON.parse(localStorage.getItem('barbie_eng_lb') || '[]'); } catch { return []; }
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const diffCfg = DIFF_CONFIG[difficulty];
  const currentQ = questions[qIndex];

  // ── Timer ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'game' || feedback !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer(-1); // timeout = wrong
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [screen, qIndex, feedback]);

  function startGame(m: Mode, d: Difficulty) {
    const qs = shuffleArr(QUESTIONS[m][d]).slice(0, 10);
    setMode(m);
    setDifficulty(d);
    setQuestions(qs);
    setQIndex(0);
    setScore(0);
    setCorrectCount(0);
    setAnsweredCount(0);
    setLives(DIFF_CONFIG[d].lives);
    setFeedback(null);
    setSelectedOption(null);
    setTimeLeft(DIFF_CONFIG[d].timePerQ);
    setScreen('game');
  }

  const handleAnswer = useCallback((optIndex: number) => {
    if (feedback !== null) return;
    clearInterval(timerRef.current!);
    const q = questions[qIndex];
    if (!q) return;

    const isCorrect = optIndex === q.correct;
    setSelectedOption(optIndex);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    // Calculate points for this answer synchronously so we can persist exact final score
    const timeBonus = isCorrect ? Math.ceil((timeLeft / diffCfg.timePerQ) * 50) : 0;
    const pointsEarned = isCorrect ? 100 + timeBonus : 0;
    const newScore = score + pointsEarned;
    const newCorrect = correctCount + (isCorrect ? 1 : 0);
    const newAnswered = answeredCount + 1;

    if (isCorrect) {
      setScore(newScore);
      setCorrectCount(newCorrect);
    }
    setAnsweredCount(newAnswered);

    const newLives = isCorrect ? lives : lives - 1;
    if (!isCorrect) setLives(newLives);

    const nextIdx = qIndex + 1;
    const isGameOver = newLives <= 0 || nextIdx >= questions.length;

    feedbackRef.current = setTimeout(() => {
      if (isGameOver) {
        // Perfect round: answered every question correctly without running out of lives
        if (nextIdx >= questions.length && newLives > 0 && newCorrect === questions.length) {
          triggerConfetti();
        }
        setScreen('win');
        // Persist score — newScore already includes this question's time bonus
        const entry = { name: playerName, score: newScore, mode, difficulty };
        const updated = [...leaderboard, entry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        setLeaderboard(updated);
        localStorage.setItem('barbie_eng_lb', JSON.stringify(updated));
      } else {
        setQIndex(nextIdx);
        setFeedback(null);
        setSelectedOption(null);
        setTimeLeft(DIFF_CONFIG[difficulty].timePerQ);
      }
    }, 1200);
  }, [feedback, questions, qIndex, timeLeft, diffCfg, lives, score, correctCount, answeredCount, difficulty, playerName, mode, leaderboard]);

  // Progress shows completed questions out of total
  const progress = questions.length > 0 ? (Math.min(answeredCount, questions.length) / questions.length) * 100 : 0;
  // Perfect round: all questions answered, all correct, still have lives
  const isAllCorrect = screen === 'win' && correctCount === questions.length && questions.length > 0 && lives > 0;

  // ── Screens ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8fb3 25%, #ffb6c9 50%, #ffccd5 75%, #fff0f5 100%)' }}>
      {/* Inject confetti keyframe */}
      <style>{`
        @keyframes confettiFall {
          to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <FloatingStars />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {/* ── HOME ────────────────────────────────────────────────────────────── */}
        {screen === 'home' && (
          <div className="text-center animate-fadeIn">
            {/* Back link */}
            <div className="flex justify-between items-center mb-4">
              <Link href="/games">
                <button className="text-[#ff1493] font-bold text-sm px-4 py-2 rounded-full bg-white/60 hover:bg-white transition-colors">
                  ← Back to Games
                </button>
              </Link>
              <button
                onClick={() => setScreen('leaderboard')}
                className="text-[#ff1493] font-bold text-sm px-4 py-2 rounded-full bg-white/60 hover:bg-white transition-colors"
              >
                🏆 Leaderboard
              </button>
            </div>

            {/* Cover image */}
            <div className="flex justify-center mb-6">
              <img
                src={gameEnglish}
                alt="BARBIE AND FRIENDS - English Challenge"
                className="w-full max-w-lg rounded-3xl shadow-2xl border-4 border-white/60"
              />
            </div>

            <h1 className="font-black text-[#ff1493] mb-2 drop-shadow-lg" style={{ fontSize: 'clamp(2rem,6vw,3.5rem)', textShadow: '3px 3px 0 #ffb6c9, 6px 6px 0 #ff8fb3' }}>
              BARBIE AND FRIENDS
            </h1>
            <p className="text-[#ff6b9d] font-bold text-xl mb-8">✨ English Challenge ✨</p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <div className="bg-white/70 rounded-2xl px-5 py-3 text-center">
                <div className="text-2xl mb-1">📚</div>
                <div className="text-xs font-black text-[#ff1493]">BUILD VOCABULARY</div>
                <div className="text-xs text-gray-500">Learn new words in a fun way!</div>
              </div>
              <div className="bg-white/70 rounded-2xl px-5 py-3 text-center">
                <div className="text-2xl mb-1">💬</div>
                <div className="text-xs font-black text-[#ff1493]">ANSWER & THINK</div>
                <div className="text-xs text-gray-500">Read, understand and answer!</div>
              </div>
              <div className="bg-white/70 rounded-2xl px-5 py-3 text-center">
                <div className="text-2xl mb-1">⭐</div>
                <div className="text-xs font-black text-[#ff1493]">LEVEL UP & WIN</div>
                <div className="text-xs text-gray-500">Earn stars and awesome prizes!</div>
              </div>
            </div>

            <button
              onClick={() => setScreen('mode')}
              className="inline-block px-12 py-5 text-xl font-black text-white rounded-full shadow-xl transition-all hover:scale-110 hover:shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)', boxShadow: '0 8px 30px rgba(255,20,147,0.5)' }}
            >
              ▶ PLAY NOW!
            </button>

            <p className="mt-6 text-[#ff6b9d] font-bold text-sm">♥ PLAY • LEARN • SHINE ♥</p>
          </div>
        )}

        {/* ── MODE SELECT ──────────────────────────────────────────────────────── */}
        {screen === 'mode' && (
          <div className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setScreen('home')} className="text-[#ff1493] font-black px-4 py-2 rounded-full bg-white/60 hover:bg-white transition-colors">←</button>
              <h2 className="text-3xl font-black text-[#ff1493] drop-shadow">Choose Your Game</h2>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {(Object.keys(MODE_CONFIG) as Mode[]).map(m => {
                const cfg = MODE_CONFIG[m];
                return (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setScreen('difficulty'); }}
                    className="bg-white rounded-3xl p-8 flex flex-col items-center gap-3 border-4 border-transparent hover:scale-105 transition-all shadow-lg hover:shadow-2xl"
                    style={{ borderColor: cfg.color + '66' }}
                  >
                    <span className="text-5xl">{cfg.icon}</span>
                    <span className="text-xl font-black text-[#ff1493]">{cfg.label}</span>
                    <span className="text-xs text-gray-400 font-semibold">10 Questions per round</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── DIFFICULTY ───────────────────────────────────────────────────────── */}
        {screen === 'difficulty' && (
          <div className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setScreen('mode')} className="text-[#ff1493] font-black px-4 py-2 rounded-full bg-white/60 hover:bg-white transition-colors">←</button>
              <h2 className="text-3xl font-black text-[#ff1493] drop-shadow">Select Difficulty</h2>
            </div>
            <div className="grid gap-5">
              {(Object.keys(DIFF_CONFIG) as Difficulty[]).map(d => {
                const cfg = DIFF_CONFIG[d];
                return (
                  <button
                    key={d}
                    onClick={() => startGame(mode, d)}
                    className="bg-white rounded-3xl p-8 text-left border-4 hover:scale-[1.02] transition-all shadow-lg hover:shadow-2xl"
                    style={{ borderColor: cfg.color }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-2xl font-black text-[#ff1493]">{cfg.icon} {cfg.label}</span>
                        <span className="ml-3 text-sm text-gray-400 font-semibold">{cfg.age}</span>
                      </div>
                      <span className="text-3xl">
                        {d === 'easy' ? '😊' : d === 'medium' ? '🤔' : '🧠'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 font-medium">
                      <span>❤️ {cfg.lives} lives</span>
                      <span>⏱ {cfg.timePerQ}s per question</span>
                      <span>🏆 100+ pts per correct answer</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── GAME ─────────────────────────────────────────────────────────────── */}
        {screen === 'game' && currentQ && (
          <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <div className="px-4 py-2 rounded-full font-black text-white text-sm shadow-md" style={{ background: 'linear-gradient(135deg,#ff1493,#ff69b4)' }}>
                {MODE_CONFIG[mode].icon} {MODE_CONFIG[mode].label} · {DIFF_CONFIG[difficulty].label}
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="px-4 py-2 rounded-full bg-yellow-300 font-black text-yellow-800 text-sm shadow flex items-center gap-1">⭐ {score.toLocaleString()}</div>
                <div className="px-4 py-2 rounded-full bg-red-100 font-black text-red-500 text-sm shadow">
                  {'❤️'.repeat(lives)}{'🖤'.repeat(DIFF_CONFIG[difficulty].lives - lives)}
                </div>
                <div className={`px-4 py-2 rounded-full font-black text-sm shadow ${timeLeft <= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-100 text-blue-700'}`}>
                  ⏱ {timeLeft}s
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-4 rounded-full bg-white/50 overflow-hidden mb-6 shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #ff1493, #ff69b4, #ffd700)' }}
              />
            </div>

            {/* Question */}
            <div className="rounded-3xl p-8 mb-6 text-center shadow-xl" style={{ background: 'linear-gradient(135deg,#fff0f5,#ffb6c9)' }}>
              <div className="text-sm font-black text-[#ff69b4] mb-2 uppercase tracking-widest">
                Question {qIndex + 1} of {questions.length}
              </div>
              <p className="text-xl font-black text-[#ff1493] leading-relaxed">{currentQ.text}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options.map((opt, i) => {
                let style = 'bg-white border-[#ffb6c9] text-[#ff1493] hover:bg-pink-50 hover:-translate-y-1';
                if (selectedOption !== null) {
                  if (i === currentQ.correct) style = 'bg-green-500 border-green-500 text-white scale-105';
                  else if (i === selectedOption && selectedOption !== currentQ.correct) style = 'bg-red-400 border-red-400 text-white';
                  else style = 'bg-white border-[#ffb6c9] text-gray-300 opacity-60';
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selectedOption !== null}
                    className={`border-3 rounded-2xl px-6 py-5 font-bold text-left transition-all shadow ${style}`}
                    style={{ border: '3px solid' }}
                  >
                    <span className="mr-2 text-lg">{['A', 'B', 'C', 'D'][i]}.</span> {opt}
                  </button>
                );
              })}
            </div>

            {/* Feedback message */}
            {feedback && (
              <div className={`mt-5 text-center text-xl font-black py-3 rounded-2xl ${feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {feedback === 'correct' ? '🎉 Correct! Well done!' : `❌ Oops! The answer was: "${currentQ.options[currentQ.correct]}"`}
              </div>
            )}
          </div>
        )}

        {/* ── WIN ──────────────────────────────────────────────────────────────── */}
        {screen === 'win' && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-xl mx-auto text-center">
              <div className="text-6xl mb-4">{isAllCorrect ? '🏆' : lives <= 0 ? '💔' : '🌟'}</div>
              <h2 className="text-4xl font-black text-[#ff1493] mb-2 animate-bounce">
                {isAllCorrect ? 'Amazing!' : lives <= 0 ? 'Game Over!' : 'Well Done!'}
              </h2>
              <p className="text-[#ff69b4] font-semibold mb-6">
                {isAllCorrect ? 'You answered all questions correctly! 🎊' : lives <= 0 ? 'Better luck next time! You can do it!' : 'Great effort!'}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-pink-50 rounded-2xl p-4">
                  <div className="text-3xl mb-1">⭐</div>
                  <div className="text-2xl font-black text-[#ff1493]">{score.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 font-semibold mt-1">Score</div>
                </div>
                <div className="bg-pink-50 rounded-2xl p-4">
                  <div className="text-3xl mb-1">✅</div>
                  <div className="text-2xl font-black text-[#ff1493]">{correctCount}/{answeredCount}</div>
                  <div className="text-xs text-gray-400 font-semibold mt-1">Correct</div>
                </div>
                <div className="bg-pink-50 rounded-2xl p-4">
                  <div className="text-3xl mb-1">❤️</div>
                  <div className="text-2xl font-black text-[#ff1493]">{lives}</div>
                  <div className="text-xs text-gray-400 font-semibold mt-1">Lives Left</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => startGame(mode, difficulty)}
                  className="px-8 py-4 rounded-full font-black text-white transition-all hover:scale-105 shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#ff1493,#ff69b4)' }}
                >
                  🔄 Play Again
                </button>
                <button
                  onClick={() => setScreen('mode')}
                  className="px-8 py-4 rounded-full font-black text-[#ff1493] bg-pink-100 hover:bg-pink-200 transition-all shadow"
                >
                  🎮 New Mode
                </button>
                <button
                  onClick={() => setScreen('leaderboard')}
                  className="px-8 py-4 rounded-full font-black text-yellow-700 bg-yellow-100 hover:bg-yellow-200 transition-all shadow"
                >
                  🏆 Leaderboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── LEADERBOARD ──────────────────────────────────────────────────────── */}
        {screen === 'leaderboard' && (
          <div className="animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setScreen('home')} className="text-[#ff1493] font-black px-4 py-2 rounded-full bg-white/60 hover:bg-white transition-colors">←</button>
              <h2 className="text-3xl font-black text-[#ff1493] drop-shadow">🏆 Leaderboard</h2>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-xl">
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🎮</div>
                  <p className="text-[#ff69b4] font-bold text-lg">No scores yet — be the first!</p>
                  <button
                    onClick={() => setScreen('mode')}
                    className="mt-4 px-8 py-3 rounded-full font-black text-white shadow-lg hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(135deg,#ff1493,#ff69b4)' }}
                  >
                    Play Now!
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {leaderboard.map((entry, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center px-5 py-4 rounded-2xl"
                      style={{ background: 'linear-gradient(135deg,#fff0f5,#ffb6c9)' }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-yellow-500 w-8">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>
                        <div>
                          <div className="font-black text-[#ff1493]">{entry.name}</div>
                          <div className="text-xs text-gray-400">{MODE_CONFIG[entry.mode].label} · {DIFF_CONFIG[entry.difficulty].label}</div>
                        </div>
                      </div>
                      <span className="text-xl font-black text-[#ff69b4]">⭐ {entry.score.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
