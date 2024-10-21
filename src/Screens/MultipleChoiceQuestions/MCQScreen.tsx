import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, FlatList, Alert, Modal, Dimensions, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Icon as AntIcon } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Question, questions } from './questions';
import { AntDesign } from '@expo/vector-icons';

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionOverview, setShowQuestionOverview] = useState(false);

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
    setQuizDuration((Date.now() - startTime) / 1000)
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
    setScore(finalScore);
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


  const handleNextQuestion = () => {
    if (currentQuestionIndex < subjectQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const toggleQuestionOverview = () => {
    setShowQuestionOverview(!showQuestionOverview);
  };

  const renderQuestion = () => {
    const question = subjectQuestions[currentQuestionIndex];
    return (
      <View style={styles.questionContainer}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{`${currentQuestionIndex + 1}. ${question.question}`}</Text>
          {question.options.map((option, optionIndex) => (
            <TouchableOpacity
              key={`question-${currentQuestionIndex}-option-${optionIndex}`}
              style={[
                styles.optionButton,
                selectedAnswers[question.id] === option && styles.selectedOptionButton,
                submitted && option === question.correctAnswer && styles.correctOptionButton,
                submitted && selectedAnswers[question.id] === option && selectedAnswers[question.id] !== question.correctAnswer && styles.incorrectOptionButton,
              ]}
              onPress={() => handleOptionSelect(question.id, option)}
              disabled={submitted}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedAnswers[question.id] === option && styles.selectedOptionText,
                  submitted && option === question.correctAnswer && styles.correctOptionText,
                  submitted && selectedAnswers[question.id] === option && selectedAnswers[question.id] !== question.correctAnswer && styles.incorrectOptionText,
                ]}
              >
                {`${String.fromCharCode(65 + optionIndex)}. ${option}`}
              </Text>
              {submitted && selectedAnswers[question.id] === option && option === question.correctAnswer && (
                <AntIcon name="check" size={24} color="#ffffff" style={styles.tickIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderQuestionOverview = () => {
    const subjectSections = subjects.reduce((acc, subject) => {
      acc[subject] = subjectQuestions.filter(q => q.subject === subject);
      return acc;
    }, {} as Record<string, Question[]>);

    let questionNumber = 1;
    const answeredCount = Object.keys(selectedAnswers).length;
    const totalCount = subjectQuestions.length;
    const unansweredCount = totalCount - answeredCount;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showQuestionOverview}
        onRequestClose={toggleQuestionOverview}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.questionOverviewContainerNew}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleNew}>Question Overview</Text>
              <TouchableOpacity onPress={toggleQuestionOverview}>
                <AntIcon name="close" size={24} color="#001529" />
              </TouchableOpacity>
            </View>
            <View style={styles.overviewSummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{totalCount}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: '#52c41a' }]}>{answeredCount}</Text>
                <Text style={styles.summaryLabel}>Answered</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: '#faad14' }]}>{unansweredCount}</Text>
                <Text style={styles.summaryLabel}>Unanswered</Text>
              </View>
            </View>
            <ScrollView style={styles.questionOverviewContentNew}>
              {subjects.map(subject => {
                const subjectQuestionCount = subjectSections[subject].length;
                if (subjectQuestionCount === 0) return null;
                return (
                  <View key={subject} style={styles.subjectSection}>
                    <Text style={styles.subjectTitleNew}>{subject} ({subjectQuestionCount})</Text>
                    <View style={styles.questionNumberContainer}>
                      {subjectSections[subject].map((question, index) => {
                        const currentQuestionNumber = questionNumber++;
                        return (
                          <TouchableOpacity
                            key={question.id}
                            style={[
                              styles.questionNumberButton,
                              subjectQuestions.indexOf(question) === currentQuestionIndex && styles.currentQuestionButton,
                            ].filter(Boolean)}
                            onPress={() => {
                              setCurrentQuestionIndex(subjectQuestions.indexOf(question));
                              toggleQuestionOverview();
                            }}
                          >
                            <Text style={[
                              styles.questionNumberText,
                              (subjectQuestions.indexOf(question) === currentQuestionIndex || selectedAnswers[question.id]) ? styles.activeQuestionNumberText : undefined
                            ]}>
                              {currentQuestionNumber}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

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
            <Text style={styles.resultModalTitleNew}>Quiz Completed!</Text>
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

      // Group questions by subject
      const questionsBySubject = subjects.reduce((acc, subject) => {
        acc[subject] = initialQuestions.filter(q => q.subject === subject && selectedChapters.includes(q.chapterId));
        return acc;
      }, {} as Record<string, Question[]>);

      let selectedQuestions: Question[] = [];

      // Select questions from each subject
      subjects.forEach(subject => {
        const subjectQuestions = shuffleArray(questionsBySubject[subject]);
        const questionsToSelect = Math.floor(selectedQuestionCount / subjects.length);
        selectedQuestions = [...selectedQuestions, ...subjectQuestions.slice(0, questionsToSelect)];
      });

      // If we don't have enough questions, fill with random questions from any subject
      while (selectedQuestions.length < selectedQuestionCount) {
        const remainingQuestions = initialQuestions.filter(q => !selectedQuestions.includes(q) && selectedChapters.includes(q.chapterId));
        if (remainingQuestions.length === 0) break;
        selectedQuestions.push(shuffleArray(remainingQuestions)[0]);
      }

      // Sort questions by subject order
      selectedQuestions.sort((a, b) => subjects.indexOf(a.subject) - subjects.indexOf(b.subject));

      setSubjectQuestions(selectedQuestions);
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
          <Text style={styles.startModalTitleNew}>Exam Setup</Text>
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
            <Text style={styles.infoText}>Total Questions: {subjectQuestions.length}</Text>
            <View style={styles.timeContainer}>
              <AntDesign name="clockcircleo" size={16} color="#001529" />
              <Text style={styles.timeText}>{formatTime(remainingTime)}</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <CustomProgressBar
              totalQuestions={subjectQuestions.length}
              answeredQuestions={Object.keys(selectedAnswers).length}
            />
          </View>

          {renderQuestion()}

          <View style={styles.bottomContainer}>
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={[styles.navigationButton, currentQuestionIndex === 0 && styles.disabledButton]}
                onPress={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <Text style={styles.navigationButtonText}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navigationButton, currentQuestionIndex === subjectQuestions.length - 1 && styles.disabledButton]}
                onPress={handleNextQuestion}
                disabled={currentQuestionIndex === subjectQuestions.length - 1}
              >
                <Text style={styles.navigationButtonText}>Next</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.submitContainer}>
              <TouchableOpacity 
                style={[styles.submitButton, submitted && styles.viewResultsButton]} 
                onPress={submitted ? handleViewResults : handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {submitted ? 'View Results' : 'Submit'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.overviewButton}
                onPress={toggleQuestionOverview}
              >
                <AntDesign name="appstore1" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitleNew}>Confirm Submission</Text>
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

          {renderQuestionOverview()}
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
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 500, // Add a max width to prevent the card from becoming too wide on larger screens
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
    marginBottom: 20,
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 5,
    padding: 15,
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
  modalTitleNew: {
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
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#001529',
    fontWeight: 'bold',
    marginLeft: 5,
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
  resultModalTitleNew: {
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
  startModalTitleNew: {
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
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  navigationButton: {
    backgroundColor: '#001529',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  navigationButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overviewButton: {
    backgroundColor: '#001529',
    padding: 12,
    borderRadius: 25,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  questionOverviewContainerNew: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
  },
  questionOverviewContentNew: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questionNumberContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  questionNumberButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  currentQuestionButton: {
    backgroundColor: '#1890ff',
  },
  answeredQuestionButton: {
    backgroundColor: '#52c41a',
  },
  questionNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
  },
  activeQuestionNumberText: {
    color: '#ffffff',
  },
  subjectSection: {
    marginBottom: 20,
  },
  subjectTitleNew: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 10,
    backgroundColor: '#f0f2f5',
    padding: 10,
    borderRadius: 5,
  },
  totalQuestionsText: {
    fontSize: 14,
    color: '#8c8c8c',
    marginTop: 5,
  },
  overviewSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#f0f2f5',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001529',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8c8c8c',
    marginTop: 5,
  },

  questionOverviewContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
  questionOverviewContent: {
    paddingHorizontal: 20,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001529',
    marginBottom: 10,
    backgroundColor: '#f0f2f5',
    padding: 10,
    borderRadius: 5,
  },
  submitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#001529',
    padding: 12,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
});


export default MCQScreen;