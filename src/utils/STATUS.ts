import type { ValueOf } from 'type-fest';

const STATUS = {
    TimerTypes: {
        STOPWATCH: 'Stopwatch',
        COUNTDOWN: 'Countdown',
        XY: 'XY',
        TABATA: 'Tabata',
    },
    TimerStatuses: {
        PLAY: 'play',
        PAUSE: 'pause',
        COMPLETE: 'complete',
        READY: 'ready',
    },
    StorageKeys: {
        QUEUE: 'queue',
        TIME: 'time',
        RUNNING: 'running',
        ACTIVE_TIMER_INDEX: 'activeTimerIndex',
        COMPLETED_TIMERS: 'completedTimers',
    },
} as const;

type TimerType = ValueOf<typeof STATUS.TimerTypes>;
type TimerStatusType = ValueOf<typeof STATUS.TimerStatuses>;

export type { TimerType, TimerStatusType };

export default STATUS;
