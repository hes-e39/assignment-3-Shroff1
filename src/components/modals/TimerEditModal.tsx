import type React from 'react';
import styled from 'styled-components';
import STATUS from '../../utils/STATUS';
import type { Timer } from '../../utils/context';
import Modal from '../generic/Modal';
import Countdown from '../timers/Countdown';
import Stopwatch from '../timers/Stopwatch';
import Tabata from '../timers/Tabata';
import XY from '../timers/XY';

const StyledH2 = styled.h2`
  margin-top: 0px;
`;

interface TimerEditModalProps {
    isOpen: boolean;
    timer: Timer;
    onClose: () => void;
}

//Displays the timer based on the edit icon selected.
const TimerEditModal: React.FC<TimerEditModalProps> = ({ isOpen, timer, onClose }) => {
    if (!isOpen) return null;

    const renderBody = (timer: Timer) => {
        if (timer.mode === STATUS.TimerTypes.STOPWATCH) {
            return <Stopwatch timer={timer} close={onClose} />;
        } else if (timer.mode === STATUS.TimerTypes.COUNTDOWN) {
            return <Countdown timer={timer} close={onClose} />;
        } else if (timer.mode === STATUS.TimerTypes.XY) {
            return <XY timer={timer} close={onClose} />;
        } else if (timer.mode === STATUS.TimerTypes.TABATA) {
            return <Tabata timer={timer} close={onClose} />;
        }

        return null;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <StyledH2>Edit a timer</StyledH2>
            {renderBody(timer)}
        </Modal>
    );
};

export default TimerEditModal;
