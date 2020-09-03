import { Component, OnInit, ViewChild, ElementRef, Renderer2, HostListener } from '@angular/core';

export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  DOWN_ARROW = 40,
  UP_ARROW = 38
}

class Ghost {
  className: string;
  startIndex: number;
  speed: number;
  currentIndex: number;
  previousIndex: number;
  isScared: boolean;
  timerId: number;

  constructor(className, startIndex, speed) {
      this.className = className;
      this.startIndex = startIndex;
      this.speed = speed;
      this.currentIndex = startIndex;
      this.previousIndex = startIndex;
      this.isScared = false;
      this.timerId = 1000000;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'angular-pacman';
  width: number = 28;
  scoreValue = 0;
  
  // layout
  // legend
    // 0 - pac dot
    // 1 wall
    // 2 - ghost lair
    // 3 - power pellet
    // 4 - empty
  layout = [
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,
      1,3,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,3,1,
      1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,
      1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,
      1,1,1,1,1,1,0,1,1,4,4,4,4,4,4,4,4,4,4,1,1,0,1,1,1,1,1,1,
      1,1,1,1,1,1,0,1,1,4,1,1,1,2,2,1,1,1,4,1,1,0,1,1,1,1,1,1,
      1,1,1,1,1,1,0,1,1,4,1,2,2,2,2,2,2,1,4,1,1,0,1,1,1,1,1,1,
      4,4,4,4,4,4,0,0,0,4,1,2,2,2,2,2,2,1,4,0,0,0,4,4,4,4,4,4,
      1,1,1,1,1,1,0,1,1,4,1,2,2,2,2,2,2,1,4,1,1,0,1,1,1,1,1,1,
      1,1,1,1,1,1,0,1,1,4,1,1,1,1,1,1,1,1,4,1,1,0,1,1,1,1,1,1,
      1,1,1,1,1,1,0,1,1,4,1,1,1,1,1,1,1,1,4,1,1,0,1,1,1,1,1,1,
      1,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,1,
      1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,
      1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,
      1,3,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,3,1,
      1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1,
      1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1,
      1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1,
      1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,
      1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
  ]

  squares = [];
  pacmanCurrentIndex = 490;
  ghosts = [
    new Ghost('blinky', 348, 300),
    new Ghost('pinky', 376, 400),
    new Ghost('inky', 351, 320),
    new Ghost('clyde', 379, 500)
  ]
  timeInterval;

  @ViewChild('grid') grid: ElementRef;
  @ViewChild('score') score: ElementRef;
  @ViewChild('result') result: ElementRef;
  
  @HostListener('document:keyup', ['$event'])
  KeyUpEvent(event: KeyboardEvent) {
    this.renderer.removeClass(this.squares[this.pacmanCurrentIndex], 'pac-man');
    if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
      if(
          this.pacmanCurrentIndex - this.width >= 0 &&
          !this.squares[this.pacmanCurrentIndex + 1].classList.contains('wall') &&
          !this.squares[this.pacmanCurrentIndex + 1].classList.contains('ghost-lair')
      )
      this.pacmanCurrentIndex += 1
      if ( this.squares[this.pacmanCurrentIndex +1] === this.squares[392]) {
          this.pacmanCurrentIndex = 364
      }
    }

    if (event.keyCode === KEY_CODE.LEFT_ARROW) {
      if(
        this.pacmanCurrentIndex % this.width !== 0 &&
        !this.squares[this.pacmanCurrentIndex - 1].classList.contains('wall') &&
        !this.squares[this.pacmanCurrentIndex - 1].classList.contains('ghost-lair')
      )
      this.pacmanCurrentIndex -= 1
      if ( this.squares[this.pacmanCurrentIndex -1] === this.squares[363]){
          this.pacmanCurrentIndex = 391
      }
    }

    if (event.keyCode === KEY_CODE.DOWN_ARROW) {
      if ( 
          this.pacmanCurrentIndex + this.width < this.width * this.width &&
          !this.squares[this.pacmanCurrentIndex + this.width].classList.contains('wall') &&
          !this.squares[this.pacmanCurrentIndex + this.width].classList.contains('ghost-lair') 
      )
      this.pacmanCurrentIndex += this.width
    }

    if (event.keyCode === KEY_CODE.UP_ARROW) {
      console.log("Up");
      if(
        this.pacmanCurrentIndex - this.width >= 0 &&
        !this.squares[this.pacmanCurrentIndex - this.width].classList.contains('wall') &&
        !this.squares[this.pacmanCurrentIndex - this.width].classList.contains('ghost-lair') 
      )
      this.pacmanCurrentIndex -= this.width
    }
    this.renderer.addClass(this.squares[this.pacmanCurrentIndex], 'pac-man');
    this.pacDotEaten();
    this.powerPelletEaten();
    this.checkForGameOver(this.squares, this.pacmanCurrentIndex);
    this.checkforWin();
  }
  
  constructor(private renderer: Renderer2, private elem: ElementRef){

  }

  createBoard(){
    for (let i = 0; i < this.layout.length; i++){
        const square = this.renderer.createElement('div');
        this.renderer.appendChild(this.grid.nativeElement, square);
        this.squares.push(square)
        
        if(this.layout[i] === 0){
          this.renderer.addClass(this.squares[i], 'pac-dot');
        } else if (this.layout[i] === 1){
          this.renderer.addClass(this.squares[i], 'wall');
        } else if (this.layout[i] === 2) {
          this.renderer.addClass(this.squares[i], 'ghost-lair');
        } else if (this.layout[i] === 3){
          this.renderer.addClass(this.squares[i], 'power-pellet');
        }
    }
  }

  ngOnInit() {
    
  }

  initGhosts(){
    this.ghosts.forEach(ghost =>{
      this.squares[ghost.currentIndex].classList.add('ghost');
      this.squares[ghost.currentIndex].classList.add(ghost.className);
      this.moveGhost(ghost);
    });

  }

  moveGhost(ghost:Ghost) {
    //console.log("reach ghost move" + ghost.className);
    //set time interval based on speed
    ghost.timerId = setInterval( () => {
        //remove ghost from curr location
      this.squares[ghost.currentIndex].classList.remove('ghost');
      this.squares[ghost.currentIndex].classList.remove(ghost.className);
      //first stage : helping ghost moving out of lair
      if(ghost.className != "clyde" && this.squares[ghost.currentIndex].classList.contains('ghost-lair')){
        this.moveGhostOut(ghost);
      }
      //second stage : helping ghost moving in the grid    
      else if (ghost.className === "blinky")
      {//strategy1 try moving up first if failing, try moving right then left then down
        this.moveGhostUpRightLeftDown(ghost);
      }
      else if (ghost.className === "pinky")
      {//strategy2 try moving randomly
        this.moveGhostRandom(ghost);
      }
      else if (ghost.className === "inky")
      {//strategy3 chasing pac-man
        this.moveGhostChase(ghost);
      }
      //add ghost to new location
      this.squares[ghost.currentIndex].classList.add('ghost');
      this.squares[ghost.currentIndex].classList.add(ghost.className);
    },ghost.speed*3);

  }

  moveGhostOut(ghost:Ghost) {
    if(ghost.currentIndex%this.width<=12){//move right
      ghost.currentIndex += 1;}
    else if(ghost.currentIndex%this.width>=15){//move left
      ghost.currentIndex -= 1;}
    else {//move upper
      ghost.currentIndex -= this.width;
    }
  }

  moveGhostUpRightLeftDown(ghost:Ghost) {
    if(!this.squares[ghost.currentIndex - this.width].classList.contains('wall')
              && (ghost.currentIndex - this.width != ghost.previousIndex)
      )
        {
          ghost.previousIndex = ghost.currentIndex;
          ghost.currentIndex -= this.width;
          //console.log("ghost Blinky able to move up" + ghost.currentIndex);
        }
      else if (!this.squares[ghost.currentIndex + 1].classList.contains('wall')
      && (ghost.currentIndex +1 != ghost.previousIndex)
      ){
        ghost.previousIndex = ghost.currentIndex;
        ghost.currentIndex += 1;
      }
      else if (!this.squares[ghost.currentIndex - 1].classList.contains('wall')
      && (ghost.currentIndex - 1 != ghost.previousIndex)
      ){
        ghost.previousIndex = ghost.currentIndex;
        ghost.currentIndex -= 1;
      }
      else if (!this.squares[ghost.currentIndex + this.width].classList.contains('wall')
      && (ghost.currentIndex + this.width != ghost.previousIndex)
      ){
        ghost.previousIndex = ghost.currentIndex;
        ghost.currentIndex += this.width;
      }

  }

  moveGhostRandom(ghost:Ghost) {
    const directions = [-1, +1, -this.width, +this.width];
    let direction = directions[Math.floor(Math.random() * directions.length)];
    console.log(direction);
    if (
      !this.squares[ghost.currentIndex + direction].classList.contains('wall') &&
      !this.squares[ghost.currentIndex + direction].classList.contains('ghost-lair')
    ) {//add direction to current Index
    ghost.previousIndex = ghost.currentIndex;
    ghost.currentIndex += direction;
  }
}
moveGhostChase(ghost:Ghost) {
  let directionsOrder = [];
  console.log("ghost: inky chase");
  //let direction = directions[Math.floor(Math.random() * directions.length)];
  if ((ghost.currentIndex % this.width) <= (this.pacmanCurrentIndex % this.width)//to right
    && (ghost.currentIndex/this.width) <= (this.pacmanCurrentIndex/this.width)//down
    ){
      directionsOrder = [+1,+this.width,-1,-this.width];     
  }
  else if (
    (ghost.currentIndex % this.width) >= (this.pacmanCurrentIndex % this.width)//left
  && (ghost.currentIndex/this.width) <= (this.pacmanCurrentIndex/this.width)//down
  ){
    directionsOrder = [-1,+this.width,+1,-this.width];     
  }
  else if (
  (ghost.currentIndex % this.width) >= (this.pacmanCurrentIndex % this.width)//left
  && (ghost.currentIndex/this.width) >= (this.pacmanCurrentIndex/this.width)//up
  ){directionsOrder = [-1,-this.width,+1,+this.width];     
  }
  else {directionsOrder = [+1,+this.width,-1,-this.width];} 
  //directionsOrder.forEach(direction => {
  for ( let i=0;i<4;i++){
    let direction = directionsOrder[i];
    if (ghost.currentIndex + direction != ghost.previousIndex &&
      !this.squares[ghost.currentIndex + direction].classList.contains('wall') &&
        !this.squares[ghost.currentIndex + direction].classList.contains('ghost-lair')
      ){
      ghost.previousIndex = ghost.currentIndex;
      ghost.currentIndex += direction;
      console.log("ghost: inky chase moving direction  "+ direction);
      break;
      }
  }
}
moveGhostChase2(ghost:Ghost) {
  let direction = 0;
  console.log("ghost: inky chase");
  let test = 0;
  //let direction = directions[Math.floor(Math.random() * directions.length)];
  while (test < 5){
    if (direction != 1 && (ghost.currentIndex % this.width) < (this.pacmanCurrentIndex % this.width)//to right
    ){
      console.log(direction);
      direction = 1;}
    if (direction != -1 && (ghost.currentIndex % this.width) >= (this.pacmanCurrentIndex % this.width)//left
    ){console.log(direction);
      direction = -1;}
    if (direction != -this.width && (ghost.currentIndex/this.width) >= (this.pacmanCurrentIndex/this.width)//up
    ){console.log(direction);
      direction = -this.width;}
    if (direction != +this.width && (ghost.currentIndex/this.width) < (this.pacmanCurrentIndex/this.width)//up
    ){console.log(direction);
      direction = +this.width;}
    if (!this.squares[ghost.currentIndex + direction].classList.contains('wall') &&
        !this.squares[ghost.currentIndex + direction].classList.contains('ghost-lair')
      ){
        ghost.previousIndex = ghost.currentIndex;
        ghost.currentIndex += direction;
        console.log("ghost: inky chase moving direction  "+ direction);
        break;
      }
    test += 1;
}
}


  checkForGameOver(squaresX, pacmanCurrentIndexX) {
      if (squaresX[pacmanCurrentIndexX].classList.contains('ghost') &&
          !squaresX[pacmanCurrentIndexX].classList.contains('scared-ghost')
      ) {
        this.ghosts.forEach(ghost=> clearInterval(ghost.timerId))
        this.KeyUpEvent = function() : void {};
        this.result.nativeElement.innerHTML = "Game Over!";
      }

  }

  checkforWin() {
    if(this.scoreValue === 274) {
        this.ghosts.forEach(ghost => clearInterval(ghost.timerId))
        this.KeyUpEvent = function() : void {};
        this.result.nativeElement.innerHTML = "You have Won!";
    }
  }

  ngAfterViewInit() {
    // create the pac man board
    this.createBoard();
    this.renderer.addClass(this.squares[this.pacmanCurrentIndex], 'pac-man');
    this.initGhosts();
  }

  pacDotEaten() {
      if( this.squares[this.pacmanCurrentIndex].classList.contains('pac-dot')) {
          this.scoreValue++
          this.score.nativeElement.innerHTML = this.scoreValue;
          this.squares[this.pacmanCurrentIndex].classList.remove('pac-dot');
      }
  }

  powerPelletEaten() {
      if( this.squares[this.pacmanCurrentIndex].classList.contains('power-pellet')) {
          this.scoreValue+=10
          this.score.nativeElement.innerHTML = this.scoreValue;
          this.ghosts.forEach(ghost => ghost.isScared = true)
          setTimeout(()=>{
            this.ghosts.forEach(ghost => {
                ghost.isScared = false
                this.squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost')
                ghost.currentIndex = ghost.startIndex
                this.squares[ghost.currentIndex].classList.add(ghost.className, 'ghost')
            })
          }, 10000)
          this.squares[this.pacmanCurrentIndex].classList.remove('power-pellet');
      }
  }
}
