import React, { useState, useCallback } from 'react';
import { QuizQuestion, QuizQuestion as QQ } from '@/types';
import { COMPETENCY_LABELS, COMPETENCY_COLORS } from '@/data/quizQuestions';

interface QuizComponentProps {
  questions: QuizQuestion[];
  onComplete: (correct: number, total: number, xpEarned: number) => void;
  onAnswerRecorded: (correct: boolean) => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ questions, onComplete, onAnswerRecorded }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const handleAnswer = useCallback((answerIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const correct = answerIndex === currentQuestion.correctAnswer;
    if (correct) {
      setScore(s => s + 1);
      setTotalXP(xp => xp + currentQuestion.xpReward);
    }
    onAnswerRecorded(correct);
  }, [isAnswered, currentQuestion, onAnswerRecorded]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
      onComplete(score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0), questions.length, totalXP + (selectedAnswer === currentQuestion.correctAnswer ? currentQuestion.xpReward : 0));
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  }, [currentIndex, questions.length, score, selectedAnswer, currentQuestion, totalXP, onComplete]);

  if (isFinished) {
    const finalScore = score;
    const pct = Math.round((finalScore / questions.length) * 100);
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center slide-up">
        <div className="text-6xl">
          {pct >= 80 ? '🏆' : pct >= 60 ? '⚽' : '📚'}
        </div>
        <div>
          <h2 className="font-sports text-3xl text-foreground">Quiz Complete!</h2>
          <p className="mt-1 text-muted-foreground">Great effort, champion!</p>
        </div>
        <div className="flex gap-6">
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4">
            <span className="font-sports text-3xl text-primary">{finalScore}/{questions.length}</span>
            <span className="text-xs text-muted-foreground">Correct</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4">
            <span className="font-sports text-3xl text-accent">{pct}%</span>
            <span className="text-xs text-muted-foreground">Accuracy</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4">
            <span className="font-sports text-3xl text-green-400">+{totalXP}</span>
            <span className="text-xs text-muted-foreground">XP Earned</span>
          </div>
        </div>
        <div className="max-w-xs rounded-xl border border-primary/20 bg-primary/10 p-4">
          <p className="text-sm text-primary">
            {pct >= 80 ? '🌟 Outstanding! You\'re mastering CBC Football knowledge!' 
             : pct >= 60 ? '👍 Good effort! Keep studying to improve your score.'
             : '📖 Keep learning! Review the topics and try again.'}
          </p>
        </div>
      </div>
    );
  }

  const optionStyles = (index: number) => {
    if (!isAnswered) {
      return 'border-border bg-card hover:border-primary/50 hover:bg-primary/10 cursor-pointer';
    }
    if (index === currentQuestion.correctAnswer) {
      return 'border-green-500 bg-green-500/20 cursor-default';
    }
    if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
      return 'border-destructive bg-destructive/20 cursor-default';
    }
    return 'border-border bg-card/50 cursor-default opacity-60';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span className={COMPETENCY_COLORS[currentQuestion.competencyArea]}>
            {COMPETENCY_LABELS[currentQuestion.competencyArea]}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full gradient-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="rounded-xl border border-border gradient-card p-5 slide-up">
        <p className="text-xs text-muted-foreground mb-2">
          📚 {currentQuestion.learningOutcome}
        </p>
        <h3 className="font-sports text-lg text-foreground leading-snug">
          {currentQuestion.question}
        </h3>
      </div>

      {/* Options */}
      <div className="grid gap-2">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            className={`rounded-xl border p-3.5 text-left text-sm font-medium transition-all duration-200 ${optionStyles(index)}`}
          >
            <span className="mr-3 font-sports text-muted-foreground">
              {String.fromCharCode(65 + index)}.
            </span>
            <span className={
              isAnswered && index === currentQuestion.correctAnswer ? 'text-green-400' 
              : isAnswered && index === selectedAnswer ? 'text-destructive'
              : 'text-foreground'
            }>
              {option}
            </span>
          </button>
        ))}
      </div>

      {/* Explanation */}
      {isAnswered && (
        <div className={`rounded-xl border p-4 slide-up ${
          selectedAnswer === currentQuestion.correctAnswer
            ? 'border-green-500/30 bg-green-500/10'
            : 'border-destructive/30 bg-destructive/10'
        }`}>
          <p className="text-xs font-sports mb-1">
            {selectedAnswer === currentQuestion.correctAnswer ? '✅ Correct! +' + currentQuestion.xpReward + ' XP' : '❌ Incorrect'}
          </p>
          <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Next button */}
      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full rounded-xl gradient-primary py-3 font-sports text-primary-foreground transition-opacity hover:opacity-90 slide-up"
        >
          {currentIndex + 1 >= questions.length ? 'FINISH QUIZ' : 'NEXT QUESTION →'}
        </button>
      )}
    </div>
  );
};

export default QuizComponent;
