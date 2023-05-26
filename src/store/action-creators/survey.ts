import { isSetOfOptions } from './../../helper/index';
import { store } from './../index';
import {
    IAnswerToQuestion,
    IQuestion,
    ISurveyInfo,
    QuestionType,
    SurveyAction,
    SurveyActionTypes
} from './../../types/survey';
import { Dispatch } from "redux";
import { RootState } from '../reducers';
import { isMatches, isOption, isTextAnswer } from '../../helper';
import { answers, quiz } from '../../data/data';

export const updateAnswersToQuestions = (answerToQuestion: IAnswerToQuestion) => {
    return async (dispatch: Dispatch<SurveyAction>, getState: () => RootState) => {
        const answersToQuestions = getState().survey.answersToQuestions;
        const answeredQuestions = answersToQuestions.map(answerToQuestion => answerToQuestion.question);
        const currentQuestion = answerToQuestion.question;

        /* 
            We are checking questions that user has already answered and we try to find among
            these questions current question, that user has answered just now. If we successfully
            find this question, this means that user has given the answer to this question
            not for the first time. We must change the answer to this question.
            To change the answer to a question, we need to define id of this question.
            The function findIndex returns -1, if current question is 
            not in list of questions that user has already answered.
        */

        const index = answeredQuestions.findIndex(answeredQuestion =>
            JSON.stringify(answeredQuestion) === JSON.stringify(currentQuestion)
        );

        if (index === -1) {
            dispatch({
                type: SurveyActionTypes.UPDATE_ANSWERS_TO_QUESTIONS,
                payload: [...answersToQuestions, {
                    question: currentQuestion,
                    answer: answerToQuestion.answer
                }]
            })

        } else {
            answersToQuestions[index] = answerToQuestion;

            dispatch({
                type: SurveyActionTypes.UPDATE_ANSWERS_TO_QUESTIONS,
                payload: answersToQuestions
            })
        }
    }
}

export const finishSurvey = (surveyId: number) => {
    return async (dispatch: Dispatch<SurveyAction>, getState: () => RootState) => {
        console.log(getState().survey.answersToQuestions);
        console.log(`User has finished survey ${surveyId}`);
        console.log('Score: ' + scoreTest());
    }
}

export const updateQuestions = (questions: IQuestion[]) => {
    return async (dispatch: Dispatch<SurveyAction>) => {
        dispatch({
            type: SurveyActionTypes.UPDATE_QUESTIONS,
            payload: questions
        })
    }
}

export const updateQuestion = (question: IQuestion) => {
    return async (dispatch: Dispatch<SurveyAction>, getState: () => RootState) => {
        const updatedQuestions = [...getState().survey.questions];
        updatedQuestions[question.id - 1] = question;

        dispatch({
            type: SurveyActionTypes.UPDATE_QUESTIONS,
            payload: updatedQuestions
        })
    }
}

export const updateSurveyInfo = (surveyInfo: ISurveyInfo) => {
    return async (dispatch: Dispatch<SurveyAction>) => {
        dispatch({
            type: SurveyActionTypes.UPDATE_SURVEY_INFO,
            payload: surveyInfo
        })
    }
}

export const updateQuestionType = (question: IQuestion, type: QuestionType) => {
    return async (dispatch: Dispatch<SurveyAction>, getState: () => RootState) => {
        question.type = type;

        if (
            question.type === QuestionType.OneChoice ||
            question.type === QuestionType.MultipleChoice
        ) {
            if (question.hasOwnProperty('correctAnswer')) {
                delete question.correctAnswer;
            }

            const initialOptions = [{ id: 1, label: "", score: 0 }]
            question.options = initialOptions;
        } else if (
            question.type === QuestionType.ShortTextField ||
            question.type === QuestionType.DetailedTextField
        ) {
            if (question.hasOwnProperty('options')) {
                delete question.options;
            }

            const initialCorrectAnswer = { text: '', score: 0 }
            question.correctAnswer = initialCorrectAnswer;
        } else if (
            question.type === QuestionType.Matchmaking
        ) {
            if (question.hasOwnProperty('correctAnswer')) {
                delete question.correctAnswer;
            }

            const initialLeftList = [{ id: 1, label: '', relatedOptionId: 1, score: 1 }]
            const initialRightList = [{ id: 1, label: '' }];
            
            question.options = {
                leftList: initialLeftList, 
                rightList: initialRightList
            };
        }

        const updatedQuestions = [...getState().survey.questions];
        updatedQuestions[question.id - 1] = question;

        dispatch({
            type: SurveyActionTypes.UPDATE_QUESTIONS,
            payload: updatedQuestions
        })
    }
}

export const loadAnswersToQuestions = (surveyId: number) => {
    return async (dispatch: Dispatch<SurveyAction>, getState: () => RootState) => {
        console.log(`Answers to Questions from Survey ${surveyId} have been loaded`);

        dispatch({
            type: SurveyActionTypes.UPDATE_ANSWERS_TO_QUESTIONS,
            payload: answers
        })
    }
}

export const scoreTest = (): number => {
    const answersToQuestions = store.getState().survey.answersToQuestions;
    let totalScore: number = 0;

    answersToQuestions.forEach(answerToQuestion => {
        const answer = answerToQuestion.answer;

        if (isOption(answer) || isTextAnswer(answer)) {
            const score = answer.score ?? 0;
            totalScore += score;
        } else if (isMatches(answer)) {
            answer.leftList.forEach(option => {
                const score = option.score ?? 0;
                totalScore += score;
            })
        } else if (isSetOfOptions(answer)) {
            answer.forEach(option => {
                const score = option.score ?? 0;
                totalScore += score;
            })
        }
    })

    return totalScore;
}