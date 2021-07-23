import * as React from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DroppableProvided,
  DropResult,
  DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot
} from 'react-beautiful-dnd';
import {Flex} from 'grid-styled'
import './App.css';
import {IVersionType} from "./server/Server"
import {connect} from "react-redux";
import { AppRootStateType } from './store/store';
import Preloader from "./preloader/Preloader";
import {
  getVersionsTC,
  setVersionChangeAC,
  setVersionPositionAC,
  versionUpdateTC
} from "./store/VersionsReducer";

interface Item {
  id: string;
  name: string;
  released: boolean;
  sequence: number
}
interface IAppState {
  items: Item[];
  selected: Item[];
}

const grid:number = 8;

const getItemStyle = (draggableStyle: any, isDragging: boolean):{} => ({
  userSelect: 'none',
  padding: 2*grid,
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? 'lightgreen' : 'grey',
  ...draggableStyle
});

const getListStyle = (isDraggingOver: boolean):{} => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
  width: 300,
  minHeight: 400
});

class App extends React.Component<AppStateType, IAppState> {

  constructor(props: any) {
    super(props);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  componentDidMount() {
    this.props.getVersionsTC()
  }

  public onDragEnd(result: DropResult): void {

    const {source, destination} = result;

    if (!destination) {
      return;
    }
    const indexFrom = source.index
    const indexTo = destination.index
    if (source.droppableId === destination.droppableId) {
      this.props.setVersionPositionAC(destination.droppableId, indexFrom, indexTo)
    }
    else {
      this.props.setVersionChangeAC(destination.droppableId, indexFrom, indexTo)
    }
    this.props.versionUpdateTC(this.props.pulledVersion.id, this.props.pulledVersion)
  }

  public render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Flex justifyContent={"space-between"}>
          <div>
            <h3>Unreleased</h3>
            <Droppable droppableId="unreleased" >
              {(provided:DroppableProvided, snapshot:DroppableStateSnapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  { this.props.versions.unreleased.map((item, index) => {
                    return <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(providedDraggable:DraggableProvided, snapshotDraggable:DraggableStateSnapshot) => (
                          <div className="dragItems">
                            {item.id === this.props.pulledVersion.id && this.props.preloader ? <Preloader/> : false}
                            <div
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}
                              {...providedDraggable.dragHandleProps}
                              style={getItemStyle(
                                providedDraggable.draggableProps.style,
                                snapshotDraggable.isDragging
                              )}
                            >
                              {item.name}
                            </div>
                            {provided.placeholder}
                          </div>
                        )}
                    </Draggable>
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          <div>
            <h3>Released</h3>
          <Droppable droppableId="released">
            {(provided:DroppableProvided, snapshot:DroppableStateSnapshot) => (
              <div
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}>
                { this.props.versions.released.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={item.id}
                    index={index}>
                    {(providedDraggable2:DraggableProvided, snapshotDraggable2:DraggableStateSnapshot) => (
                      <div className="dragItems">
                        {item.id === this.props.pulledVersion.id && this.props.preloader ? <Preloader/> : false}
                        <div
                          ref={providedDraggable2.innerRef}
                          {...providedDraggable2.draggableProps}
                          {...providedDraggable2.dragHandleProps}
                          style={getItemStyle(
                            providedDraggable2.draggableProps.style,
                            snapshotDraggable2.isDragging
                          )}>
                          {item.name}
                        </div>
                       {provided.placeholder}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          </div>
          </Flex>
      </DragDropContext>
    );
  }

}

type MapStateToPropsType = {
  versions:  {
    unreleased: IVersionType[]
    released: IVersionType[]
  }
  preloader: boolean
  pulledVersion: IVersionType
}
type MapDispatchToPropsType = {
  getVersionsTC: () => void,
  versionUpdateTC: (id:string, version: IVersionType) => void
  setVersionChangeAC: (tableId: string, indexFrom: number, indexTo: number) => void
  setVersionPositionAC: (tableId: string, indexFrom: number, indexTo: number) => void
}
export type AppStateType = MapStateToPropsType & MapDispatchToPropsType

let mapStateToProps = (state: AppRootStateType) => {
  return {
    versions: state.versionsReducer.versions,
    preloader: state.versionsReducer.preloader,
    pulledVersion: state.versionsReducer.pulledVersion
  }
}
export default connect(mapStateToProps, {getVersionsTC, versionUpdateTC, setVersionChangeAC, setVersionPositionAC})(App)
