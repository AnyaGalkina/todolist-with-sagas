import {setAppStatusAC} from '../../app/app-reducer';
import {AxiosResponse} from 'axios';
import {GetTasksResponse, ResponseType, TaskType, todolistsAPI} from '../../api/todolists-api';
import {addTaskAC, removeTaskAC, setTasksAC} from './tasks-reducer';
import { put, call, takeEvery} from 'redux-saga/effects'
import {handleServerAppErrorSagaWorker, handleServerNetworkErrorSagaWorker} from '../../utils/error-utils';

export function* fetchTasksWorkerSaga(action: ReturnType<typeof fetchTasks>) {

    const todolistId = action.payload.todolistId;

    yield put(setAppStatusAC('loading'));

    const res: AxiosResponse<GetTasksResponse> = yield call(todolistsAPI.getTasks, todolistId);
    const tasks = res.data.items;

    yield put(setTasksAC(tasks, todolistId));
    yield put(setAppStatusAC('succeeded'));
}

export const fetchTasks = (todolistId: string) => ({type: 'TASKS/FETCH-TASKS', payload: {todolistId}});

export function* removeTaskWorkerSaga(action: ReturnType<typeof removeTaskFromTodolist>) {
    debugger
    const {todolistId, taskId} = action.payload
    const res = yield call(todolistsAPI.deleteTask, todolistId, taskId);

    yield put(removeTaskAC(taskId, todolistId));
}

export const removeTaskFromTodolist = (taskId: string, todolistId: string) => ({
    type: 'TASKS/REMOVE-TASK',
    payload: {taskId, todolistId}
});

export function* addTaskWorkerSaga(action: ReturnType<typeof addTaskToTodolist>) {
    const {title, todolistId} = action.payload;

    yield put(setAppStatusAC('loading'));

    try {
        const res: AxiosResponse<ResponseType<{ item: TaskType }>> = yield call(todolistsAPI.createTask, todolistId, title);
        if (res.data.resultCode === 0) {
            const task: TaskType = res.data.data.item

            yield put(addTaskAC(task))
            yield put(setAppStatusAC('succeeded'))
        } else {
            handleServerAppErrorSagaWorker(res.data);
        }
    } catch (error) {
        handleServerNetworkErrorSagaWorker(error)
    }
}

export const addTaskToTodolist = (title: string, todolistId: string) => ({
    type: 'TASKS/ADD-TASK-TO-TODOLIST',
    payload: {title, todolistId}
})

export function* tasksWatcherSaga() {
    yield takeEvery('TASKS/FETCH-TASKS', fetchTasksWorkerSaga);
    yield takeEvery( 'TASKS/REMOVE-TASK', removeTaskWorkerSaga);
}