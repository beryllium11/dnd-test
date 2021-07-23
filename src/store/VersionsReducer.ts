import {IVersionType, restGetVersions, restPutVersion} from "../server/Server";
import {Dispatch} from "redux";

type InitialStateType = {
    versions: {
        unreleased: IVersionType[]
        released: IVersionType[]
    } ,
    preloader: boolean
    pulledVersion: IVersionType
}

const initialState: InitialStateType = {
    versions: {
        unreleased: [],
        released: []
    } ,
    preloader: false,
    pulledVersion: {id: '', released: false, sequence: 1, name: "qwer"}
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
            if (action.tableId === "unreleased") {
                const newReleased = state.versions.released
                const newUnreleased = state.versions.unreleased
                const [removed] = newReleased.splice(action.indexFrom, 1);
                removed.sequence = action.indexTo
                newUnreleased.splice(action.indexTo, 0, removed).map(i => ({...i, sequence: newUnreleased.indexOf(i)}));
                return {...state, versions: {released: newReleased, unreleased: newUnreleased}, pulledVersion: removed}
            }
            else {
                const newReleased = state.versions.released
                const newUnreleased = state.versions.unreleased
                const [removed] = newUnreleased.splice(action.indexFrom, 1);
                removed.sequence = action.indexTo
                newReleased.splice(action.indexTo, 0, removed).map(i => ({...i, sequence: newReleased.indexOf(i)}));
                return  {...state, versions: {released: newReleased, unreleased: newUnreleased}, pulledVersion: removed}
            }
        }
        case "SET_VERSION_POSITION": {
            let items:IVersionType[] = []
            if (action.tableId === "unreleased") {
                items = state.versions.unreleased
                const [removed] = items.splice(action.indexFrom, 1);
                removed.sequence = action.indexTo
                items.splice(action.indexTo, 0, removed).map(i => ({...i, sequence: items.indexOf(i)}));
                return {...state, versions: {...state.versions, unreleased: items}, pulledVersion: removed}
            }
            else {
                items = state.versions.released
                const [removed] = items.splice(action.indexFrom, 1);
                removed.sequence = action.indexTo
                items.splice(action.indexTo, 0, removed).map(i => ({...i, sequence: items.indexOf(i)}))
                return {...state, versions: {...state.versions, released: items}, pulledVersion: removed}
            }

        }
    }
    return state
}
export const setVersionsAC = (versions: IVersionType[]) => ({type: "SET_VERSIONS", versions} as const)
export const setPreloaderAC = (preloader: boolean) => ({type: "SET_PRELOADER", preloader} as const)
export const setVersionChangeAC = (tableId: string, indexFrom: number, indexTo: number) => ({type: "SET_VERSION_CHANGE", tableId, indexFrom, indexTo} as const)
export const setVersionPositionAC = (tableId: string, indexFrom: number, indexTo: number) => ({type: "SET_VERSION_POSITION", tableId, indexFrom, indexTo} as const)

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
