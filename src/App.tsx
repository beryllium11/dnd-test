import * as React from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DroppableProvided,
  DraggableLocation,
  DropResult,
  DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot
} from 'react-beautiful-dnd';
import {Flex} from 'grid-styled'
import './App.css';
import {IVersionType} from "./server/Server"
import {connect} from "react-redux";
import { AppRootStateType } from './store/store';
import Preloader from "./preloader/Preloader";
import {getVersionsTC, setVersionChangeAC, setVersionPositionAC, versionUpdateTC} from "./store/VersionsReducer";

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
interface IMoveResult {
  droppable: Item[];
  droppable2: Item[];
}

let pulledVersion: Item;

const sequenceRewriter = (items: Item[]) => {
  return items.map(i => {
    return {...i, sequence: items.indexOf(i)}
  })
}
const reorder = (list: Item[], startIndex: number, endIndex: number):Item[] => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  const finalResult = sequenceRewriter(result)
  let preResult = finalResult.find(ver => ver.id === removed.id )
  if (preResult) {
    pulledVersion = preResult
  }
  return finalResult;
};


/**
 * Moves an item from one list to another list.
 */
const move = (source: Item[], destination: Item[], droppableSource:DraggableLocation, droppableDestination:DraggableLocation):IMoveResult | any => {
  const sourceClone = [...source];
  const destClone = [...destination];
  const [removed] = sourceClone.splice(droppableSource.index, 1);
  removed.released = !removed.released


  destClone.splice(droppableDestination.index, 0, removed);
  const result: IMoveResult = {
    droppable: [],
    droppable2: []
  }
  result.droppable = sequenceRewriter(sourceClone);
  result.droppable2 = sequenceRewriter(destClone);
  pulledVersion = removed
  return result;
};

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

  public id2List = {
    droppable: 'items',
    droppable2: 'selected'
  };

  /*public unreleasedItems: IVersionType[] = this.props.versions.filter(i => !i.released )
  public releasedItems: IVersionType[] = this.props.versions.filter(i => i.released )*/


  constructor(props: any) {
    super(props);
    this.state = {
      items: [],
      selected: []
    };

    this.onDragEnd = this.onDragEnd.bind(this);
    this.getList = this.getList.bind(this);
  }

  componentDidMount() {
    this.props.getVersionsTC()
  }

  componentDidUpdate(prevProps: Readonly<AppStateType>, prevState: Readonly<IAppState>, snapshot?: any) {
    if(prevProps.versions !== this.props.versions) {
        this.setState({
          items: this.props.versions.unreleased,
          selected: this.props.versions.released
        })
      console.log(this.props.versions)
      }
  }




  public getList (id: string):Item[] {
    // @ts-ignore
    return this.state[this.id2List[id]];
  }

  public onDragEnd(result: DropResult):void {

    const { source, destination } = result;

    if (!destination) {
      return;
    }
    const indexFrom = source.index
    const indexTo = destination.index
    if (source.droppableId === destination.droppableId) {

      const items = reorder(
        this.getList(source.droppableId),
        source.index,
        destination.index
      );

      let state:IAppState = {...this.state};

      if (source.droppableId === "droppable2") {
        state = { ...this.state, selected: items };
      } else if (source.droppableId === "droppable") {
        state = {...this.state, items}
      }

      this.props.setVersionPositionAC(pulledVersion, indexFrom, indexTo)
      this.setState(state);

    } else {
      const resultFromMove:IMoveResult = move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination
      );
      if (resultFromMove.droppable2[0] && !resultFromMove.droppable2[0].released) {
        this.setState({
          items: resultFromMove.droppable2,
          selected: resultFromMove.droppable
        })
      }
      if (resultFromMove.droppable2[0] && resultFromMove.droppable2[0].released) {
        this.setState({
          items: resultFromMove.droppable,
          selected: resultFromMove.droppable2
        })
      }
      this.props.setVersionChangeAC(pulledVersion, indexFrom, indexTo)
    }
  this.props.versionUpdateTC(pulledVersion?.id, pulledVersion)
  }

  public render() {
    return (

      <DragDropContext onDragEnd={this.onDragEnd}>
        {this.props.preloader ? <Preloader/> : false}
        <Flex justifyContent={"space-between"}>
          <div>
            <h3>Unreleased</h3>
            <Droppable droppableId="droppable" >
              {(provided:DroppableProvided, snapshot:DroppableStateSnapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  { this.state.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(providedDraggable:DraggableProvided, snapshotDraggable:DraggableStateSnapshot) => (
                          <div>
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
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          <div>
            <h3>Released</h3>
          <Droppable droppableId="droppable2">
            {(provided:DroppableProvided, snapshot:DroppableStateSnapshot) => (
              <div
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}>
                { this.state.selected.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={item.id}
                    index={index}>
                    {(providedDraggable2:DraggableProvided, snapshotDraggable2:DraggableStateSnapshot) => (
                      <div>
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
}
type MapDispatchToPropsType = {
  getVersionsTC: () => void,
  versionUpdateTC: (id:string, version: IVersionType) => void
  setVersionChangeAC: (version: IVersionType, indexFrom: number, indexTo: number) => void
  setVersionPositionAC: (version: IVersionType, indexFrom: number, indexTo: number) => void
}
export type AppStateType = MapStateToPropsType & MapDispatchToPropsType

let mapStateToProps = (state: AppRootStateType) => {
  return {
    versions: state.versionsReducer.versions,
    preloader: state.versionsReducer.preloader
  }
}
export default connect(mapStateToProps, {getVersionsTC, versionUpdateTC, setVersionChangeAC, setVersionPositionAC})(App)
