import {setAppStatusAC} from '../../app/app-reducer';
import {AxiosResponse} from 'axios';
import {todolistsAPI, TodolistType} from '../../api/todolists-api';
import {handleServerNetworkErrorSagaWorker} from '../../utils/error-utils';
import {
    addTodolistAC,
    changeTodolistEntityStatusAC, changeTodolistTitleAC,
    removeTodolistAC,
    setTodolistsAC
} from './todolists-reducer';
import {put, call, takeEvery} from 'redux-saga/effects'

export function* fetchTodolistsWorkerSaga() {
    yield put(setAppStatusAC('loading'));

    try {
        const res: AxiosResponse<TodolistType[]> = yield call(todolistsAPI.getTodolists);
        yield put(setTodolistsAC(res.data));
        yield put(setAppStatusAC('succeeded'));
    } catch (error) {
        handleServerNetworkErrorSagaWorker(error);
    }
}

export const fetchTodolists = () => ({type: 'TODOLISTS/FETCH-TODOLIST'});


export function* removeTodolistWorkerSaga(action: ReturnType<typeof removeTodolistSagaAC>) {
    const todolistId = action.payload.todolistId;

    yield put(setAppStatusAC('loading'));
    yield put(changeTodolistEntityStatusAC(todolistId, 'loading'));

    const res = yield call(todolistsAPI.deleteTodolist, todolistId);

    yield put(removeTodolistAC(todolistId));
    yield put(setAppStatusAC('succeeded'));
}

export const removeTodolistSagaAC = (todolistId: string) => ({type: 'TODOLISTS/REMOVE-TODOLIST', payload: {todolistId}})

export function* addTodolistWorkerSaga(action: ReturnType<typeof addTodolistSagaAC>) {
    const title = action.payload.title;
    yield put(setAppStatusAC('loading'))

    const res = yield call(todolistsAPI.createTodolist, title);

    yield put(addTodolistAC(res.data.data.item))
    yield put(setAppStatusAC('succeeded'))
}

export const addTodolistSagaAC = (title: string) => ({type: 'TODOLISTS/ADD_TODOLIST', payload: {title}});

export function* changeTodolistTitleWorkerSaga(action: ReturnType<typeof changeTodolistSagaAC>) {
    const {title, id} = action.payload;
    yield put(setAppStatusAC('loading'))

    const res = yield call(todolistsAPI.updateTodolist, id, title);

    yield put(changeTodolistTitleAC(id, title))
    yield put(setAppStatusAC('succeeded'))
}

export const changeTodolistSagaAC = (id: string, title: string) => ({
    type: 'TODOLISTS/CHANGE_TODOLIST',
    payload: {title, id}
});

export function* todolistWatcherSaga() {
    yield takeEvery('TODOLISTS/FETCH-TODOLIST', fetchTodolistsWorkerSaga);
    yield takeEvery('TODOLISTS/REMOVE-TODOLIST', removeTodolistWorkerSaga);
    yield takeEvery('TODOLISTS/ADD_TODOLIST', addTodolistWorkerSaga);
    yield takeEvery('TODOLISTS/CHANGE_TODOLIST', changeTodolistTitleWorkerSaga);
}