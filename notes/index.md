# react.dev-tic-tac-toe > Notes

- Overview
  - What are you building?
- Setup for the tutorial
- Overview

  - Inspecting the starter code
  - Building the board
  - Passing data through props
  - Making interactive components
  - React Developer Tools
  - Completing the game
    - Lifting state up
    - Why immutability is important
    - Taking tunrs
    - Declaring a winner

- Adding time travel
  - Storing a history of moves
  - Lifting state up, again
  - Showing the past moves
  - Picking a key
  - Implementing time travel
  - Final cleanup
  - Wrapping up

React components need to return a single JSX element.

To fix this you can use `Fragments` (<> and </>)

Note

JavaScript support [closures]() which means an inner function (e.g. `handleClick`) has access to varaibles and functions defined in an outer function (e.g. `Board`). The `handleClick` function can read the `squares` state and call the `setSquares` method because they are both defined inside of the `Board` function.

## On this page

- Lifting state up

### Lifting state up

Currently, each `Square` component maintains a part of the game's state. To check for a winner ina tic-tac-toe game, the `Board` would need to somehow know the state of each of the 9 `Square` components.

How would you approach that? At first, you might guess that the `Board` needs to "ask" each `Square` for that `Square`'s state. Although this approach is technically possible in React, we discourage it because the code becomes difficult to understand, susceptible to bugs, and hard to refactor. Instead, the best approach is to store the game's state in the parent `Board` component instead of in each `Square`. The `Board` component can tell each `Square` what to diplsay by passing a **prop**, like you did when you passed a number to each `Square`.

> To collect data from multiple children, or to have two child components communicate with each other, declare the shared state in their parent component instead. Th eparent component can pass that state back down to children via `props`. This keeps the child components in sync with each other and with their parent.

Lifting state into a parent component is common when React components are refactored.

Let's take this opportunity to try it out. Edit the `Board` component so that it declares a state varaible named `squares` that defaults to an array of 9 nulls corresponding to the 9 squares:

```js
// ...
export default function Board() {
    const [square, setSquares] = useState(Array(9).fill(null));
    return (
        // ...
    );
}
```

`Array(9).fill(null)` creates an array with nine elements and sets each of them to `null`. The `useState()` call around it declares a `squares` state varaible that's initially set to that array. Each entry in the array corresponds to the value of a square. When you fill the board in later, the `squares` array will look like this:

```js
// prettier-ignore
['O', null, 'X', 'X', 'X', 'O', 'O', null, null]
```

Now your `Board` component needs to pass the `value` prop down to each `Sqaure` that it renders:

```js
export default function Board() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  return (
    <>
      <div className="board-row">
        <Square value={squares[0]} />
        <Square value={squares[1]} />
        <Square value={squares[2]} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} />
        <Square value={squares[4]} />
        <Square value={squares[5]} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} />
        <Square value={squares[7]} />
        <Square value={squares[8]} />
      </div>
    </>
  );
}
```

Next, you'll edit the `Sqaure` component to receive the `value` prop from the Board component. This will require removing the Square component's own stateful tracking of `value` and the button's `onClick` prop:

```js
function Square({ value }) {
  return <button className="square">{value}</button>;
}
```

At this point you should see an empty tic-tac-toe board:

And your code should look like this:

## Why immutability is important

Node how in `handleClick`, you call `.slice()` to create a copy of the `squares` array instead of modifying the existing array. To Explain why, we need to discuss immutability and why immutability is important to learn.

There are generally two apporaches to changing data. The first approach is to _mutate_ the data by directly changing the data's values. The second approach is to replace the data with a new copy which has the desired changes. Here is what is what it would look like if you mutated the `squares` array:

```js
const squares = [null, null, null, null, null, null, null, null, null];
squares[0] = "X";
// Now `squares` is ["X", null, null, null, null, null, null, null, null];
```

And here is what it would look like if you changed data without mutating the `squares` array:

```js
const squares = [null, null, null, null, null, null, null, null, null];
const nextSquares = ["X", null, null, null, null, null, null, null, null];
// Now `squares` is unchanged, but `nextSquares` first element is 'X' rather than `null`
```

The result is the same but by not mutating (changing the underlying data) directly, you gain several benefits.

Immutability makes complex features much easier to implement. Later in this tutorial, you will implement a "time travel" feature that lets you review the game's history and "jump back" to past moves. This functionality isn't specific to games—an ability to undo and redo certain actions is a common requirement for apps. Avoiding direct data mutation lets you keep previous versions of the data intact, and reuse them later.

There is also another benefit of immutability. By default, all child components re-render automatically when the state of a parent component changes. This includes the children components that weren't affected by the change. Although re-rendering is not by itself noticeable to the user (you shouldn't actively try to avoid it!), you might want to skip re-rendering a part of the tree that clearly wasn't affected by it for performance reasons. Immutability makes it very cheap for components to compare whether their data has changed or not. You can learn more about how React choses when to re-render a component in the [the `memo` API reference]()

## Taking turns

It's now time to fix a mojor defect in this tic-tac-toe game: the "O"s cannot be marked on the board.

You'll set the first move to be "X" be default. Let's keep track of this by adding another piece of state to the Board component:

```js
function Board() {
  const [xIsNext, setXIsNext] = useState(true);
  const [squares, setSquares] = useState(Array(9).fill(null));
}
```

Each time a player moves, `xIsNext` (a boolean) will be flipped to determine which player goes next and the game's state will be saved. You'll update the `Board`'s `handleClick` function to flip the value of xIsNext:

```js
export default function Board() {
    const [xIsNext, setXIsNext] = useState(true);
    const [squares, setSquares]  = useState(Array(9).fill(null));

    function handleClick(i) {
        const nextSquares = squares.slice();
        if (xIsNext) {
            nextSquares[i] = "X";
        } else {
            nextSquares[i] = "O";
        }
        setSquares(nextSquares);
        setXIsNext(!xIsNext);
    }

    return (
        //...
    );
}
```

## Declaring a winner

Now that the players can take turns, you'll want to show when the game is won and there are no more turns to make. TO do this you'll add a helper function called `calculateWinner` that takes an array of 9 squares, checks for a winner and returns `'X'`,`'O'`, or `null` as appropriate. Don't worry too much about the `calculateWinner` function; it's not specific to React:

```js
export default function Board() {
  //...
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
```

Note:

> It does not matter whether you define `calculateWinner` before or after the `Board`. Let's put it at the end so that you don't have to scroll past it every time you edit your components.

You will call `calculateWinner(squares)` in the `Board` component's `handleClick` function to check if a player has won. You can perform this check at the same time you check if a user has clicked a square that already has an `X` or an `O`. We'd like to return early in both cases:

```js
function handleClick(i) {
  if (sqaures[i] || calculateWinner(squares)) {
    return;
  }
  const nextSquares = squares.slice();
  //...
}
```

To let the players know when the game is over, you can display text such as "Winner:X" or "Winner:O". To do that you'll add a `status` section to the `Board` component. The status will display the winner if the game is over and if the game is ongoing you'll display which player's turn is next:

```js
export default function Board() {
    // ...
    const winner = calculateWinner(squares);
    let status;
    if (winner) {
        status = "Winner: " + winner;
    } else {
        status = "Next player: " + (xIsNext ? "X" : "O");
    }

    return (
        <>
          <div className="status">{status}</div>
          <div className="board-row">
            // ...
    )
}
```

Congratulations! You now have a working tic-tac-toe game. And you've just learned the basics of React too. So you are the real winner here. Here is what the code should look like:

```js
import { useState } from "react";

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

export default function Board() {
  const [xIsNext, setXIsNext] = useState(true);
  const [squares, setSquares] = useState(Array(9).fill(null));

  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
```

## Adding time travel

As a final exervise, let's make it possible to "go back in time" to the previous moves in the game.

### Storing a history of moves

If you mutated the `squares` array, implementing time travel would be very difficult.

However, you used `slice()` to create a new copy of the `squares` array after every move, and treated it as immutable. This will allow you to store every past version of the `squares` array, and navigate between the turns that have already happended.

You'll store the past `sqaures` arrays in another array called `history`, which you'll store as a new state variable. The `history` array represents all board states, from the first to the last move, and has a shape like this:

```js
[
  // Before first move
  [null, null, null, null, null, null, null, null, null],
  // After first move
  [null, null, null, null, "X", null, null, null, null],
  // After second move
  [null, null, null, null, "X", null, null, null, "O"],
  // ...
];
```

## Lifting state, again

You will now write a new top-level component called `Game` to display a list of past moves. That's where you will place the `history` state that contains the entire game history.

Placing the `history` state into the `Game` component will let you remove the `squares` state from its child `Board` component. Just like you "lifted state up" from the `Square` component into the `Board` component, you will now lift it up from the `Board` into the top-level `Game` component. This gives the `Game` component full control over the `Board`'s data and lets it instruct the `Board` to render previous turns from the `history`.

First, add a `Game` component with `export default`. Have it render the `Board` component and some markup:

```js
function Board() {
  // ...
}

export default function Game() {
  return (
    <div className="game">
      <div className="game-board">
        <Board />
      </div>
      <div className="game-info">
        <ol>{/*TODO*/}</ol>
      </div>
    </div>
  );
}
```

Note that you are removing the `export default` keywords before the
_function Board() {_ declaraction and adding them before the _function Game() {_ declaration. This tells your `index.js` fule to use the `Game` component as the top-level component instead of your `Board` component. The additional `div`s returned by the `Game` component are making room for the game information you'll add to the board later.

Add some state to the `Game` component to track which player is next and the history of moves:

```
export default function Game() {
    const [xIsNext, setXIsNext] = useState(true);
    const [history, setHistory] = useState([Array(9).fill(null)]);
    // ...
}
```

Notie how `[Array(9).fill(null)]` is an array with a single item, which itself is an array of 9 `null`s.

To render the squares for the current move, you'll want to read the last squares array from the `history`. You don't need `useState` for this-you already have enough information to calculate it during rendering:

```js
export default function Game() {
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const currentSquares = history[history.length - 1];
  // ...
}
```

Next, create a `handlePlay` function inside the `Game` component that will be called by the `Board` component to update the game. Pass `xIsNext`, `currentSquares`, and `handlePlay` as props to the `Board` component:

```js
export default function Game() {
    const [xIsNext, setXIsNext] = useState(true);
    const [history, setHistory] = useState([Array(9).fill(null)]);
    const currentSquares = history[history.length - 1];

    function handlePlay(nextSquares) {
        // TODO
    }

    return (
        <div className="game">
          <div className="game-board">
            <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
            // ...
    )
}
```

Let's make the `Board` component full controlled by the props it receives. Change the `Board` component to take three props: `xIsNext`, `squares`, and a new `onPlay` function that `Board` can call with the updated squares array when a player makes a move. Next, remove the first two lines of the `Board` function that call `useState`:

```js
function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    // ...
  }
  // ...
}
```

Now replace the `setSquares` and `setXIsNext` calls in `handleClick` in the `Board` component with a single call to your new `onPlay` function so the `Game` component can update the `Board` when the user clicks a square:

```js
function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(sqaures) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }
  //...
}
```

The `Board` component is fully controlled by the props passed to it by the `Game` component. You need to implement the `handlePlay` function in the `Game` component to get the game working again.

What should `handlePlay` do when called? Remember that Board used to call `setSquares` with an updated array;now it passes the updated `squares` array to `onPlay`.

The `handlePlay` function needs to update `Game`'s state to trigger a re-render, but you don't have a `setSquare` function that you can all anymore-you're now using `history` state varaible to store this information. you'll want to update `history` by appending the updated `squares` array as a new history entry. You also want to toggle `xIsNext`, just as `Board` used to do:

## Showing the past moves

Since you are recording the tic-tac-toe game's history, you can now display a list of past moves to the player.

React elements like `<button>` are regular JavaScript objects; you can pass them around in your applciation. To render multiple items in React, you can use an array of React elements.

You already have an array of `history` moves in state, so now you need to transform it to an array of React elements. In JavaScript, to transform one array into another, you can use the [array `map` method:]()

```js
[1, 2, 3].map((x) => x * 2); // [2, 4, 6]
```

You'll use `map` to transform your `history` of moves into React elements representing buttons on the screen, and display a list of buttons to "jump" to past moves. Let's `map` over the `history` in the Game component:

```js
export default function Game() {
  // ...

  function jumpTo(nextMove) {
    // TODO
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
    } else {
      description = "Go to game to start";
    }
    return (
      <li>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}
```

You can see what your code should look like below. Note that you should see an error in the developer tools console that says:

```error

Warning: Each child is an array or iterator should have a unique "key" prop. Check the render method of `Game`.

```

You'll fix this error in the next section.
