
import Square from "./components/Square.component";

export default function Board() {
    return (
        <>
          <div className="board-row">
            <Square />
            <Square />
            <Square />
          </div>
          <div className="board-row">
            <Square />
            <Square />
            <Square />
          </div>
          <div className="board-row">
            <Square />
            <Square />
            <Square />
          </div>
        </>
      );
}
