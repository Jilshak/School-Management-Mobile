import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, Alert, Modal, Dimensions } from 'react-native';
import { Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type MCQScreenProps = {
  navigation: StackNavigationProp<any, 'MCQ'>;
  route: RouteProp<{ params: { subjects: string[]; selectedChapters: string[]; blacklistedQuestions: number[] } }, 'params'>;
};

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  chapterId: string;
};

const questions: { [key: string]: Question[] } = {
  Mathematics: [
    { id: 1, question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: '4', chapterId: 'math1' },
    { id: 2, question: 'What is 3 * 3?', options: ['6', '7', '8', '9'], correctAnswer: '9', chapterId: 'math1' },
    { id: 3, question: 'What is the square root of 16?', options: ['2', '4', '8', '16'], correctAnswer: '4', chapterId: 'math1' },
    { id: 4, question: 'What is 15% of 100?', options: ['10', '15', '20', '25'], correctAnswer: '15', chapterId: 'math1' },
    { id: 5, question: 'What is the value of π (pi) to two decimal places?', options: ['3.14', '3.16', '3.18', '3.20'], correctAnswer: '3.14', chapterId: 'math1' },
    { id: 6, question: 'What is the next number in the sequence: 2, 4, 8, 16, ...?', options: ['24', '32', '64', '128'], correctAnswer: '32', chapterId: 'math1' },
    { id: 7, question: 'What is the area of a square with side length 5?', options: ['20', '25', '30', '35'], correctAnswer: '25', chapterId: 'math2' },
    { id: 8, question: 'What is the result of 2^3?', options: ['4', '6', '8', '10'], correctAnswer: '8', chapterId: 'math2' },
    { id: 9, question: 'What is the sum of angles in a triangle?', options: ['90°', '180°', '270°', '360°'], correctAnswer: '180°', chapterId: 'math2' },
    { id: 10, question: 'What is the result of 7 + 3 * 2?', options: ['13', '20', '17', '10'], correctAnswer: '13', chapterId: 'math2' },
    { id: 11, question: 'What is the perimeter of a rectangle with length 5 and width 3?', options: ['8', '12', '16', '15'], correctAnswer: '16', chapterId: 'math3' },
    { id: 12, question: 'What is 1/4 expressed as a decimal?', options: ['0.25', '0.4', '0.75', '0.5'], correctAnswer: '0.25', chapterId: 'math3' },
    { id: 13, question: 'What is the largest prime number less than 20?', options: ['17', '18', '19', '20'], correctAnswer: '19', chapterId: 'math3' },
    { id: 14, question: 'What is the value of x in the equation 2x + 5 = 15?', options: ['5', '7', '8', '10'], correctAnswer: '5', chapterId: 'math3' },
    { id: 15, question: 'What is the mode of the numbers: 2, 3, 3, 4, 5, 5, 5, 6?', options: ['3', '4', '5', '6'], correctAnswer: '5', chapterId: 'math3' },
  ],
  Science: [
    { id: 1, question: 'What is the chemical symbol for water?', options: ['H2O', 'O2', 'CO2', 'NaCl'], correctAnswer: 'H2O', chapterId: 'sci1' },
    { id: 2, question: 'What planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Mars', chapterId: 'sci1' },
    { id: 3, question: 'What is the largest organ in the human body?', options: ['Heart', 'Brain', 'Liver', 'Skin'], correctAnswer: 'Skin', chapterId: 'sci1' },
    { id: 4, question: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correctAnswer: 'Au', chapterId: 'sci1' },
    { id: 5, question: 'Which of these is not a state of matter?', options: ['Solid', 'Liquid', 'Gas', 'Energy'], correctAnswer: 'Energy', chapterId: 'sci1' },
    { id: 6, question: 'What is the closest star to Earth?', options: ['Proxima Centauri', 'Alpha Centauri', 'Sirius', 'The Sun'], correctAnswer: 'The Sun', chapterId: 'sci1' },
    { id: 7, question: 'What is the speed of light in vacuum?', options: ['299,792 km/s', '300,000 km/s', '301,000 km/s', '310,000 km/s'], correctAnswer: '299,792 km/s', chapterId: 'sci2' },
    { id: 8, question: 'What is the hardest natural substance on Earth?', options: ['Gold', 'Iron', 'Diamond', 'Quartz'], correctAnswer: 'Diamond', chapterId: 'sci2' },
    { id: 9, question: 'Which of the following is not a greenhouse gas?', options: ['Carbon dioxide', 'Methane', 'Water vapor', 'Nitrogen'], correctAnswer: 'Nitrogen', chapterId: 'sci2' },
    { id: 10, question: 'What is the largest planet in our solar system?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Jupiter', chapterId: 'sci2' },
    { id: 11, question: 'What is the chemical symbol for oxygen?', options: ['O', 'O2', 'Ox', 'Og'], correctAnswer: 'O', chapterId: 'sci3' },
    { id: 12, question: 'Which of these animals is not a mammal?', options: ['Dolphin', 'Bat', 'Whale', 'Snake'], correctAnswer: 'Snake', chapterId: 'sci3' },
    { id: 13, question: 'What is the process by which plants make their own food?', options: ['Photosynthesis', 'Respiration', 'Fermentation', 'Digestion'], correctAnswer: 'Photosynthesis', chapterId: 'sci3' },
    { id: 14, question: 'What is the smallest unit of matter?', options: ['Atom', 'Molecule', 'Cell', 'Electron'], correctAnswer: 'Atom', chapterId: 'sci3' },
    { id: 15, question: 'Which planet is known as the "Blue Planet"?', options: ['Mars', 'Venus', 'Earth', 'Neptune'], correctAnswer: 'Earth', chapterId: 'sci3' },
  ],
  History: [
    { id: 1, question: 'In which year did World War II end?', options: ['1943', '1945', '1947', '1950'], correctAnswer: '1945', chapterId: 'hist1' },
    { id: 2, question: 'Who was the first President of the United States?', options: ['Thomas Jefferson', 'John Adams', 'George Washington', 'Benjamin Franklin'], correctAnswer: 'George Washington', chapterId: 'hist1' },
    { id: 3, question: 'Which ancient wonder was located in Alexandria?', options: ['Hanging Gardens', 'Colossus', 'Lighthouse', 'Great Pyramid'], correctAnswer: 'Lighthouse', chapterId: 'hist1' },
    { id: 4, question: 'In which year did the French Revolution begin?', options: ['1769', '1779', '1789', '1799'], correctAnswer: '1789', chapterId: 'hist1' },
    { id: 5, question: 'Who was the first woman to fly solo across the Atlantic?', options: ['Amelia Earhart', 'Bessie Coleman', 'Harriet Quimby', 'Jacqueline Cochran'], correctAnswer: 'Amelia Earhart', chapterId: 'hist1' },
    { id: 6, question: 'Which empire was ruled by Genghis Khan?', options: ['Roman Empire', 'Ottoman Empire', 'Mongol Empire', 'Byzantine Empire'], correctAnswer: 'Mongol Empire', chapterId: 'hist2' },
    { id: 7, question: 'In which year did the Berlin Wall fall?', options: ['1987', '1989', '1991', '1993'], correctAnswer: '1989', chapterId: 'hist2' },
    { id: 8, question: 'Who wrote the Declaration of Independence?', options: ['George Washington', 'Thomas Jefferson', 'Benjamin Franklin', 'John Adams'], correctAnswer: 'Thomas Jefferson', chapterId: 'hist2' },
    { id: 9, question: 'Which country was NOT part of the Allied Powers during World War II?', options: ['United States', 'Soviet Union', 'United Kingdom', 'Japan'], correctAnswer: 'Japan', chapterId: 'hist2' },
    { id: 10, question: 'In which year did Christopher Columbus first reach the Americas?', options: ['1492', '1500', '1510', '1520'], correctAnswer: '1492', chapterId: 'hist2' },
    { id: 11, question: 'Who was the first Emperor of Rome?', options: ['Julius Caesar', 'Augustus', 'Nero', 'Constantine'], correctAnswer: 'Augustus', chapterId: 'hist3' },
    { id: 12, question: 'Which civilization built the Machu Picchu complex in Peru?', options: ['Aztec', 'Maya', 'Inca', 'Olmec'], correctAnswer: 'Inca', chapterId: 'hist3' },
    { id: 13, question: 'Who was the leader of the Soviet Union during the Cuban Missile Crisis?', options: ['Joseph Stalin', 'Vladimir Lenin', 'Nikita Khrushchev', 'Leonid Brezhnev'], correctAnswer: 'Nikita Khrushchev', chapterId: 'hist3' },
    { id: 14, question: 'In which year did the American Civil War begin?', options: ['1861', '1865', '1870', '1875'], correctAnswer: '1861', chapterId: 'hist3' },
    { id: 15, question: 'Who was the first woman to win a Nobel Prize?', options: ['Marie Curie', 'Mother Teresa', 'Jane Addams', 'Barbara McClintock'], correctAnswer: 'Marie Curie', chapterId: 'hist3' },
  ],
};

const QUESTIONS_PER_PAGE = 10;

const CustomProgressBar: React.FC<{ totalQuestions: number; answeredQuestions: number }> = ({
  totalQuestions,
  answeredQuestions,
}) => {
  return (
    <View style={styles.customProgressBar}>
      {Array.from({ length: totalQuestions }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressSegment,
            index < answeredQuestions ? styles.answeredSegment : styles.unansweredSegment,
          ]}
        />
      ))}
    </View>
  );
};

// Add this helper function at the top of the file, outside of the component
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const MCQScreen: React.FC<MCQScreenProps> = ({ navigation, route }) => {
  const { subjects, selectedChapters, blacklistedQuestions } = route.params;

  // Use useMemo to memoize the shuffled questions
  const subjectQuestions = React.useMemo(() => {
    const getQuestionsFromChapters = () => {
      const allQuestions = subjects.flatMap(subject => questions[subject] || []);
      const selectedQuestions = allQuestions.filter(question => 
        selectedChapters.includes(question.chapterId) && !blacklistedQuestions.includes(question.id)
      );
      
      // Randomly select questions if there are more than 15
      if (selectedQuestions.length > 15) {
        return shuffleArray(selectedQuestions).slice(0, 15);
      }
      
      return selectedQuestions;
    };

    return getQuestionsFromChapters();
  }, [subjects, selectedChapters, blacklistedQuestions]); // Dependencies for useMemo

  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [remainingTime, setRemainingTime] = useState(subjectQuestions.length * 60); // 1 minute per question
  const [modalVisible, setModalVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());
  const [quizDuration, setQuizDuration] = useState(0);
  const [showStartModal, setShowStartModal] = useState(true);
  const [examStarted, setExamStarted] = useState(false);

  const totalPages = Math.ceil(subjectQuestions.length / QUESTIONS_PER_PAGE);

  useEffect(() => {
    if (examStarted) {
      setStartTime(Date.now());
      // Start the timer only when the exam has started
      let timer: ReturnType<typeof setInterval>;
      if (timerActive) {
        timer = setInterval(() => {
          setRemainingTime(prev => {
            if (prev > 0) {
              return prev - 1;
            } else {
              clearInterval(timer);
              handleAutoSubmit();
              return 0;
            }
          });
        }, 1000);
      }

      return () => {
        if (timer) clearInterval(timer);
      };
    }
  }, [examStarted, timerActive]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOptionSelect = (questionId: number, option: string) => {
    if (!submitted) {
      setSelectedAnswers(prev => {
        if (prev[questionId] === option) {
          // If the same option is clicked again, deselect it
          const { [questionId]: _, ...rest } = prev;
          return rest;
        } else {
          // Otherwise, select the new option
          return { ...prev, [questionId]: option };
        }
      });
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    subjectQuestions.forEach(question => {
      const selectedAnswer = selectedAnswers[question.id];
      if (selectedAnswer === question.correctAnswer) {
        totalScore += 4;
      } else if (selectedAnswer && selectedAnswer !== question.correctAnswer) {
        totalScore -= 1;
      }
      // If no answer is selected, score remains unchanged (implicitly +0)
    });
    return totalScore;
  };

  const calculateEstimatedScore = () => {
    return Object.keys(selectedAnswers).length * 4;
  };

  const handleAutoSubmit = () => {
    setSubmitted(true);
    setTimerActive(false);
    const finalScore = calculateScore();
    setScore(finalScore);
    setQuizDuration((Date.now() - startTime) / 1000); // Set quiz duration in seconds
    setShowResultModal(true);
  };

  const handleSubmit = () => {
    const estimatedScore = calculateEstimatedScore();
    setModalVisible(true);
    setScore(estimatedScore); // Set the estimated score
  };

  const handleApprove = () => {
    setSubmitted(true);
    setTimerActive(false);
    setModalVisible(false);
    const finalScore = calculateScore();
    setScore(finalScore); // Set the actual score
    setQuizDuration((Date.now() - startTime) / 1000);
    setShowResultModal(true);
  };

  const handleViewResults = () => {
    setShowResultModal(true);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = subjectQuestions.length - answeredCount;

  const calculateProgress = () => {
    return Object.keys(selectedAnswers).length / subjectQuestions.length;
  };

  const calculateResults = () => {
    let correctCount = 0;
    let incorrectCount = 0;
    let unselectedCount = 0;

    subjectQuestions.forEach(question => {
      const selectedAnswer = selectedAnswers[question.id];
      if (!selectedAnswer) {
        unselectedCount++;
      } else if (selectedAnswer === question.correctAnswer) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const averageTimePerQuestion = quizDuration / subjectQuestions.length;

    return {
      correctCount,
      incorrectCount,
      unselectedCount,
      averageTimePerQuestion: averageTimePerQuestion.toFixed(2),
    };
  };

  const renderQuestion = ({ item, index }: { item: Question; index: number }) => (
    <View style={styles.questionCard} key={`question-${index}`}>
      <Text style={styles.questionText}>{`${index + 1}. ${item.question}`}</Text>
      {item.options.map((option, optionIndex) => (
        <TouchableOpacity
          key={`question-${index}-option-${optionIndex}`}
          style={[
            styles.optionButton,
            selectedAnswers[item.id] === option && styles.selectedOptionButton,
            submitted && option === item.correctAnswer && styles.correctOptionButton,
            submitted && selectedAnswers[item.id] === option && selectedAnswers[item.id] !== item.correctAnswer && styles.incorrectOptionButton,
          ]}
          onPress={() => handleOptionSelect(item.id, option)}
          disabled={submitted}
        >
          <Text
            style={[
              styles.optionText,
              selectedAnswers[item.id] === option && styles.selectedOptionText,
              submitted && option === item.correctAnswer && styles.correctOptionText,
              submitted && selectedAnswers[item.id] === option && selectedAnswers[item.id] !== item.correctAnswer && styles.incorrectOptionText,
            ]}
          >
            {`${String.fromCharCode(65 + optionIndex)}. ${option}`}
          </Text>
          {submitted && selectedAnswers[item.id] === option && option === item.correctAnswer && (
            <AntIcon name="check" size={24} color="#ffffff" style={styles.tickIcon} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderResultModal = () => {
    const { correctCount, incorrectCount, unselectedCount, averageTimePerQuestion } = calculateResults();

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showResultModal}
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.resultModalContainer}>
          <View style={styles.resultModalContent}>
            <Text style={styles.resultModalTitle}>Quiz Completed!</Text>
            <View style={styles.resultScoreContainer}>
              <Text style={styles.resultScoreText}>{score}</Text>
              <Text style={styles.resultScoreMaxText}>/ {subjectQuestions.length * 4}</Text>
            </View>
            <View style={styles.resultStatsContainer}>
              <View style={styles.resultStatItem}>
                <Text style={styles.resultStatLabel}>Correct</Text>
                <Text style={styles.resultStatValue}>{correctCount}</Text>
              </View>
              <View style={styles.resultStatItem}>
                <Text style={styles.resultStatLabel}>Incorrect</Text>
                <Text style={styles.resultStatValue}>{incorrectCount}</Text>
              </View>
              <View style={styles.resultStatItem}>
                <Text style={styles.resultStatLabel}>Unselected</Text>
                <Text style={styles.resultStatValue}>{unselectedCount}</Text>
              </View>
            </View>
            <View style={styles.resultStatsContainer}>
              <View style={styles.resultStatItem}>
                <Text style={styles.resultStatLabel}>Accuracy</Text>
                <Text style={styles.resultStatValue}>
                  {((correctCount / subjectQuestions.length) * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.resultStatItem}>
                <Text style={styles.resultStatLabel}>Avg. Time/Q</Text>
                <Text style={styles.resultStatValue}>{averageTimePerQuestion}s</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.resultModalButton}
              onPress={() => setShowResultModal(false)}
            >
              <Text style={styles.resultModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const handleStartExam = () => {
    setShowStartModal(false);
    setExamStarted(true);
  };

  const renderStartModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showStartModal}
      onRequestClose={() => navigation.goBack()}
    >
      <View style={styles.startModalContainer}>
        <View style={styles.startModalContent}>
          <Text style={styles.startModalTitle}>Exam Rules</Text>
          <Text style={styles.startModalText}>• This is a 15-minute exam</Text>
          <Text style={styles.startModalText}>• There are {subjectQuestions.length} questions</Text>
          <Text style={styles.startModalText}>• Each question carries 4 marks</Text>
          <Text style={styles.startModalText}>• Wrong selection: -1 mark</Text>
          <Text style={styles.startModalText}>• Unselected: 0 marks</Text>
          <View style={styles.startModalButtonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartExam}
            >
              <Text style={styles.startButtonText}>Start Exam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderStartModal()}
      {!examStarted && (
        <View style={styles.fadedBackgroundContainer}>
          {subjectQuestions.map((question, index) => (
            <View key={`faded-question-${index}`} style={styles.fadedQuestionCard}>
              <Text style={styles.fadedQuestionText}>{`${index + 1}. ${question.question}`}</Text>
              {question.options.map((option, optionIndex) => (
                <View key={`faded-question-${index}-option-${optionIndex}`} style={styles.fadedOptionButton}>
                  <Text style={styles.fadedOptionText}>{`${String.fromCharCode(65 + optionIndex)}. ${option}`}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
      {examStarted && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <AntIcon name="arrow-left" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>MCQ Exam</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Time remaining: {formatTime(remainingTime)}</Text>
            <Text style={styles.infoText}>Total Questions: {subjectQuestions.length}</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <CustomProgressBar
              totalQuestions={subjectQuestions.length}
              answeredQuestions={Object.keys(selectedAnswers).length}
            />
          </View>

          <FlatList
            data={subjectQuestions}
            renderItem={renderQuestion}
            keyExtractor={(item, index) => `question-${index}`}
            contentContainerStyle={styles.questionList}
          />

          <View style={styles.bottomContainer}>
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
                  onPress={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <Text style={styles.paginationButtonText}>Previous</Text>
                </TouchableOpacity>
                <Text style={styles.pageIndicator}>{`${currentPage} / ${totalPages}`}</Text>
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
                  onPress={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <Text style={styles.paginationButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.submitButton, submitted && styles.viewResultsButton]} 
              onPress={submitted ? handleViewResults : handleSubmit}
            >
              <Text style={styles.submitButtonText}>
                {submitted ? 'View Results' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Confirm Submission</Text>
                <Text style={styles.modalText}>Time remaining: {formatTime(remainingTime)}</Text>
                <Text style={styles.modalText}>Answered: {answeredCount}</Text>
                <Text style={styles.modalText}>Unanswered: {unansweredCount}</Text>
                <Text style={styles.modalText}>Estimated Score: {calculateEstimatedScore()} out of {subjectQuestions.length * 4}</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.approveButton]} onPress={handleApprove}>
                    <Text style={[styles.modalButtonText, styles.approveButtonText]}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {renderResultModal()}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#001529',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginHorizontal: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  questionList: {
    padding: 20,
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    color: '#001529',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  tickIcon: {
    marginLeft: 10,
  },
  selectedOptionButton: {
    backgroundColor: '#001529',
  },
  correctOptionButton: {
    backgroundColor: '#52c41a',
  },
  incorrectOptionButton: {
    backgroundColor: '#f5222d',
  },
  optionText: {
    color: '#001529',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#ffffff',
  },
  correctOptionText: {
    color: '#ffffff',
  },
  incorrectOptionText: {
    color: '#ffffff',
  },
  bottomContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  paginationButton: {
    backgroundColor: '#001529',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
  },
  paginationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pageIndicator: {
    fontSize: 14,
    color: '#001529',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#001529',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  viewResultsButton: {
    backgroundColor: '#001529',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
  },
  approveButton: {
    backgroundColor: '#001529',
    marginLeft: 10,
  },
  approveButtonText: {
    color: 'white',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timerText: {
    fontSize: 16,
    color: '#001529',
  },
  progressBarContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  customProgressBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressSegment: {
    flex: 1,
    marginHorizontal: 1,
  },
  answeredSegment: {
    backgroundColor: '#001529',
  },
  unansweredSegment: {
    backgroundColor: '#d9d9d9',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#001529',
  },
  resultModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  resultModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: Dimensions.get('window').width * 0.9,
    maxWidth: 400,
  },
  resultModalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 20,
  },
  resultScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 30,
  },
  resultScoreText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#52c41a',
  },
  resultScoreMaxText: {
    fontSize: 24,
    color: '#8c8c8c',
    marginLeft: 5,
  },
  resultStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  resultStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  resultStatLabel: {
    fontSize: 14,
    color: '#8c8c8c',
    marginBottom: 5,
  },
  resultStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
  },
  resultModalButton: {
    backgroundColor: '#001529',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  resultModalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  startModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  startModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 20,
  },
  startModalText: {
    fontSize: 16,
    color: '#001529',
    marginBottom: 10,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  startModalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f5222d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#001529',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fadedBackgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    opacity: 0.1,
  },
  fadedQuestionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  fadedQuestionText: {
    fontSize: 18,
    marginBottom: 10,
  },
  fadedOptionButton: {
    backgroundColor: '#f0f2f5',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  fadedOptionText: {
    fontSize: 16,
  },
});


export default MCQScreen;
