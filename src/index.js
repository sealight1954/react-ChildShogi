import React from 'react';
import _ from "lodash"
import ReactDOM from 'react-dom';
import './index.css';

const board_size = 12;
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
  "し": 'hisha', // しのぶ
  "む": 'hisha', // むいちろう
  "お": 'hisha', // おばない
  "て": 'ou', // てんげん
  "ぎ": 'ou', // ぎょうめい
  "き": 'ou', // きょうじゅうろう
  "た": 'ho', // たんじろう
  "ぜ": 'ho', // ぜんいつ
  "ね": 'ho', // ねづこ
  "い": 'ho', // いのすけ
  "ゆ": 'kaku', // ぎゆう
  "さ": 'kaku', // さねみ
  "み": 'kaku' // みつり
}

function Square (props) {
  let class_name = "square"
  if (props.is_team_zero ) {
    class_name += " team_zero";
  }
  return (
    // <button className="square" onClick={function() {alert('click');}}>
    <button className={class_name} 
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
        is_team_zero={this.props.squares[i].character ? (this.props.squares[i].character.team == 0 ? true : false) : false}
      />
    );
  }
  renderZeroStock(){
    // Zeroのもちゴマを描画
    if (this.props.zero_stock == 0){
      return null
    }else{
      return (
        <div>
          {this.props.squares.slice(board_size, board_size + this.props.zero_stock).map(
            (i) =>
            this.renderSquare(i.location)
          )}
        </div>
      )
    }
  }
  renderOneStock(){
    // return null;
    if (this.props.one_stock == 0){
      return null
    }else{
      return (
        <div>
          {this.props.squares.slice(board_size + this.props.zero_stock, board_size + this.props.zero_stock + this.props.one_stock).map(
            (i) =>
            this.renderSquare(i.location)
          )}
        </div>
      )
    }
  }

  render() {

    return (
      
      <div>
        <div className="board-row">
          {this.renderZeroStock()}
        </div>
        <div className="board-row">↑ 0のもちゴマ</div>
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
        <div className="board-row">↓ 1のもちゴマ</div>
        <div className="board-row">
          {this.renderOneStock()}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    let squares= Array(board_size).fill(null);
    squares[0] = {character: { team:0, name: 'む'}, location: 0};
    squares[1] = {character: { team:0, name: 'て'}, location: 1};
    squares[2] = {character: { team:0, name: 'ゆ'}, location: 2};
    squares[3] = {character: null, location: 3};
    squares[4] = {character: { team:0, name: 'た'}, location: 4};
    squares[5] = {character: null, location: 5};
    squares[6] = {character: null, location: 6};
    squares[7] = {character: { team:1, name: 'ぜ'}, location: 7};
    squares[8] = {character: null, location: 8};
    squares[9] = {character: { team:1, name: 'さ'}, location: 9};
    squares[10] = {character: { team:1, name: 'き'}, location: 10};
    squares[11] = {character: { team:1, name: 'し'}, location: 11};
    // 12- is allocated for stocks.
    // squares[12] = {character: { team:0, name: 'き'}, location: 12}; // Debug
    // squares[13] = {character: { team:0, name: 'き'}, location: 13}; // Debug
    // squares[14] = {character: { team:0, name: 'き'}, location: 14}; // Debug
    // squares[15] = {character: { team:0, name: 'き'}, location: 15}; // Debug
    // stores # of stocks
    // let zero_stock = 4; // Debug
    let zero_stock = 0;
    let one_stock = 0;
    
    this.state ={
      history: [{
        squares: squares,
        zero_stock: zero_stock,
        one_stock: one_stock
      }],
      stepNumber: 0,
      zeroIsNext: true,
      currentChoice: null,
      choice: null
    }
  }
  getMovable(choice) {
    if (choice.character == null) {
      return null
    }
    let is_stock = choice.location >= board_size;
    // TODO: 変数の定義の方法がReasnableか考える。
    let r = choice.character.team == 1 ? -1 : 1;
    let c = idxToPosition(choice.location);
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = _.cloneDeep(current.squares);
    let my_movable = is_stock ? 
      // ストックから出す時
      squares.slice(0, board_size).filter((item) => 
        item.character == null
      ).map((item) => 
        item.location
      ) :
      // 盤上のコマを動かす時
      movable[role_map[choice.character.name]].map(
        function(x) { 
          return [x[0] * r + c.x, x[1] * r + c.y];}
      ).filter(x => x[0] >= 0 && x[0] < 3 && x[1] >= 0 && x[1] < 3
      ).map(
        (item) => positionToidx(...item)
      ).filter(x =>
        // 味方のいないマス
        squares[x].character == null || 
        (squares[x].character.team == 0) != this.state.zeroIsNext
      )
    return my_movable
    // https://stackoverflow.com/questions/58128952/how-to-skip-appending-some-condition-in-map-scala
    // return movable.map(x => [x[0] * rotate_factor, x[1] * rotate_factor])
  }
  handleClick(i) {
    // sliceしコピーを生成する。immutableな書き方。
    // 利点1: historyなどを作りやすい
    // 利点2: 変更の検知が容易(常にimmutableな書き方をしていれば、objectが別であるかどうかを検査すれば良い)
    // let history_length = this.state.history.length;
    let newchoice = this.state.history[this.state.stepNumber].squares[i];
    if (newchoice.character != null && ((newchoice.character.team == 0) == this.state.zeroIsNext)){ 
      // 自チームのキャラを選択した時 => sourceとして選択
      // See: https://ja.reactjs.org/docs/state-and-lifecycle.html
      // SetState()のReference: https://ja.reactjs.org/docs/react-component.html#setstate
      // Note: おそらく、choice: newchoiceではなく、deep copyを作る必要。historyの話。
      this.setState((state) => {
        return {
          choice: {
            character: {
              team: newchoice.character.team,
              name: newchoice.character.name
            },
            location: newchoice.location
          }
        }
      });
    }else if(this.state.choice != null){ // すでにsourceが選択済みならtargetを選択
      // TODO: sourceが動けるところか。 この関数にもちゴマ投入の動ける場所も書く？
      if (! this.getMovable(this.state.choice).includes(newchoice.location)){
        return
      }
      // TODO: targetに相手ゴマいるか。いるなら自ストックに加える処理。このときzero/one_stockをincrementすること。
      // キャラがいない、かつ、相手チーム
      let is_take_opponent = (newchoice.character != null) && this.state.zeroIsNext != (newchoice.character.team == 0)
      // TODO: sourceがもちゴマなら、squaresからdeleteして、zero/one_stockをdecrementすること。
      let is_from_stock = this.state.choice.location >= board_size;
      this.setState(function(state) {
        // thisでなくstateからもらうのでは？
        const history = state.history.slice(0, state.stepNumber + 1);
        const current = history[history.length - 1];
        // Need deep copy
        // See: https://js.plainenglish.io/how-to-deep-copy-objects-and-arrays-in-javascript-7c911359b089
        let squares = _.cloneDeep(current.squares);
        let zero_stock = current.zero_stock
        let one_stock = current.one_stock
        if (is_take_opponent){
          let insert_idx = state.zeroIsNext ? board_size + zero_stock : board_size + zero_stock + one_stock;
          // TODO: squaresでなくcurrentを入れるようにすればzero_stockをinsert関数内で実施可能
          squares = insertIntoSquares(squares, insert_idx, 
            {character: {name: squares[newchoice.location].character.name, team: !squares[newchoice.location].character.team}, location: insert_idx})
          if(state.zeroIsNext){
            zero_stock += 1
          }else{
            one_stock += 1
          }
        }else if(is_from_stock){
          squares = removeFromSquares(squares, state.choice.location);
          if(state.zeroIsNext){
            zero_stock -= 1
          }else{
            one_stock -= 1
          }
        }
        // state.choice.target.character = state.choice.character;
        // state.choice.character = null;
        squares[newchoice.location].character = {
          team: state.choice.character.team,
          name: state.choice.character.name
        }
        if(!is_from_stock){
          squares[state.choice.location].character = null;
        }

        return {
          // これもimmutableな書き方？
          history: history.concat(
          [{
            squares: squares,
            zero_stock: zero_stock,
            one_stock: one_stock
          }] 
          ),
          stepNumber: history.length,
          zeroIsNext: !state.zeroIsNext,
          choice: null
        };
      })
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
      status = 'Next player: ' + (this.state.zeroIsNext ? '0': '1');

    }
    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            zero_stock={current.zero_stock}
            one_stock={current.one_stock}
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
  let is_zero_leader_alive = squares.some(
    (element, index, array) => {
      return element.character ? role_map[element.character.name] == 'ou' && element.character.team == 0 : false;
    }
  );
  let is_one_leader_alive = squares.some(
    (element, index, array) => {
      return element.character ? role_map[element.character.name] == 'ou' && element.character.team == 1 : false;
    }
  );
  if (is_one_leader_alive) {
    if (is_zero_leader_alive) {
      return null;
    }else{
      return '1';
    }
  }else{
    if(is_zero_leader_alive) {
      return '0'
    }else{
      return null;
    }
  }
}
function idxToPosition(idx) {
  let res = {x: idx % 3, y: idx / 3 | 0}
  return res
}
function positionToidx(x, y) {
  return 3 * y + x
}

function insertIntoSquares(array, index, newItem) {
  // locationを修正する点が異なる。
  return [
      ...array.slice(0, index),
      newItem,
      ...array.slice(index).map(item => {return {character: item.character, location: item.location + 1}})
  ];
}
function removeFromSquares(array, index) {
  return [
    ...array.slice(0, index),
    ...array.slice(index + 1).map(item =>

      {return {character: item.character, location: item.location - 1}}
      )
  ]
}

