import {setAppStatusAC} from '../../app/app-reducer';
import {authAPI, LoginParamsType, ResponseType} from '../../api/todolists-api';
import {handleServerAppErrorSagaWorker, handleServerNetworkErrorSagaWorker} from '../../utils/error-utils';
import {setIsLoggedInAC} from './auth-reducer';
import {put, call, takeEvery} from 'redux-saga/effects'
import {AxiosResponse} from 'axios';

export function* loginWorkerSaga(action: ReturnType<typeof loginSagaAC>) {
    const {data} = action.payload;
    yield put(setAppStatusAC('loading'));
    try {
        const res: AxiosResponse<ResponseType<{ userId?: number }>> = yield call(authAPI.login, data);

        if (res.data.resultCode === 0) {
            yield put(setIsLoggedInAC(true))
            yield put(setAppStatusAC('succeeded'))
        } else {
            return handleServerAppErrorSagaWorker(res.data)
        }
    } catch (error) {
        return handleServerNetworkErrorSagaWorker(error)
    }
}

export const loginSagaAC = (data: LoginParamsType) => ({
    type: 'AUTH/LOGIN',
    payload: {data}
});

export function* logoutWorkerSaga() {
    yield put(setAppStatusAC('loading'));
    try {
        const res = yield call(authAPI.logout);
        if (res.data.resultCode === 0) {
            yield put(setIsLoggedInAC(false))
            yield put(setAppStatusAC('succeeded'))
        }
    } catch (error) {
        return handleServerNetworkErrorSagaWorker(error)
    }
}

export const logoutSagaAC = () => ({type: 'AUTH/LOGOUT'})

export function* authWatcherSaga() {
    yield takeEvery('AUTH/LOGIN', loginWorkerSaga);
    yield takeEvery('AUTH/LOGOUT', logoutWorkerSaga);
}