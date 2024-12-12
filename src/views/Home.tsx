import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import WorkoutDisplay from '../components/generic/WorkoutDisplay';
import TimerEditModal from '../components/modals/TimerEditModal';
import STATUS from '../utils/STATUS';
import { type Timer, useTimerContext } from '../utils/context';

export const StyledQueueContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
`;

const defaultTimer: Timer = {
    id: 'test',
    expectedTime: 0,
    restTime: 0,
    round: 0,
    passedTime: 0,
    passedRound: 0,
    isResting: false,
    description: '',
};

const Home = () => {
    const navigate = useNavigate();

    const { time, running, timersQueue, activeTimerIndex, startQueue, stopQueue, resetQueue, forwardQueue, removeTimerFromQueue, setTimersToQueue } = useTimerContext();

    const [searchParams] = useSearchParams();
    const queueStr = searchParams.get('queue');
    const activeStr = searchParams.get('active');
    const timeStr = searchParams.get('time');

    useEffect(() => {
        if (queueStr) {
            localStorage.setItem(STATUS.StorageKeys.QUEUE, queueStr);
        }
    }, [queueStr]);

    useEffect(() => {
        if (activeStr) {
            localStorage.setItem(STATUS.StorageKeys.ACTIVE_TIMER_INDEX, activeStr);
        }
    }, [activeStr]);

    useEffect(() => {
        if (timeStr) {
            localStorage.setItem(STATUS.StorageKeys.TIME, timeStr);
        }
    }, [timeStr]);

    const [isModalOpen, setModalOpen] = useState(false);
    const [activeId, setActiveId] = useState<string | null>();
    const [selectedTimerIndexForEditing, setTimerIndexForEditing] = useState(-1);

    const items = useMemo(() => timersQueue?.map(({ id }) => id), [timersQueue]);

    const selectedTimerForDragging = useMemo(() => {
        if (!activeId) {
            return null;
        }
        return timersQueue.find(({ id }) => id === activeId);
    }, [activeId, timersQueue]);

    // Calculate total time based on the timers in the queue
    const totalTimeInSeconds = useMemo(() => timersQueue.reduce((total, timer) => total + (timer.expectedTime + timer.restTime) * timer.round, 0), [timersQueue]);

    const openModal = (index: number) => {
        setModalOpen(true);
        setTimerIndexForEditing(index);
    };

    const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = items.indexOf(active.id as string);
            const newIndex = items.indexOf(over?.id as string);
            if (timersQueue[newIndex].status === STATUS.TimerStatuses.READY) {
                setTimersToQueue(arrayMove(timersQueue, oldIndex, newIndex));
            }
        }

        setActiveId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    const saveQueue = () => {
        if (timersQueue.length === 0) return;

        let newURL = '/?queue=' + JSON.stringify(timersQueue);
        if (activeTimerIndex !== -1) newURL += '&active=' + activeTimerIndex.toString();
        newURL += '&time=' + time.toString();

        navigate(newURL);
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '12px' }}>
                <button onClick={startQueue} disabled={time > 0 || timersQueue.length === 0}>
                    Start Queue
                </button>
                <button onClick={stopQueue} disabled={time === 0 || time === totalTimeInSeconds}>
                    {running ? 'Pause Queue' : 'Resume Queue'}
                </button>
                <button onClick={forwardQueue} disabled={time === 0 || time === totalTimeInSeconds}>
                    Forward
                </button>
                <button onClick={resetQueue} disabled={timersQueue.length === 0 || time === 0}>
                    Reset Queue
                </button>
                <button onClick={saveQueue} disabled={timersQueue.length === 0}>
                    Save Queue
                </button>
            </div>
            <div>Total Time: {totalTimeInSeconds} seconds</div>
            <div>Passed Time: {time} seconds</div>
            <div style={{ width: '90%', height: '12px', borderRadius: '6px', backgroundColor: '#e0e0e0', position: 'relative', margin: '12px auto 32px' }}>
                <div
                    style={{
                        position: 'absolute',
                        height: '12px',
                        borderRadius: '6px',
                        backgroundColor: '#777777',
                        left: 0,
                        maxWidth: '100%',
                        width: !totalTimeInSeconds ? 0 : `${(time / totalTimeInSeconds) * 100}%`,
                    }}
                />
            </div>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart} onDragCancel={handleDragCancel} collisionDetection={closestCenter}>
                <StyledQueueContainer>
                    <SortableContext items={items}>
                        {timersQueue.map((timer, index) => (
                            <WorkoutDisplay
                                transformable={activeId ? true : false}
                                timer={timer}
                                running={running}
                                index={index}
                                key={index}
                                activeIndex={activeTimerIndex}
                                removeTimer={() => removeTimerFromQueue(index)}
                                editTimer={() => openModal(index)}
                            />
                        ))}
                    </SortableContext>
                </StyledQueueContainer>
                <DragOverlay>{activeId != null && <WorkoutDisplay timer={selectedTimerForDragging || defaultTimer} running={running} visibleDraggingCursor={true} />}</DragOverlay>
            </DndContext>
            <TimerEditModal isOpen={isModalOpen} timer={timersQueue[selectedTimerIndexForEditing]} onClose={() => setModalOpen(false)} />
        </div>
    );
};

export default Home;
