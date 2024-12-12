import { useEffect, useState } from 'react';
import STATUS from '../../utils/STATUS';
import { type Timer, useTimerContext } from '../../utils/context';
import { replaceTimerInQueue, secToMin, strTo10Digits, timeToSec } from '../../utils/helpers';
import DisplayWindow from '../generic/DisplayWindow';
import InputField from '../generic/Input';
import InputFieldsContainer from '../generic/InputFieldsContainer';
import TimerContainer from '../generic/TimerContainer';

export interface TimerComponentProps {
    timer?: Timer;
    close?: () => void;
}

const Countdown: React.FC<TimerComponentProps> = ({ timer, close }) => {
    const { running, timersQueue, addTimerToQueue, setTimersToQueue } = useTimerContext();

    const [min, setMin] = useState(0);
    const [sec, setSec] = useState(0);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (!timer) return;

        const { expectedTime, description } = timer;

        if (expectedTime) {
            const { min, sec } = secToMin(expectedTime);
            setMin(min);
            setSec(sec);
        }

        if (description) setDescription(description);
    }, [timer]);

    // Handle minute change
    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMin(strTo10Digits(e.target.value));
    };

    // Handle second change (restricting to 0-59)
    const handleSecondChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const seconds = strTo10Digits(e.target.value);
        setSec(seconds > 59 ? 59 : seconds);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.target.value);
    };

    const addTimer = () => {
        const activeTime = timeToSec(min, sec);

        if (!activeTime) return;

        const timer: Timer = {
            id: new Date().valueOf().toString(),
            mode: STATUS.TimerTypes.COUNTDOWN,
            expectedTime: activeTime,
            status: STATUS.TimerStatuses.READY,
            passedTime: 0,
            round: 1,
            passedRound: 0,
            restTime: 0,
            isResting: false,
            description,
        };

        addTimerToQueue(timer);
    };

    const saveTimer = () => {
        const activeTime = timeToSec(min, sec);

        if (!activeTime || !timer) return;

        const newTimer: Timer = { ...timer, expectedTime: activeTime, description: description };
        setTimersToQueue(replaceTimerInQueue(timersQueue, newTimer));

        if (close) close();
    };

    return (
        <TimerContainer>
            <DisplayWindow time={timeToSec(min, sec)} />
            <InputFieldsContainer>
                <InputField value={min} onChange={handleMinuteChange} placeholder="Min:" min={0} />
                <InputField value={sec} onChange={handleSecondChange} placeholder="Sec:" min={0} max={59} />
            </InputFieldsContainer>
            <InputFieldsContainer>
                <InputField value={description} onChange={handleDescriptionChange} placeholder="Description:" inputStyle={{ width: '180px' }} type="text" />
            </InputFieldsContainer>
            <button onClick={timer ? saveTimer : addTimer} disabled={running}>
                {timer ? 'Save' : 'Add Timer'}
            </button>
        </TimerContainer>
    );
};

export default Countdown;
