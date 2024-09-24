import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, Alert, Modal, Dimensions } from 'react-native';
import { Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Question, questions } from './questions';

type MCQScreenProps = {
  navigation: StackNavigationProp<any, 'MCQ'>;
  route: RouteProp<{ params: { subjects: string[]; selectedChapters: string[]; blacklistedQuestions: number[] } }, 'params'>;
};



const QUESTIONS_PER_PAGE = 10;

const CustomProgressBar: React.FC<{ totalQuestions: number; answeredQuestions: number }> = ({
  totalQuestions,
  answeredQuestions,
}) => {
  const progress = (answeredQuestions / totalQuestions) * 100;

  return (
    <View style={styles.customProgressBar}>
      <View style={[styles.progressFill, { width: `${progress}%` }]} />
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

  const [subjectQuestions, setSubjectQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [remainingTime, setRemainingTime] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());
  const [quizDuration, setQuizDuration] = useState(0);
  const [showStartModal, setShowStartModal] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number | null>(null);

  const initialQuestions = useMemo(() => {
    const getQuestionsFromChapters = () => {
      const allQuestions = subjects.flatMap(subject => questions[subject] || []);
      const selectedQuestions = allQuestions.filter(question => 
        selectedChapters.includes(question.chapterId) && !blacklistedQuestions.includes(question.id)
      );
      return selectedQuestions;
    };

    return getQuestionsFromChapters();
  }, [subjects, selectedChapters, blacklistedQuestions]);

  useEffect(() => {
    setSubjectQuestions(initialQuestions);
  }, [initialQuestions]);

  const totalPages = Math.ceil(subjectQuestions.length / QUESTIONS_PER_PAGE);

  useEffect(() => {
    if (examStarted) {
      setStartTime(Date.now());
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
          const { [questionId]: _, ...rest } = prev;
          return rest;
        } else {
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

  const getCurrentPageQuestions = () => {
    const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const endIndex = startIndex + QUESTIONS_PER_PAGE;
    return subjectQuestions.slice(startIndex, endIndex);
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
    if (selectedQuestionCount) {
      setShowStartModal(false);
      setExamStarted(true);
      const shuffledQuestions = shuffleArray(initialQuestions).slice(0, selectedQuestionCount);
      setSubjectQuestions(shuffledQuestions);
      setRemainingTime(selectedQuestionCount * 60);
    } else {
      Alert.alert("Please select the number of questions");
    }
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
          <Text style={styles.startModalTitle}>Exam Setup</Text>
          <Text style={styles.startModalText}>Select the number of questions:</Text>
          <View style={styles.questionCountContainer}>
            {[30, 50, 90, 120, 150, 180].map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.questionCountButton,
                  selectedQuestionCount === count && styles.selectedQuestionCountButton,
                ]}
                onPress={() => setSelectedQuestionCount(count)}
              >
                <Text
                  style={[
                    styles.questionCountButtonText,
                    selectedQuestionCount === count && styles.selectedQuestionCountButtonText,
                  ]}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
              style={[styles.startButton, !selectedQuestionCount && styles.disabledButton]}
              onPress={handleStartExam}
              disabled={!selectedQuestionCount}
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
            data={getCurrentPageQuestions()}
            renderItem={renderQuestion}
            keyExtractor={(item, index) => `question-${index + (currentPage - 1) * QUESTIONS_PER_PAGE}`}
            contentContainerStyle={styles.questionList}
          />

          <View style={styles.bottomContainer}>
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
    height: 10,
    backgroundColor: '#d9d9d9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#001529',
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
  questionCountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  questionCountButton: {
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 5,
  },
  selectedQuestionCountButton: {
    backgroundColor: '#001529',
  },
  questionCountButtonText: {
    color: '#001529',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedQuestionCountButtonText: {
    color: '#ffffff',
  },
});

export default MCQScreen;
