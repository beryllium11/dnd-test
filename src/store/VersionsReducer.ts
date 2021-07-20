import {IVersionType, restGetVersions, restPutVersion, serverDB} from "../server/Server";
import {Dispatch} from "redux";

type InitialStateType = {
    versions: IVersionType[],
    preloader: boolean
}
const initialState: InitialStateType = {
    versions: [],
    preloader: false
}

export const versionsReducer  = (state: InitialStateType = initialState, action: ActionsVersionsType): InitialStateType => {
    switch (action.type) {
        case "SET_VERSIONS": {
            return {...state, versions: action.versions}
        }
        case "SET_PRELOADER": {
            return {...state, preloader: action.preloader}
        }
    }
    return state
}
export const setVersionsAC = (versions: any) => ({type: "SET_VERSIONS", versions} as const)
export const setPreloaderAC = (preloader: boolean) => ({type: "SET_PRELOADER", preloader} as const)

type SetVersionsAT = ReturnType<typeof setVersionsAC>
type SetPreloaderAT = ReturnType<typeof setPreloaderAC>
type ActionsVersionsType = SetVersionsAT | SetPreloaderAT

export const getVersionsTC = () => (dispatch: Dispatch) => {
    dispatch(setPreloaderAC(true))
    restGetVersions().then((res: any) => {
        dispatch(setVersionsAC(res))
        console.log(res)
        dispatch(setPreloaderAC(false))
    }).catch(err => {
        alert("something went wrong "+err)
    })
}
export const versionUpdateTC = (id:string, version: IVersionType) => (dispatch: Dispatch) => {
    dispatch(setPreloaderAC(true))
    restPutVersion(id, version).then((res: any) => {
        dispatch(setPreloaderAC(false))
        restGetVersions().then((res: any) => {
            dispatch(setVersionsAC(res))
            dispatch(setPreloaderAC(false))
        }).catch(err => {
            alert("something went wrong "+err)
        })
    }).catch(err => {
        alert("something went wrong "+err)
    })

}
