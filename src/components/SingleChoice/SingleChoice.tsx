import { FC, useState } from 'react';
import { useActions } from '../../hooks/useActions';
import { IOption, IQuestion, QuestionType } from '../../types/survey';
import Radio from '../../UI/Radio/Radio';

interface SingleChoiceProps {
    id: number;
    options: IOption[];
    topic: string;
}

const SingleChoice: FC<SingleChoiceProps> = ({ id, options, topic}) => {

    const {updateAnswersQuestions} = useActions();
    const [selectedOptionId, setSelectedOptionId] = useState<Number>();

    const radioHandler = (event: React.ChangeEvent<HTMLInputElement>) => {

        const selectedOptionId = Number(event.target.value);
        
        setSelectedOptionId(selectedOptionId);

        const selectedOption = options.find(option => option.id === selectedOptionId);

        const question: IQuestion = {
            id,
            topic,
            options,
            type: QuestionType.OneChoice
        };

        const option: IOption = {
            id: selectedOptionId,
            label: selectedOption?.label || '',
            score: selectedOption?.score
        };

        updateAnswersQuestions({
            question,
            answer: option
        });
    }

    const renderOptions = () => {
        return options.map((option: IOption) =>
            <Radio
                key={option.id}
                id={option.id}
                label={option.label}
                onChangeHandler={radioHandler}
                checked={selectedOptionId === option.id}
            />
        )
    }

    return (
        <>
            {renderOptions()}
        </>
    );
}

export default SingleChoice;