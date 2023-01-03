import {setAppErrorAC, setAppStatusAC} from '../app/app-reducer';
import { put } from 'redux-saga/effects'

export function* handleServerAppErrorSagaWorker(data: any) {
    if (data.messages.length) {
        yield put(setAppErrorAC(data.messages[0]))
    } else {
        yield put(setAppErrorAC('Some error occurred'))
    }
    yield put(setAppStatusAC('failed'))
}

export function* handleServerNetworkErrorSagaWorker(error: { message: string }) {
    yield put(setAppErrorAC(error.message ? error.message : 'Some error occurred'))
    yield put(setAppStatusAC('failed'))
}
