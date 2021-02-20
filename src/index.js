import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square (props) {
  return (
    // <button className="square" onClick={function() {alert('click');}}>
    <button className="square" 
      // props.onClick()を呼び出す。Squareは関数の呼び出しを受け取っている。
      // thisがいらない
      onClick={() => props.onClick()}
      >
      {/* thisがいらない。さらに補足, ここはhtml(xml?)的コメント */}
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square 
        // stateはBoardが持っている。propsでもらう場合Gameからもらうだけ
        value={this.props.squares[i].character ? this.props.squares[i].character.name : null}
        // onClick()をpropsとしてSquareに渡す。
        onClick={()=>this.props.onClick(i)}
      />
    );
  }

  render() {

    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
        <div className="board-row">
          {this.renderSquare(9)}
          {this.renderSquare(10)}
          {this.renderSquare(11)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    let squares= Array(9).fill(null);
    squares[0] = {character: { team:0, name: 'し'}, location: 0};
    squares[1] = {character: { team:0, name: 'Te'}, location: 1};
    squares[2] = {character: { team:0, name: 'Gi'}, location: 2};
    squares[3] = {character: null, location: 3};
    squares[4] = {character: { team:0, name: 'Ta'}, location: 4};
    squares[5] = {character: null, location: 5};
    squares[6] = {character: null, location: 6};
    squares[7] = {character: { team:1, name: 'Ze'}, location: 7};
    squares[8] = {character: null, location: 8};
    squares[9] = {character: { team:1, name: 'Ob'}, location: 9};
    squares[10] = {character: { team:1, name: 'Ky'}, location: 10};
    squares[11] = {character: { team:1, name: 'Mu'}, location: 11};
    
    this.state ={
      history: [{
        squares: squares,
      }],
      stepNumber: 0,
      zeroIsNext: true,
      currentChoice: null,
      choice: {
        source: null,
        target: null
      }
    }
  }
  handleClick(i) {
    // sliceしコピーを生成する。immutableな書き方。
    // 利点1: historyなどを作りやすい
    // 利点2: 変更の検知が容易(常にimmutableな書き方をしていれば、objectが別であるかどうかを検査すれば良い)
    let history_length = this.state.history.length;
    let newchoice = this.state.history[history_length - 1].squares[i];
    if (newchoice.character != null && ((newchoice.character.team == 0) == this.state.zeroIsNext)){ // 
      // setStateが必要？ See: https://ja.reactjs.org/docs/state-and-lifecycle.html
      this.state.choice.source = newchoice;
      this.state.choice.target = null
    }else if(this.state.choice.source != null){ // すでにsourceが選択済みならtargetを選択
      this.state.choice.target = newchoice
    }
    // 移動判定
    if(this.state.choice.source != null && this.state.choice.target !=null){
      // source -> targetの移動が可能か
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];

      const squares = current.squares.slice();
      // this.state.choice.target.character = this.state.choice.source.character;
      // this.state.choice.source.character = null;
      squares[this.state.choice.target.location].character = {
        team: this.state.choice.source.character.team,
        name: this.state.choice.source.character.name
      }
      squares[this.state.choice.source.location].character = null;

      // if (calculateWinner(squares) || squares[i]){
      //   return;
      // }
      // squares[i] = this.state.zeroIsNext ? 'X' : 'O';
      this.setState({
        // これもimmutableな書き方？
        history: history.concat(
        [{
          squares: squares,
        }] 
        ),
        stepNumber: history.length,
        zeroIsNext: !this.state.zeroIsNext,
        choice: {
          source: null,
          target: null
        }
      });
    }
  }
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      zeroIsNext: (step % 2) === 0,
    });
  }
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const moves = history.map((step, move) =>{
      const desc = move ? 
      'Go to move #' + move:
      'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    let status;
    if (winner ) {
      status = 'Winner '+ winner;
    
    } else {
      status = 'Next player: ' + (this.state.zeroIsNext ? 'X': 'O');

    }
    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

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
function idxToPosition(idx) {
  let res = {x: idx % 3, y: idx / 3 | 0}
  return res
}
function positionToidx(x, y) {
  return 3 * y + x
}
// x,y
const movable = {
  kaku: [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1]
  ],
  hisha: [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0]
  ],
  ou: [
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1]
  ],
  ho: [
    [0, 1]
  ],
  kin: [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [0, -1]
  ]
}
const role_map = {
  Sh: 'hisha', 
  Mu: 'hisha',
  Ob: 'hisha',
  Te: 'ou',
  Gy: 'ou',
  Ky: 'ou',
  Ta: 'ho',
  Ze: 'ho',
  Ne: 'ho',
  In: 'ho',
  Gi: 'kaku',
  Sa: 'kaku',
  Mi: 'kaku'
}

function getMovable(choice) {
  if (choice.character == null) {
    return null
  }
  let my_movable = movable[role_map[choice.character.name]];
  let r = choice.character.team == 1 ? 1 : -1;
  let c = idxToPosition(choice.location);
  return my_movable.map(x => [x[0] * r + c.x, x[1] * r + c.y]).filter(x => x[0] >= 0 && x[0] < 3 && x[1] >= 0 && x[1] < 3)
  // https://stackoverflow.com/questions/58128952/how-to-skip-appending-some-condition-in-map-scala
  // return movable.map(x => [x[0] * rotate_factor, x[1] * rotate_factor])
}
