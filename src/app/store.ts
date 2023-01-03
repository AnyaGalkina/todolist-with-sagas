import {tasksReducer} from '../features/TodolistsList/tasks-reducer';
import {todolistsReducer} from '../features/TodolistsList/todolists-reducer';
import {applyMiddleware, combineReducers, createStore} from 'redux'
import thunkMiddleware from 'redux-thunk'
import {appReducer} from './app-reducer'
import {authReducer} from '../features/Login/auth-reducer';
import createSagaMiddleware from 'redux-saga';
import {takeEvery} from 'redux-saga/effects'
import {addTaskWorkerSaga, fetchTasksWorkerSaga, removeTaskWorkerSaga,} from '../features/TodolistsList/tasks-sagas';
import {appWatcherSaga} from './app-sagas';
import {
    addTodolistWorkerSaga,
    changeTodolistTitleWorkerSaga,
    fetchTodolistsWorkerSaga,
    removeTodolistWorkerSaga
} from '../features/TodolistsList/todolists-sagas';
import {loginWorkerSaga, logoutWorkerSaga} from '../features/Login/auth-sagas';

// объединяя reducer-ы с помощью combineReducers,
// мы задаём структуру нашего единственного объекта-состояния
const rootReducer = combineReducers({
    tasks: tasksReducer,
    todolists: todolistsReducer,
    app: appReducer,
    auth: authReducer
})

const sagaMiddleware = createSagaMiddleware();

// непосредственно создаём store
export const store = createStore(rootReducer, applyMiddleware(thunkMiddleware, sagaMiddleware));
// определить автоматически тип всего объекта состояния
export type AppRootStateType = ReturnType<typeof rootReducer>

sagaMiddleware.run(rootWatcher);

function* rootWatcher() {
    yield takeEvery('TASKS/FETCH-TASKS', fetchTasksWorkerSaga);
    yield takeEvery('TASKS/REMOVE-TASK', removeTaskWorkerSaga);
    yield takeEvery('TASKS/ADD-TASK-TO-TODOLIST', addTaskWorkerSaga);
    yield takeEvery('TODOLISTS/FETCH-TODOLIST', fetchTodolistsWorkerSaga);
    yield takeEvery('TODOLISTS/REMOVE-TODOLIST', removeTodolistWorkerSaga);
    yield takeEvery('TODOLISTS/ADD_TODOLIST', addTodolistWorkerSaga);
    yield takeEvery('TODOLISTS/CHANGE_TODOLIST', changeTodolistTitleWorkerSaga);
    yield takeEvery('AUTH/LOGIN', loginWorkerSaga);
    yield takeEvery('AUTH/LOGOUT', logoutWorkerSaga);
    yield appWatcherSaga();
    // yield todolistWatcherSaga();
    // yield tasksWatcherSaga();
}

// а это, чтобы можно было в консоли браузера обращаться к store в любой момент
// @ts-ignore
window.store = store;
