import {IVersionType, restGetVersions, restPutVersion, serverDB} from "../server/Server";
import {Dispatch} from "redux";

type InitialStateType = {
    versions: {
        unreleased: IVersionType[]
        released: IVersionType[]
    } ,
    preloader: boolean
}
const initialState: InitialStateType = {
    versions: {
        unreleased: [],
        released: []
    } ,
    preloader: false
}

export const versionsReducer  = (state: InitialStateType = initialState, action: ActionsVersionsType): InitialStateType => {
    switch (action.type) {
        case "SET_VERSIONS": {
            console.log('render')
            const releasedVersions = action.versions.filter(i => i.released)
            const unreleasedVersions = action.versions.filter(i => !i.released)
            return {...state, versions: {unreleased: unreleasedVersions, released: releasedVersions}}
        }
        case "SET_PRELOADER": {
            return {...state, preloader: action.preloader}
        }
        case "SET_VERSION_CHANGE": {
            if (!action.version.released) {
                const newReleased = state.versions.released
                const newUnreleased = state.versions.unreleased
                const [removed] = newReleased.splice(action.indexFrom, 1);
                newUnreleased.splice(action.indexTo, 0, removed).sort((a, b) => a.sequence - b.sequence);
                return {...state, versions: {released: newReleased, unreleased: newUnreleased}}
            }
            else {
                const newReleased = state.versions.released
                const newUnreleased = state.versions.unreleased
                const [removed] = newUnreleased.splice(action.indexFrom, 1);
                newReleased.splice(action.indexTo, 0, removed).sort((a, b) => a.sequence - b.sequence);
                return  {...state, versions: {released: newReleased, unreleased: newUnreleased}}
            }
        }
        case "SET_VERSION_POSITION": {
            let items:IVersionType[] = []
            if (!action.version.released) {
                items = state.versions.unreleased
                const [removed] = items.splice(action.indexFrom, 1);
                items.splice(action.indexTo, 0, removed)
                return {...state, versions: {...state.versions, unreleased: items}}
            }
            else {
                items = state.versions.released
                const [removed] = items.splice(action.indexFrom, 1);
                items.splice(action.indexTo, 0, removed)
                return {...state, versions: {...state.versions, released: items}}
            }

        }
    }
    return state
}
export const setVersionsAC = (versions: IVersionType[]) => ({type: "SET_VERSIONS", versions} as const)
export const setPreloaderAC = (preloader: boolean) => ({type: "SET_PRELOADER", preloader} as const)
export const setVersionChangeAC = (version: IVersionType, indexFrom: number, indexTo: number) => ({type: "SET_VERSION_CHANGE", version, indexFrom, indexTo} as const)
export const setVersionPositionAC = (version: IVersionType, indexFrom: number, indexTo: number) => ({type: "SET_VERSION_POSITION", version, indexFrom, indexTo} as const)

type SetVersionsAT = ReturnType<typeof setVersionsAC>
type SetPreloaderAT = ReturnType<typeof setPreloaderAC>
type SetVersionChangeAT = ReturnType<typeof setVersionChangeAC>
type SetVersionPositionAT = ReturnType<typeof setVersionPositionAC>
type ActionsVersionsType = SetVersionsAT | SetPreloaderAT | SetVersionChangeAT | SetVersionPositionAT

export const getVersionsTC = () => (dispatch: Dispatch) => {
    dispatch(setPreloaderAC(true))
    restGetVersions().then((res: any) => {
        dispatch(setVersionsAC(res))
        dispatch(setPreloaderAC(false))
    }).catch(err => {
        alert("something went wrong "+err)
    })
}
export const versionUpdateTC = (id:string, version: IVersionType) => (dispatch: Dispatch) => {
    dispatch(setPreloaderAC(true))
    restPutVersion(id, version).then((res: any) => {
        dispatch(setPreloaderAC(false))
    }).catch(err => {
        alert("something went wrong "+err)
    })

}
