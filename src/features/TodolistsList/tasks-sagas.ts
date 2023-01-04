import {setAppStatusAC} from '../../app/app-reducer';
import {AxiosResponse} from 'axios';
import {GetTasksResponse, ResponseType, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api';
import {addTaskAC, removeTaskAC, setTasksAC, UpdateDomainTaskModelType, updateTaskAC} from './tasks-reducer';
import { put, call, takeEvery, select} from 'redux-saga/effects'
import {handleServerAppErrorSagaWorker, handleServerNetworkErrorSagaWorker} from '../../utils/error-utils';
import {AppRootStateType} from '../../app/store';

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
            return handleServerAppErrorSagaWorker(res.data);
        }
    } catch (error) {
        return handleServerNetworkErrorSagaWorker(error)
    }
}

export const addTaskToTodolist = (title: string, todolistId: string) => ({
    type: 'TASKS/ADD-TASK-TO-TODOLIST',
    payload: {title, todolistId}
});


export function* updateTaskWorkerSaga(action: ReturnType<typeof updateTask>) {
    const {todolistId, taskId, domainModel} = action.payload
    const getItems = (state: AppRootStateType) => (state.tasks[todolistId].find(t => t.id === taskId));
    const task = yield select(getItems);
    if (!task) {
        console.warn('task not found in the state')
        return
    }

    const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...domainModel
    }
    try {
        const res: AxiosResponse<ResponseType<TaskType>> = yield call(todolistsAPI.updateTask, todolistId, taskId, apiModel)
        if (res.data.resultCode === 0) {
            yield put(updateTaskAC(taskId, domainModel, todolistId))
        } else {
           return handleServerAppErrorSagaWorker(res.data);
        }
    } catch (error) {
        return handleServerNetworkErrorSagaWorker(error);
    }
}

export const updateTask = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) => ({
    type: 'TASKS/UPDATE_TASK',
    payload: {todolistId, domainModel, taskId}
})

export function* tasksWatcherSaga() {
    yield takeEvery('TASKS/FETCH-TASKS', fetchTasksWorkerSaga);
    yield takeEvery( 'TASKS/REMOVE-TASK', removeTaskWorkerSaga);
    yield takeEvery( 'TASKS/ADD-TASK-TO-TODOLIST', addTaskWorkerSaga);
    yield takeEvery( 'TASKS/UPDATE_TASK', updateTaskWorkerSaga);
}