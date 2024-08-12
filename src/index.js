import React,{useEffect, useState} from 'react';
import ReactDOM from "react-dom";
import io from 'socket.io-client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import useSound from 'use-sound';
import squareSound from './music/mixkit-retro-game-notification-212.mp3';
import buttonSound from './music/mixkit-click-melodic-tone-1129.mp3'
import connectionSound from './music/smile-ringtone.mp3'
import victorySound from './music/mixkit-ethereal-fairy-win-sound-2019.mp3'
import defeatSound from './music/failure-1-89170.mp3'

const socket = io('ws://127.0.0.1:8080');
let msgReceived;
let MyUser






function calculateEndgame(squares) {

  let square = 0
  for (let i = 0; i < squares.length; i++) {
    if (squares[i]!= null) {
      square = square + 1
    }
  }
  if (square === squares.length){
    return true;
  } else {
    return false;
  }
  
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

function Square(props) {
  
  
    return (
      <button className={`square ${props.animateSquare ? "animation" : ""}`} onClick={props.onClick} onAnimationEnd={props.EndAnimation}>
        {props.value}
      </button>
    );
}

function Board(props) {    

    function renderSquare(i) {
      return <Square value={props.squares[i]} onClick = {()=> props.onClick(i) } animateSquare={props.animateSquare[i]} EndAnimation={()=>props.EndAnimation(i)}/>;
    }

    return (
      <div>
        <div>
          <div className="board-row">
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
          </div>
          <div className="board-row">
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
          </div>
          <div className="board-row">
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
          </div>
        </div>

        
      </div>
    );
  }

function Game() {

    const [animatedSquares, setAnimatedSquares] = useState(Array(9).fill(false));
    const [squares, setSquares] = useState(Array(9).fill(null));
    const [isNext, setIsNext] = useState(true);

    const [alluser, setAlluser] = useState([{}]);
    
    const [pressed, setPressed] = useState(false);
    //const [soundUsed, setSoundUsed] = React.useState(false);

    const [user, setUser] = useState({});

    const [playSquareSound] = useSound(
      squareSound,
      { volume: 0.25 }
    );

    const [playButtonSound] = useSound(
      buttonSound,
      { volume: 0.25 }
    );

    const [playConnectionSound] = useSound(
      connectionSound,
      { volume: 0.25 }
    );
    
    const [playVictorySound] = useSound(
      victorySound,
      { volume: 0.25 }
    );

    const [playDefeatSound] = useSound(
      defeatSound,
      { volume: 0.25 }
    );

    useEffect(()=>{
      socket.on('connect', () => {
        console.log('Connected to server');
      });
  
      if (socket.active){
        socket.on('GameEvent', (msgJSON) => {
          msgReceived = JSON.parse(msgJSON)
          //console.log(msgReceived)
          setSquares(msgReceived.squares)
          setIsNext(msgReceived.isNext)
        });

        socket.on('UserEvent', (msgJSON) => {
          msgReceived = JSON.parse(msgJSON)
          //console.log("UserEvent ", msgReceived)
          const NewAllUser = []
          for (const [key, value] of Object.entries(msgReceived)) {
            console.log(`${key}: ${value}`);
            NewAllUser.push(msgReceived[key])
          }   
          //console.log(NewAllUser)
          setAlluser(NewAllUser)
          playConnectionSound();
        });
    
        socket.on('disconnect', () => {
          console.log('Disconnected from server');
        });
      }
      
    },[alluser,playConnectionSound,playSquareSound])

    function handleUsername(event) {
      MyUser = user
      MyUser["name"]=event.target.value
      setUser(MyUser)
    }
    function handleSide(event) {
      MyUser = user
      MyUser["side"]=event.target.value
      setUser(MyUser)
    }

    function handleSubmit(event) {
      event.preventDefault();
      setPressed(true)

      let msg ={
        "type" : "userevent", 
        "name" : user["name"],
        "side" : user["side"]   
      }
      let msgJSON = JSON.stringify(msg)
      socket.send(msgJSON);
    }
    
    function HandleEndAnimation(i){
      const CurrentSquaresAnimated = animatedSquares.slice();
      CurrentSquaresAnimated[i] = false
      setAnimatedSquares(CurrentSquaresAnimated)

    }


    function HandleClick(i){
      const CurrentSquares = squares.slice();
      const CurrentSquaresAnimated = animatedSquares.slice();
      let CurrentSide = isNext ? '🍌' : '🍕';
      if (calculateWinner(CurrentSquares) || CurrentSquares[i] || (CurrentSide !== user["side"])) {
        return;
      }
      CurrentSquares[i] = isNext ? '🍌' : '🍕';
      setSquares(CurrentSquares);
      setIsNext(!isNext)
      CurrentSquaresAnimated[i] = true
      setAnimatedSquares(CurrentSquaresAnimated)
      playSquareSound();

      let msg ={
        "type" : "gameevent",
        "game": {
          "squares" : CurrentSquares,
          "isNext" : !isNext 
        }       
      }
      let msgJSON = JSON.stringify(msg)
      socket.send(msgJSON);
    }

    function HandleRestart(){
      setSquares(Array(9).fill(null));
      setIsNext(true)
      playButtonSound();

      let msg = {
        "type" : "gameevent",
        "game": {
          "squares" : Array(9).fill(null),
          "isNext" : true 
        }   
      }

      let msgJSON = JSON.stringify(msg)
      socket.send(msgJSON);
    }

    const winner = calculateWinner(squares);
    const endgame = calculateEndgame(squares);
    let status;
    if (winner) {
      status = winner + 'won';
    } else if (endgame) {
      status = 'end of the game';
    } else {
      status = 'Next player : ' + (isNext ? '🍌' : '🍕');
    }
    
    return (
      <div>
        {
          
          !pressed ?
          
          <div>
            <form onSubmit = {handleSubmit}>
              <label>
                Name: 
              </label>
              <input onChange = {handleUsername} value = {user["name"]}></input>
              
              <div>
                <input type="radio" id="banana" name="drone" value="🍌" onChange = {handleSide} />
                <label for="banana">🍌</label>
              </div>

              <div>
                <input type="radio" id="pizza" name="drone" value="🍕" onChange = {handleSide} />
                <label for="pizza">🍕</label>
              </div>

              <div>
                <input type="radio" id="eye" name="drone" value="👀" onChange = {handleSide} />
                <label for="eye">👀</label>
              </div>
              <button type = 'submit'>Click to submit</button>
              
            </form>
          </div>
          :
          <div>
          <div className="game">
            
            <div className="game-board">
              <Board
                EndAnimation={(i)=>HandleEndAnimation(i)}
                animateSquare={animatedSquares} 
                squares={squares}
                onClick={(i)=>HandleClick(i)}
              />
            </div>
            <div className="game-info">
              {(winner) ? user["side"]===winner ? playVictorySound() : playDefeatSound() : ""} 
              <div>{status}</div>
              <ol>
                {
                  (winner || endgame) &&
                    <button onClick={()=>HandleRestart()}>
                      {"restart"}
                    </button>
                }
              </ol>
            </div>
          </div>
          <div className="game-info">{"you are player : " + user["name"] + ", team : "+ user["side"]}</div>
          <div className="user-info-gene"><div className="user-info">users info : <ul className="newul" >{alluser.map( user=>{return(<li>{user.name + " is connected, team : "+user.side}</li>);})}</ul></div></div>
          </div>  
        }
        
      </div>
    );
  }

// ========================================
  
// ========================================

const rootElement = document.getElementById("root");
ReactDOM.render(
    <BrowserRouter>
        <Game />
    </BrowserRouter>,
    rootElement
);
