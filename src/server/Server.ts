const storageServerDB = window.localStorage.getItem("serverDB");

export interface IVersionType {
    id: string,
    name: string,
    released: boolean,
    sequence: number
}
export interface IVersionsObjectType {
    versions: IVersionType[]
}

const initialServerDB:IVersionsObjectType = {
    versions: [
        {
            id: '1',
            name: "Version 1.0",
            released: false,
            sequence: 0
        },
        {
            id: '2',
            name: "Version 2.0",
            released: false,
            sequence: 1
        },
        {
            id: '3',
            name: "Version 3.0",
            released: true,
            sequence: 0
        },      {
            id: '4',
            name: "Version 4.0",
            released: false,
            sequence: 1
        },
        {
            id: '5',
            name: "Version 5.0",
            released: true,
            sequence: 0
        }
    ]
};

export const serverDB: IVersionsObjectType = storageServerDB
    ? JSON.parse(storageServerDB)
    : initialServerDB;

export async function restGetVersions() {
    return new Promise((resolve) => {
        setTimeout(() => resolve(serverDB.versions), 1000);
    });
}


export async function restPutVersion(id:string, version: IVersionType) {
    return new Promise((resolve) => {
        const index = serverDB.versions.findIndex((v) => v.id === id);
        serverDB.versions[index] = version;
        window.localStorage.setItem("serverDB", JSON.stringify(serverDB));
        setTimeout(() => resolve(version), 2000);
    });
}
